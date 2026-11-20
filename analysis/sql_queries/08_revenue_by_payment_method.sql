-- ============================================================================
-- Query 08: Revenue and Volume by Payment Method
-- Business Purpose: Channel adoption evaluation and settlement volume.
-- Concepts: GROUP BY, Multi-metric aggregation, Share of Volume vs Value
-- ============================================================================

SELECT 
    payment_method,
    COUNT(transaction_id) AS transaction_count,
    ROUND(SUM(amount)::NUMERIC, 2) AS total_settled_amount,
    ROUND(AVG(amount)::NUMERIC, 2) AS avg_transaction_size,
    ROUND(100.0 * COUNT(transaction_id) / SUM(COUNT(transaction_id)) OVER (), 2) AS volume_share_pct,
    ROUND(100.0 * SUM(amount) / SUM(SUM(amount)) OVER (), 2) AS value_share_pct
FROM transactions
WHERE status = 'Completed'
GROUP BY payment_method
ORDER BY total_settled_amount DESC;
