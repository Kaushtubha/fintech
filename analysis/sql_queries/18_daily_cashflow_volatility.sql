-- ============================================================================
-- Query 18: Daily Net Cash Flow Volatility and Liquidity Metrics
-- Business Purpose: Measure daily cash variability, volatility, and liquidity swings.
-- Concepts: Daily aggregation, Window STDDEV(), Rolling 7-day average
-- ============================================================================

WITH daily_cash AS (
    SELECT 
        transaction_date::DATE AS day,
        ROUND(SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE -amount END)::NUMERIC, 2) AS daily_net_flow
    FROM transactions
    WHERE status = 'Completed'
    GROUP BY transaction_date::DATE
)
SELECT 
    day,
    daily_net_flow,
    ROUND(
        AVG(daily_net_flow) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)::NUMERIC, 
        2
    ) AS rolling_7day_avg_flow,
    ROUND(
        STDDEV(daily_net_flow) OVER (ORDER BY day ROWS BETWEEN 29 PRECEDING AND CURRENT ROW)::NUMERIC, 
        2
    ) AS rolling_30day_volatility_stddev
FROM daily_cash
ORDER BY day ASC;
