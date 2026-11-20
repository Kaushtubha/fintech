-- ============================================================================
-- Query 16: Reversal and Chargeback Impact Analysis
-- Business Purpose: Measure disputed revenue, refunds, and leakages by category.
-- Concepts: Filtered Aggregations, Reversal Rate as % of Gross Volume
-- ============================================================================

SELECT 
    category,
    COUNT(transaction_id) AS total_txns,
    SUM(CASE WHEN status = 'Reversed' THEN 1 ELSE 0 END) AS reversed_txn_count,
    ROUND(SUM(CASE WHEN status = 'Reversed' THEN amount ELSE 0 END)::NUMERIC, 2) AS reversed_amount,
    ROUND(SUM(amount)::NUMERIC, 2) AS gross_category_volume,
    ROUND(
        100.0 * SUM(CASE WHEN status = 'Reversed' THEN amount ELSE 0 END) / 
        NULLIF(SUM(amount), 0),
        2
    ) AS reversal_rate_pct
FROM transactions
GROUP BY category
HAVING SUM(CASE WHEN status = 'Reversed' THEN 1 ELSE 0 END) > 0
ORDER BY reversed_amount DESC;
