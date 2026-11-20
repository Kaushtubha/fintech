-- ============================================================================
-- Query 03: Top 10 Revenue Contributing Customers
-- Business Purpose: Identify VIP accounts and client concentration risk.
-- Concepts: GROUP BY, ORDER BY DESC, LIMIT, Customer Spend Contribution
-- ============================================================================

SELECT 
    customer_id,
    COUNT(transaction_id) AS completed_orders,
    ROUND(SUM(amount)::NUMERIC, 2) AS total_revenue_generated,
    ROUND(AVG(amount)::NUMERIC, 2) AS avg_order_value,
    MIN(transaction_date) AS first_transaction_date,
    MAX(transaction_date) AS latest_transaction_date
FROM transactions
WHERE transaction_type = 'Income' 
  AND status = 'Completed'
  AND customer_id != 'CUST_ANON'
GROUP BY customer_id
ORDER BY total_revenue_generated DESC
LIMIT 10;
