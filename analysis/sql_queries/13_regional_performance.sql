-- ============================================================================
-- Query 13: Regional Financial Performance and Profitability
-- Business Purpose: Compare geographic markets by revenue, costs, and net contribution.
-- Concepts: Multi-conditional aggregations, GROUP BY, Net Cash Margin %
-- ============================================================================

SELECT 
    region,
    COUNT(transaction_id) AS total_transactions,
    ROUND(SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE 0 END)::NUMERIC, 2) AS regional_revenue,
    ROUND(SUM(CASE WHEN transaction_type = 'Expense' THEN amount ELSE 0 END)::NUMERIC, 2) AS regional_expense,
    ROUND(
        SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE -amount END)::NUMERIC, 
        2
    ) AS regional_net_cash_flow,
    ROUND(
        100.0 * SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE -amount END) /
        NULLIF(SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE 0 END), 0),
        2
    ) AS regional_net_margin_pct
FROM transactions
WHERE status = 'Completed'
GROUP BY region
ORDER BY regional_revenue DESC;
