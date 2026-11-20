-- ============================================================================
-- Query 04: Month-over-Month Revenue Growth Rate
-- Business Purpose: Track expansion velocity and revenue acceleration/deceleration.
-- Concepts: Common Table Expressions (CTE), DATE_TRUNC, Window LAG() OVER ()
-- ============================================================================

WITH monthly_revenue AS (
    SELECT 
        DATE_TRUNC('month', transaction_date::DATE) AS month,
        ROUND(SUM(amount)::NUMERIC, 2) AS revenue
    FROM transactions
    WHERE transaction_type = 'Income' 
      AND status = 'Completed'
    GROUP BY DATE_TRUNC('month', transaction_date::DATE)
)
SELECT 
    month,
    revenue,
    LAG(revenue, 1) OVER (ORDER BY month) AS prev_month_revenue,
    ROUND(
        (revenue - LAG(revenue, 1) OVER (ORDER BY month)) / 
        NULLIF(LAG(revenue, 1) OVER (ORDER BY month), 0) * 100.0, 
        2
    ) AS mom_growth_pct
FROM monthly_revenue
ORDER BY month ASC;
