-- ============================================================================
-- Query 20: Day-of-Week Transaction Volume & Seasonality Pattern
-- Business Purpose: Identify weekday vs. weekend transactional behavior.
-- Concepts: EXTRACT(DOW ...), CASE WHEN for Day Names, Inflow vs Outflow
-- ============================================================================

SELECT 
    EXTRACT(DOW FROM transaction_date::DATE) AS day_of_week_num,
    CASE EXTRACT(DOW FROM transaction_date::DATE)
        WHEN 0 THEN 'Sunday'
        WHEN 1 THEN 'Monday'
        WHEN 2 THEN 'Tuesday'
        WHEN 3 THEN 'Wednesday'
        WHEN 4 THEN 'Thursday'
        WHEN 5 THEN 'Friday'
        WHEN 6 THEN 'Saturday'
    END AS day_name,
    COUNT(*) AS total_transactions,
    ROUND(SUM(CASE WHEN transaction_type = 'Income' AND status = 'Completed' THEN amount ELSE 0 END)::NUMERIC, 2) AS income_volume,
    ROUND(SUM(CASE WHEN transaction_type = 'Expense' AND status = 'Completed' THEN amount ELSE 0 END)::NUMERIC, 2) AS expense_volume,
    ROUND(AVG(amount)::NUMERIC, 2) AS avg_transaction_size
FROM transactions
GROUP BY EXTRACT(DOW FROM transaction_date::DATE), day_name
ORDER BY day_of_week_num ASC;
