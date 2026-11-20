-- ============================================================================
-- Query 07: Revenue Breakdown by Category with Cumulative Contribution
-- Business Purpose: Identify core revenue pillars and concentration.
-- Concepts: CTE, SUM() OVER (), Percentage of Total, Running Total
-- ============================================================================

WITH cat_totals AS (
    SELECT 
        category,
        COUNT(transaction_id) AS transaction_count,
        ROUND(SUM(amount)::NUMERIC, 2) AS total_revenue
    FROM transactions
    WHERE transaction_type = 'Income'
      AND status = 'Completed'
    GROUP BY category
)
SELECT 
    category,
    transaction_count,
    total_revenue,
    ROUND(100.0 * total_revenue / SUM(total_revenue) OVER (), 2) AS pct_of_total_revenue,
    ROUND(
        100.0 * SUM(total_revenue) OVER (ORDER BY total_revenue DESC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) / 
        SUM(total_revenue) OVER (),
        2
    ) AS cumulative_pct
FROM cat_totals
ORDER BY total_revenue DESC;
