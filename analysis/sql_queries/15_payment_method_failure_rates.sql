-- ============================================================================
-- Query 15: Payment Gateway Failure & Dropout Breakdown
-- Business Purpose: Identify specific gateways suffering from technical friction.
-- Concepts: Aggregate CASE WHEN, Ratio Calculation, Failure Share
-- ============================================================================

SELECT 
    payment_method,
    COUNT(*) AS total_attempts,
    SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) AS failed_attempts,
    ROUND(SUM(CASE WHEN status = 'Failed' THEN amount ELSE 0 END)::NUMERIC, 2) AS failed_amount_lost,
    ROUND(
        100.0 * SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0),
        2
    ) AS failure_rate_pct,
    ROUND(
        100.0 * SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) / 
        NULLIF(SUM(SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END)) OVER (), 0),
        2
    ) AS share_of_all_failures_pct
FROM transactions
GROUP BY payment_method
ORDER BY failed_attempts DESC;
