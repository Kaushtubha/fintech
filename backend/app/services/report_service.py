"""
FinSight Automated Financial Reporting Service
Generates monthly intelligence summaries with dynamic algorithmic insights,
comparative period deltas, and audit summaries.
"""

from typing import Optional
from backend.app.database import execute_query


class ReportService:

    @staticmethod
    def generate_monthly_report(month: Optional[str] = None) -> dict:
        """
        Generates a comprehensive monthly performance report.
        If month is not provided (e.g. '2026-05'), defaults to the latest complete month.
        """
        if not month:
            latest_res = execute_query("""
                SELECT strftime(DATE_TRUNC('month', MAX(transaction_date::DATE)), '%Y-%m') AS latest_month 
                FROM transactions;
            """)
            month = latest_res[0]["latest_month"] if latest_res else "2026-05"

        # Monthly metrics for current month
        current_sql = f"""
            SELECT 
                COUNT(*) AS total_txns,
                ROUND(SUM(CASE WHEN transaction_type = 'Income' AND status = 'Completed' THEN amount ELSE 0 END), 2) AS income,
                ROUND(SUM(CASE WHEN transaction_type = 'Expense' AND status = 'Completed' THEN amount ELSE 0 END), 2) AS expenses,
                ROUND(SUM(CASE WHEN status = 'Completed' THEN (CASE WHEN transaction_type = 'Income' THEN amount ELSE -amount END) ELSE 0 END), 2) AS net_cash_flow,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed_txns,
                SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) AS failed_txns,
                SUM(CASE WHEN status = 'Reversed' THEN 1 ELSE 0 END) AS reversed_txns,
                ROUND(SUM(CASE WHEN status = 'Reversed' THEN amount ELSE 0 END), 2) AS reversal_amount,
                ROUND(100.0 * SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) / COUNT(*), 2) AS success_rate_pct
            FROM transactions
            WHERE strftime(DATE_TRUNC('month', transaction_date::DATE), '%Y-%m') = '{month}';
        """
        curr = execute_query(current_sql)[0]

        # Prior month for MoM comparison
        prior_sql = f"""
            SELECT 
                ROUND(SUM(CASE WHEN transaction_type = 'Income' AND status = 'Completed' THEN amount ELSE 0 END), 2) AS prev_income,
                ROUND(SUM(CASE WHEN transaction_type = 'Expense' AND status = 'Completed' THEN amount ELSE 0 END), 2) AS prev_expenses,
                ROUND(SUM(CASE WHEN status = 'Completed' THEN (CASE WHEN transaction_type = 'Income' THEN amount ELSE -amount END) ELSE 0 END), 2) AS prev_net_cash_flow
            FROM transactions
            WHERE strftime(DATE_TRUNC('month', transaction_date::DATE), '%Y-%m') = 
                  strftime(DATE_TRUNC('month', ('{month}-01'::DATE - INTERVAL 1 MONTH)), '%Y-%m');
        """
        prior_res = execute_query(prior_sql)
        prior = prior_res[0] if prior_res else {"prev_income": 0, "prev_expenses": 0, "prev_net_cash_flow": 0}

        # Calculate MoM Deltas
        curr_inc = float(curr.get("income") or 0.0)
        prev_inc = float(prior.get("prev_income") or 0.0)
        inc_change_pct = round(((curr_inc - prev_inc) / prev_inc) * 100.0, 2) if prev_inc > 0 else 0.0

        curr_exp = float(curr.get("expenses") or 0.0)
        prev_exp = float(prior.get("prev_expenses") or 0.0)
        exp_change_pct = round(((curr_exp - prev_exp) / prev_exp) * 100.0, 2) if prev_exp > 0 else 0.0

        curr_net = float(curr.get("net_cash_flow") or 0.0)
        prev_net = float(prior.get("prev_net_cash_flow") or 0.0)
        net_diff = round(curr_net - prev_net, 2)

        # Top Income Categories
        top_income_cats = execute_query(f"""
            SELECT category, ROUND(SUM(amount), 2) AS revenue, COUNT(*) AS count
            FROM transactions
            WHERE strftime(DATE_TRUNC('month', transaction_date::DATE), '%Y-%m') = '{month}'
              AND transaction_type = 'Income' AND status = 'Completed'
            GROUP BY category
            ORDER BY revenue DESC
            LIMIT 3;
        """)

        # Top Expense Categories
        top_expense_cats = execute_query(f"""
            SELECT category, ROUND(SUM(amount), 2) AS spend, COUNT(*) AS count
            FROM transactions
            WHERE strftime(DATE_TRUNC('month', transaction_date::DATE), '%Y-%m') = '{month}'
              AND transaction_type = 'Expense' AND status = 'Completed'
            GROUP BY category
            ORDER BY spend DESC
            LIMIT 3;
        """)

        # Unusual transactions in month
        unusual_txns = execute_query(f"""
            SELECT transaction_id, transaction_date, category, amount, customer_id, merchant, status
            FROM transactions
            WHERE strftime(DATE_TRUNC('month', transaction_date::DATE), '%Y-%m') = '{month}'
              AND (amount > 150000.0 OR status = 'Reversed')
            ORDER BY amount DESC
            LIMIT 5;
        """)

        # Dynamically generate algorithmic key observations based on actual calculated values
        insights = []

        # Revenue Observation
        if inc_change_pct > 0:
            insights.append(
                f"Revenue expanded by {inc_change_pct}% compared to the previous period, reaching ₹{curr_inc:,.2f}."
            )
        else:
            insights.append(
                f"Revenue contracted by {abs(inc_change_pct)}% compared to the previous period, settling at ₹{curr_inc:,.2f}."
            )

        # Expense and Cash Flow Observation
        if exp_change_pct > inc_change_pct:
            insights.append(
                f"Operating expenses increased by {exp_change_pct}%, outpacing revenue growth ({inc_change_pct}%). "
                f"This narrowed the monthly net cash flow delta by ₹{abs(net_diff):,.2f}."
            )
        else:
            insights.append(
                f"Revenue growth of {inc_change_pct}% outpaced expense changes ({exp_change_pct}%), "
                f"delivering an improved net cash contribution delta of ₹{net_diff:,.2f}."
            )

        # Category Drivers
        if top_income_cats:
            top_cat = top_income_cats[0]
            insights.append(
                f"Core revenue was anchored by '{top_cat['category']}', accounting for ₹{top_cat['revenue']:,.2f} "
                f"across {top_cat['count']:,} completed transactions."
            )

        if top_expense_cats:
            top_exp = top_expense_cats[0]
            insights.append(
                f"Largest expenditure driver was '{top_exp['category']}' totaling ₹{top_exp['spend']:,.2f}."
            )

        # Payment Health
        success_rate = float(curr.get("success_rate_pct") or 0.0)
        failed_count = int(curr.get("failed_txns") or 0)
        reversal_amt = float(curr.get("reversal_amount") or 0.0)
        insights.append(
            f"Payment gateways recorded a {success_rate}% completion rate with {failed_count} dropped requests. "
            f"Reversals and dispute claims stood at ₹{reversal_amt:,.2f}."
        )

        return {
            "period": month,
            "summary": {
                "income": curr_inc,
                "expenses": curr_exp,
                "net_cash_flow": curr_net,
                "total_transactions": curr.get("total_txns"),
                "success_rate_pct": success_rate,
                "failed_transactions": failed_count,
                "reversals_amount": reversal_amt,
                "mom_income_growth_pct": inc_change_pct,
                "mom_expense_growth_pct": exp_change_pct,
                "net_cash_flow_diff": net_diff,
            },
            "top_income_categories": top_income_cats,
            "top_expense_categories": top_expense_cats,
            "unusual_transactions": unusual_txns,
            "key_observations": insights,
        }
