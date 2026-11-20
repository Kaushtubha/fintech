-- ============================================================================
-- Query 09: Average Transaction Value (ATV) by Type and Category
-- Business Purpose: Benchmark ticket sizes across revenue streams and cost centers.
-- Concepts: AVG, MIN, MAX, Standard Deviation, GROUP BY
-- ============================================================================

SELECT 
    transaction_type,
    category,
    COUNT(transaction_id) AS settled_count,
    ROUND(AVG(amount)::NUMERIC, 2) AS avg_transaction_value,
    ROUND(MIN(amount)::NUMERIC, 2) AS min_amount,
    ROUND(MAX(amount)::NUMERIC, 2) AS max_amount
FROM transactions
WHERE status = 'Completed'
GROUP BY transaction_type, category
ORDER BY transaction_type, avg_transaction_value DESC;
