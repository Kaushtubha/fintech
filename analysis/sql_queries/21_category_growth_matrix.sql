-- ============================================================================
-- Query 21: Category Quarter-over-Quarter Growth Matrix
-- Business Purpose: Measure expanding and contracting operational categories.
-- Concepts: Multi-stage CTE, Window LAG(), Partition by Category
-- ============================================================================

WITH quarterly_category_volume AS (
    SELECT 
        DATE_TRUNC('quarter', transaction_date::DATE) AS quarter,
        transaction_type,
        category,
        ROUND(SUM(amount)::NUMERIC, 2) AS quarterly_spend
    FROM transactions
    WHERE status = 'Completed'
    GROUP BY DATE_TRUNC('quarter', transaction_date::DATE), transaction_type, category
),
category_lagged AS (
    SELECT 
        quarter,
        transaction_type,
        category,
        quarterly_spend,
        LAG(quarterly_spend, 1) OVER (PARTITION BY category ORDER BY quarter) AS prev_quarter_spend
    FROM quarterly_category_volume
)
SELECT 
    quarter,
    transaction_type,
    category,
    quarterly_spend,
    prev_quarter_spend,
    ROUND(
        (quarterly_spend - prev_quarter_spend) / NULLIF(prev_quarter_spend, 0) * 100.0,
        2
    ) AS qoq_growth_pct
FROM category_lagged
ORDER BY transaction_type, category, quarter ASC;
