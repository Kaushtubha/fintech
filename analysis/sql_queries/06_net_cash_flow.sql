-- ============================================================================
-- Query 06: Net Cash Flow and Operating Margin by Month
-- Business Purpose: Calculate true monthly cash surplus/deficit and operational efficiency.
-- Concepts: Multi-table/Conditional Aggregation, CASE WHEN inside SUM, Margin %
-- ============================================================================

SELECT 
    DATE_TRUNC('month', transaction_date::DATE) AS month,
    ROUND(SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE 0 END)::NUMERIC, 2) AS total_income,
    ROUND(SUM(CASE WHEN transaction_type = 'Expense' THEN amount ELSE 0 END)::NUMERIC, 2) AS total_expense,
    ROUND(
        SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE -amount END)::NUMERIC, 
        2
    ) AS net_cash_flow,
    ROUND(
        100.0 * SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE -amount END) /
        NULLIF(SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE 0 END), 0),
        2
    ) AS net_cash_margin_pct
FROM transactions
WHERE status = 'Completed'
GROUP BY DATE_TRUNC('month', transaction_date::DATE)
ORDER BY month ASC;
