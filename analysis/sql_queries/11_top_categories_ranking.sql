-- ============================================================================
-- Query 11: Top Expense Categories Ranked by Quarter
-- Business Purpose: Identify shifting cost structures across business quarters.
-- Concepts: DATE_TRUNC('quarter', ...), CTE, DENSE_RANK() OVER (PARTITION BY ... ORDER BY ...)
-- ============================================================================

WITH quarterly_expenses AS (
    SELECT 
        DATE_TRUNC('quarter', transaction_date::DATE) AS quarter,
        category,
        ROUND(SUM(amount)::NUMERIC, 2) AS quarterly_spend
    FROM transactions
    WHERE transaction_type = 'Expense' 
      AND status = 'Completed'
    GROUP BY DATE_TRUNC('quarter', transaction_date::DATE), category
)
SELECT 
    quarter,
    category,
    quarterly_spend,
    DENSE_RANK() OVER (PARTITION BY quarter ORDER BY quarterly_spend DESC) AS spend_rank
FROM quarterly_expenses
ORDER BY quarter ASC, spend_rank ASC;
