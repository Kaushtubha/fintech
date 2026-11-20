-- ============================================================================
-- Query 17: Customer Concentration Pareto Analysis (80/20 Rule)
-- Business Purpose: Measure what % of customers generate 80% of total revenue.
-- Concepts: Multiple CTEs, Window Functions, Cumulative Percentages
-- ============================================================================

WITH customer_spend AS (
    SELECT 
        customer_id,
        ROUND(SUM(amount)::NUMERIC, 2) AS customer_revenue
    FROM transactions
    WHERE transaction_type = 'Income' 
      AND status = 'Completed'
      AND customer_id != 'CUST_ANON'
    GROUP BY customer_id
),
ranked_customers AS (
    SELECT 
        customer_id,
        customer_revenue,
        ROW_NUMBER() OVER (ORDER BY customer_revenue DESC) AS customer_rank,
        COUNT(*) OVER () AS total_customers_count,
        SUM(customer_revenue) OVER () AS total_platform_revenue,
        SUM(customer_revenue) OVER (ORDER BY customer_revenue DESC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_revenue
    FROM customer_spend
)
SELECT 
    customer_id,
    customer_rank,
    customer_revenue,
    ROUND(100.0 * customer_rank / total_customers_count, 2) AS pct_of_customer_base,
    ROUND(100.0 * running_revenue / total_platform_revenue, 2) AS cumulative_revenue_pct
FROM ranked_customers
WHERE customer_rank <= 25 OR (100.0 * running_revenue / total_platform_revenue) BETWEEN 79.0 AND 81.0
ORDER BY customer_rank ASC;
