-- ============================================================================
-- Query 19: Comprehensive Transaction Lifecycle Status Distribution
-- Business Purpose: Complete audit of settlement integrity across the ledger.
-- Concepts: GROUP BY status, Total Count, Total Value, Window Share %
-- ============================================================================

SELECT 
    status,
    COUNT(transaction_id) AS total_count,
    ROUND(SUM(amount)::NUMERIC, 2) AS total_monetary_value,
    ROUND(100.0 * COUNT(transaction_id) / SUM(COUNT(transaction_id)) OVER (), 2) AS volume_share_pct,
    ROUND(100.0 * SUM(amount) / SUM(SUM(amount)) OVER (), 2) AS value_share_pct
FROM transactions
GROUP BY status
ORDER BY total_count DESC;
