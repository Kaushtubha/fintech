-- ============================================================================
-- Query 12: Month-over-Month Expense Growth Analysis
-- Business Purpose: Spot sudden cost overruns and operational spikes.
-- Concepts: CTE, LAG() Window Function, Growth Difference & Percentage
-- ============================================================================

WITH monthly_burn AS (
    SELECT 
        DATE_TRUNC('month', transaction_date::DATE) AS month,
        ROUND(SUM(amount)::NUMERIC, 2) AS total_expense
    FROM transactions
    WHERE transaction_type = 'Expense' 
      AND status = 'Completed'
    GROUP BY DATE_TRUNC('month', transaction_date::DATE)
)
SELECT 
    month,
    total_expense,
    LAG(total_expense, 1) OVER (ORDER BY month) AS prev_month_expense,
    ROUND((total_expense - LAG(total_expense, 1) OVER (ORDER BY month))::NUMERIC, 2) AS net_expense_change,
    ROUND(
        (total_expense - LAG(total_expense, 1) OVER (ORDER BY month)) / 
        NULLIF(LAG(total_expense, 1) OVER (ORDER BY month), 0) * 100.0, 
        2
    ) AS mom_expense_growth_pct
FROM monthly_burn
ORDER BY month ASC;
