-- ============================================================================
-- Query 10: Cumulative Running Total Revenue Over Time
-- Business Purpose: Track pace toward annual sales targets and revenue velocity.
-- Concepts: DATE_TRUNC, Window SUM() OVER (ORDER BY ... ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
-- ============================================================================

WITH monthly_sales AS (
    SELECT 
        DATE_TRUNC('month', transaction_date::DATE) AS month,
        ROUND(SUM(amount)::NUMERIC, 2) AS monthly_revenue
    FROM transactions
    WHERE transaction_type = 'Income' 
      AND status = 'Completed'
    GROUP BY DATE_TRUNC('month', transaction_date::DATE)
)
SELECT 
    month,
    monthly_revenue,
    ROUND(
        SUM(monthly_revenue) OVER (ORDER BY month ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)::NUMERIC, 
        2
    ) AS cumulative_running_revenue
FROM monthly_sales
ORDER BY month ASC;
