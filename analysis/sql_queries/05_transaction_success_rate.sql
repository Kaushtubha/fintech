-- ============================================================================
-- Query 05: Payment Gateway Transaction Success Rate
-- Business Purpose: Measure payment gateway reliability and drop-off rate.
-- Concepts: CASE WHEN, Aggregate Functions, NULLIF, Percentage Ratios
-- ============================================================================

SELECT 
    payment_method,
    COUNT(*) AS total_initiated,
    SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS successful_count,
    SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) AS failed_count,
    SUM(CASE WHEN status = 'Reversed' THEN 1 ELSE 0 END) AS reversed_count,
    ROUND(
        100.0 * SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0),
        2
    ) AS success_rate_pct,
    ROUND(
        100.0 * SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0),
        2
    ) AS failure_rate_pct
FROM transactions
GROUP BY payment_method
ORDER BY total_initiated DESC;
