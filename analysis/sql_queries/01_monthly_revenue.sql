-- ============================================================================
-- Query 01: Monthly Revenue Analysis
-- Business Purpose: Measure gross realized revenue month-over-month.
-- Concepts: DATE_TRUNC, SUM, WHERE filter, GROUP BY, ORDER BY
-- ============================================================================

SELECT 
    DATE_TRUNC('month', transaction_date::DATE) AS month,
    COUNT(transaction_id) AS total_income_transactions,
    ROUND(SUM(amount)::NUMERIC, 2) AS total_revenue,
    ROUND(AVG(amount)::NUMERIC, 2) AS avg_revenue_per_transaction
FROM transactions
WHERE transaction_type = 'Income' 
  AND status = 'Completed'
GROUP BY DATE_TRUNC('month', transaction_date::DATE)
ORDER BY month ASC;
