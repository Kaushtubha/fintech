"""
FinSight Financial Analytics Service
Calculates verified business metrics, trends, breakdowns, and aggregations
applying strict accounting rules (excluding failed/pending/reversed from cash flow).
"""

from typing import Optional
from backend.app.database import execute_query


def build_filter_clauses(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
    payment_method: Optional[str] = None,
    status: Optional[str] = None,
    region: Optional[str] = None,
    search: Optional[str] = None,
) -> tuple[str, list]:
    conditions = []
    params = []

    if start_date:
        conditions.append("transaction_date >= ?")
        params.append(start_date)
    if end_date:
        conditions.append("transaction_date <= ?")
        params.append(end_date)
    if category:
        conditions.append("category = ?")
        params.append(category)
    if payment_method:
        conditions.append("payment_method = ?")
        params.append(payment_method)
    if status:
        conditions.append("status = ?")
        params.append(status)
    if region:
        conditions.append("region = ?")
        params.append(region)
    if search:
        search_pattern = f"%{search}%"
        conditions.append("(transaction_id LIKE ? OR customer_id LIKE ? OR merchant LIKE ?)")
        params.extend([search_pattern, search_pattern, search_pattern])

    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""
    return where_clause, params


class AnalyticsService:

    @staticmethod
    def get_dashboard_summary(
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        category: Optional[str] = None,
        payment_method: Optional[str] = None,
        region: Optional[str] = None,
    ) -> dict:
        where_clause, params = build_filter_clauses(
            start_date=start_date,
            end_date=end_date,
            category=category,
            payment_method=payment_method,
            region=region,
        )

        sql = f"""
            WITH base AS (
                SELECT * FROM transactions {where_clause}
            ),
            metrics AS (
                SELECT 
                    COUNT(*) AS total_transactions,
                    COUNT(DISTINCT customer_id) AS unique_customers,
                    SUM(CASE WHEN status = 'Completed' AND transaction_type = 'Income' THEN amount ELSE 0 END) AS total_income,
                    SUM(CASE WHEN status = 'Completed' AND transaction_type = 'Expense' THEN amount ELSE 0 END) AS total_expenses,
                    SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed_txns,
                    SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) AS failed_txns,
                    SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_txns,
                    SUM(CASE WHEN status = 'Reversed' THEN 1 ELSE 0 END) AS reversed_txns,
                    SUM(CASE WHEN status = 'Reversed' THEN amount ELSE 0 END) AS reversal_amount,
                    AVG(CASE WHEN status = 'Completed' THEN amount ELSE NULL END) AS avg_completed_txn_value
                FROM base
            )
            SELECT 
                total_transactions,
                unique_customers,
                ROUND(total_income, 2) AS total_income,
                ROUND(total_expenses, 2) AS total_expenses,
                ROUND(total_income - total_expenses, 2) AS net_cash_flow,
                ROUND(
                    CASE WHEN total_income > 0 THEN ((total_income - total_expenses) / total_income) * 100.0 ELSE 0.0 END, 
                    2
                ) AS net_cash_margin_pct,
                completed_txns,
                failed_txns,
                pending_txns,
                reversed_txns,
                ROUND(reversal_amount, 2) AS reversal_amount,
                ROUND(
                    CASE WHEN total_transactions > 0 THEN (completed_txns * 100.0 / total_transactions) ELSE 0.0 END, 
                    2
                ) AS success_rate_pct,
                ROUND(COALESCE(avg_completed_txn_value, 0.0), 2) AS average_transaction_value
            FROM metrics;
        """

        result = execute_query(sql, params)
        if not result:
            return {}

        summary = result[0]

        # Calculate MoM growth for context
        growth_sql = f"""
            WITH monthly AS (
                SELECT 
                    DATE_TRUNC('month', transaction_date::DATE) AS month,
                    SUM(CASE WHEN transaction_type = 'Income' AND status = 'Completed' THEN amount ELSE 0 END) AS income,
                    SUM(CASE WHEN transaction_type = 'Expense' AND status = 'Completed' THEN amount ELSE 0 END) AS expense
                FROM transactions {where_clause}
                GROUP BY DATE_TRUNC('month', transaction_date::DATE)
                ORDER BY month DESC
                LIMIT 2
            )
            SELECT 
                month,
                income,
                expense,
                LEAD(income) OVER (ORDER BY month DESC) AS prev_income,
                LEAD(expense) OVER (ORDER BY month DESC) AS prev_expense
            FROM monthly;
        """
        growth_res = execute_query(growth_sql, params)
        income_growth_pct = 0.0
        expense_growth_pct = 0.0
        if len(growth_res) > 0 and growth_res[0].get("prev_income") is not None:
            curr_inc = float(growth_res[0]["income"] or 0.0)
            prev_inc = float(growth_res[0]["prev_income"] or 0.0)
            if prev_inc > 0:
                income_growth_pct = round(((curr_inc - prev_inc) / prev_inc) * 100.0, 2)

            curr_exp = float(growth_res[0]["expense"] or 0.0)
            prev_exp = float(growth_res[0]["prev_expense"] or 0.0)
            if prev_exp > 0:
                expense_growth_pct = round(((curr_exp - prev_exp) / prev_exp) * 100.0, 2)

        summary["income_growth_pct"] = income_growth_pct
        summary["expense_growth_pct"] = expense_growth_pct

        return summary

    @staticmethod
    def get_trends(
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        category: Optional[str] = None,
        region: Optional[str] = None,
    ) -> list[dict]:
        where_clause, params = build_filter_clauses(
            start_date=start_date,
            end_date=end_date,
            category=category,
            region=region,
        )

        sql = f"""
            WITH monthly AS (
                SELECT 
                    strftime(DATE_TRUNC('month', transaction_date::DATE), '%Y-%m') AS month,
                    COUNT(transaction_id) AS total_count,
                    ROUND(SUM(CASE WHEN transaction_type = 'Income' AND status = 'Completed' THEN amount ELSE 0 END), 2) AS income,
                    ROUND(SUM(CASE WHEN transaction_type = 'Expense' AND status = 'Completed' THEN amount ELSE 0 END), 2) AS expenses,
                    ROUND(SUM(CASE WHEN status = 'Completed' THEN (CASE WHEN transaction_type = 'Income' THEN amount ELSE -amount END) ELSE 0 END), 2) AS net_cash_flow
                FROM transactions {where_clause}
                GROUP BY DATE_TRUNC('month', transaction_date::DATE)
                ORDER BY month ASC
            )
            SELECT 
                month,
                total_count,
                income,
                expenses,
                net_cash_flow,
                ROUND(LAG(income) OVER (ORDER BY month), 2) AS prev_month_income,
                ROUND(
                    CASE 
                        WHEN LAG(income) OVER (ORDER BY month) > 0 
                        THEN ((income - LAG(income) OVER (ORDER BY month)) / LAG(income) OVER (ORDER BY month)) * 100.0 
                        ELSE 0.0 
                    END, 2
                ) AS mom_income_growth_pct,
                ROUND(
                    CASE 
                        WHEN LAG(expenses) OVER (ORDER BY month) > 0 
                        THEN ((expenses - LAG(expenses) OVER (ORDER BY month)) / LAG(expenses) OVER (ORDER BY month)) * 100.0 
                        ELSE 0.0 
                    END, 2
                ) AS mom_expense_growth_pct
            FROM monthly
            ORDER BY month ASC;
        """
        return execute_query(sql, params)

    @staticmethod
    def get_revenue_analysis(
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        region: Optional[str] = None,
    ) -> dict:
        where_clause, params = build_filter_clauses(start_date=start_date, end_date=end_date, region=region)
        conn_where = f" AND {where_clause[7:]}" if where_clause else ""

        # Revenue by Category
        by_category = execute_query(f"""
            SELECT 
                category,
                COUNT(*) AS transaction_count,
                ROUND(SUM(amount), 2) AS total_revenue,
                ROUND(AVG(amount), 2) AS avg_transaction_value,
                ROUND(100.0 * SUM(amount) / SUM(SUM(amount)) OVER (), 2) AS percentage_share
            FROM transactions 
            WHERE transaction_type = 'Income' AND status = 'Completed' {conn_where}
            GROUP BY category
            ORDER BY total_revenue DESC;
        """, params)

        # Revenue by Region
        by_region = execute_query(f"""
            SELECT 
                region,
                COUNT(*) AS transaction_count,
                ROUND(SUM(amount), 2) AS total_revenue,
                ROUND(100.0 * SUM(amount) / SUM(SUM(amount)) OVER (), 2) AS percentage_share
            FROM transactions 
            WHERE transaction_type = 'Income' AND status = 'Completed' {conn_where}
            GROUP BY region
            ORDER BY total_revenue DESC;
        """, params)

        # Top 10 Customers
        top_customers = execute_query(f"""
            SELECT 
                customer_id,
                COUNT(*) AS orders_count,
                ROUND(SUM(amount), 2) AS total_spend,
                ROUND(AVG(amount), 2) AS avg_order_value
            FROM transactions 
            WHERE transaction_type = 'Income' AND status = 'Completed' AND customer_id != 'CUST_ANON' {conn_where}
            GROUP BY customer_id
            ORDER BY total_spend DESC
            LIMIT 10;
        """, params)

        return {
            "by_category": by_category,
            "by_region": by_region,
            "top_customers": top_customers,
        }

    @staticmethod
    def get_expense_analysis(
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        region: Optional[str] = None,
    ) -> dict:
        where_clause, params = build_filter_clauses(start_date=start_date, end_date=end_date, region=region)
        conn_where = f" AND {where_clause[7:]}" if where_clause else ""

        by_category = execute_query(f"""
            SELECT 
                category,
                COUNT(*) AS transaction_count,
                ROUND(SUM(amount), 2) AS total_expense,
                ROUND(AVG(amount), 2) AS avg_expense_size,
                ROUND(100.0 * SUM(amount) / SUM(SUM(amount)) OVER (), 2) AS percentage_share
            FROM transactions 
            WHERE transaction_type = 'Expense' AND status = 'Completed' {conn_where}
            GROUP BY category
            ORDER BY total_expense DESC;
        """, params)

        by_merchant = execute_query(f"""
            SELECT 
                merchant,
                category,
                COUNT(*) AS payment_count,
                ROUND(SUM(amount), 2) AS total_spent
            FROM transactions
            WHERE transaction_type = 'Expense' AND status = 'Completed' {conn_where}
            GROUP BY merchant, category
            ORDER BY total_spent DESC
            LIMIT 10;
        """, params)

        monthly_burn = execute_query(f"""
            SELECT 
                strftime(DATE_TRUNC('month', transaction_date::DATE), '%Y-%m') AS month,
                category,
                ROUND(SUM(amount), 2) AS amount
            FROM transactions
            WHERE transaction_type = 'Expense' AND status = 'Completed' {conn_where}
            GROUP BY DATE_TRUNC('month', transaction_date::DATE), category
            ORDER BY month ASC, amount DESC;
        """, params)

        return {
            "by_category": by_category,
            "by_merchant": by_merchant,
            "monthly_burn": monthly_burn,
        }

    @staticmethod
    def get_payment_analysis(
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> dict:
        where_clause, params = build_filter_clauses(start_date=start_date, end_date=end_date)

        by_channel = execute_query(f"""
            SELECT 
                payment_method,
                COUNT(*) AS total_transactions,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed_count,
                SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) AS failed_count,
                SUM(CASE WHEN status = 'Reversed' THEN 1 ELSE 0 END) AS reversed_count,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_count,
                ROUND(SUM(CASE WHEN status = 'Completed' THEN amount ELSE 0 END), 2) AS settled_volume,
                ROUND(SUM(CASE WHEN status = 'Failed' THEN amount ELSE 0 END), 2) AS failed_volume,
                ROUND(100.0 * SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) / COUNT(*), 2) AS success_rate_pct,
                ROUND(100.0 * SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) / COUNT(*), 2) AS failure_rate_pct,
                ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS volume_share_pct
            FROM transactions {where_clause}
            GROUP BY payment_method
            ORDER BY total_transactions DESC;
        """, params)

        by_status = execute_query(f"""
            SELECT 
                status,
                COUNT(*) AS count,
                ROUND(SUM(amount), 2) AS total_amount,
                ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS count_share_pct
            FROM transactions {where_clause}
            GROUP BY status
            ORDER BY count DESC;
        """, params)

        return {
            "by_channel": by_channel,
            "by_status": by_status,
        }

    @staticmethod
    def get_customer_analytics(
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> dict:
        where_clause, params = build_filter_clauses(start_date=start_date, end_date=end_date)
        conn_where = f" AND {where_clause[7:]}" if where_clause else ""

        top_customers = execute_query(f"""
            SELECT 
                customer_id,
                COUNT(*) AS orders_count,
                ROUND(SUM(amount), 2) AS total_revenue,
                ROUND(AVG(amount), 2) AS avg_order_size,
                MIN(transaction_date) AS first_seen,
                MAX(transaction_date) AS last_seen
            FROM transactions 
            WHERE transaction_type = 'Income' AND status = 'Completed' AND customer_id != 'CUST_ANON' {conn_where}
            GROUP BY customer_id
            ORDER BY total_revenue DESC
            LIMIT 25;
        """, params)

        pareto_summary = execute_query(f"""
            WITH customer_totals AS (
                SELECT 
                    customer_id,
                    SUM(amount) AS cust_rev
                FROM transactions 
                WHERE transaction_type = 'Income' AND status = 'Completed' AND customer_id != 'CUST_ANON' {conn_where}
                GROUP BY customer_id
            ),
            ranked AS (
                SELECT 
                    customer_id,
                    cust_rev,
                    ROW_NUMBER() OVER (ORDER BY cust_rev DESC) AS rank,
                    COUNT(*) OVER () AS total_custs,
                    SUM(cust_rev) OVER () AS total_rev,
                    SUM(cust_rev) OVER (ORDER BY cust_rev DESC) AS cum_rev
                FROM customer_totals
            )
            SELECT 
                ROUND(100.0 * MAX(CASE WHEN (cum_rev / total_rev) <= 0.80 THEN rank ELSE 0 END) / MAX(total_custs), 2) AS pct_customers_driving_80pct_rev,
                MAX(total_custs) AS total_unique_customers,
                ROUND(MAX(total_rev), 2) AS total_customer_revenue
            FROM ranked;
        """, params)

        return {
            "top_customers": top_customers,
            "pareto": pareto_summary[0] if pareto_summary else {},
        }
