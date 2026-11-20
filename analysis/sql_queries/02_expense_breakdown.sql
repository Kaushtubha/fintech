-- ============================================================================
-- Query 02: Expense Breakdown by Category
-- Business Purpose: Identify the largest expense drivers and their share of total outflow.
-- Concepts: SUM, CASE WHEN, Window SUM() OVER (), Percentage Share
-- ============================================================================

WITH category_expenses AS (
    SELECT 
        category,
        COUNT(transaction_id) AS transaction_count,
        ROUND(SUM(amount)::NUMERIC, 2) AS total_expense
    FROM transactions
    WHERE transaction_type = 'Expense' 
      AND status = 'Completed'
    GROUP BY category
)
SELECT 
    category,
    transaction_count,
    total_expense,
    ROUND(100.0 * total_expense / SUM(total_expense) OVER (), 2) AS percentage_of_total_expense
FROM category_expenses
ORDER BY total_expense DESC;
