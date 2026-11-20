-- ============================================================================
-- Query 14: High-Value Transaction Isolation (Top 1% Percentile)
-- Business Purpose: Identify large transactions that require manual audit verification.
-- Concepts: NTILE(100) Window Function, CTE, Subqueries, Filtering on percentiles
-- ============================================================================

WITH ranked_txns AS (
    SELECT 
        transaction_id,
        transaction_date,
        transaction_type,
        category,
        payment_method,
        amount,
        customer_id,
        merchant,
        status,
        NTILE(100) OVER (PARTITION BY transaction_type ORDER BY amount ASC) AS percentile_tier
    FROM transactions
    WHERE status = 'Completed'
)
SELECT 
    transaction_id,
    transaction_date,
    transaction_type,
    category,
    payment_method,
    amount,
    customer_id,
    merchant
FROM ranked_txns
WHERE percentile_tier = 100  -- Top 1% tier
ORDER BY amount DESC
LIMIT 25;
