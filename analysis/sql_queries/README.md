# FinSight — Analytical SQL Query Catalog

This repository features **21 production-grade analytical SQL queries** written for the FinSight platform. Each query addresses critical CFO / Financial Operations questions using advanced relational SQL techniques:

| # | File Name | Business Objective | Core SQL Concepts |
|---|---|---|---|
| **01** | `01_monthly_revenue.sql` | Gross completed revenue & average ticket size by month | `DATE_TRUNC('month')`, `SUM`, `AVG`, `GROUP BY` |
| **02** | `02_expense_breakdown.sql` | Category expenditure share and relative proportion | `CTE`, `SUM() OVER ()`, Percentage of total |
| **03** | `03_top_customers.sql` | VIP client ranking by total spend & order frequency | `GROUP BY`, `ORDER BY DESC`, `LIMIT 10` |
| **04** | `04_mom_revenue_growth.sql` | Month-over-month revenue growth percentage | `CTE`, `LAG() OVER (ORDER BY month)`, `NULLIF` |
| **05** | `05_transaction_success_rate.sql` | Gateway conversion, success, and drop-off rates | `CASE WHEN`, `ROUND()`, `NULLIF` |
| **06** | `06_net_cash_flow.sql` | Monthly Net Cash Flow & Operating Margin % | Conditional Aggregation, Inflow vs Outflow |
| **07** | `07_revenue_by_category.sql` | Revenue distribution & cumulative revenue share | `SUM() OVER (ORDER BY ... ROWS BETWEEN ...)` |
| **08** | `08_revenue_by_payment_method.sql` | Channel volume share vs settled value share | Multi-metric aggregation, Share ratios |
| **09** | `09_average_transaction_value.sql` | Ticket size benchmarks across all business units | `AVG()`, `MIN()`, `MAX()`, multi-column grouping |
| **10** | `10_running_revenue.sql` | Cumulative YTD revenue pacing | Window `SUM() OVER (ORDER BY month)` |
| **11** | `11_top_categories_ranking.sql` | Category expenditure rankings partitioned by quarter | `DATE_TRUNC('quarter')`, `DENSE_RANK() OVER (PARTITION BY ...)` |
| **12** | `12_expense_growth_mom.sql` | MoM expense burn change and rate of cost expansion | Window `LAG()`, MoM variance |
| **13** | `13_regional_performance.sql` | Geographic territory profitability and net margin | Multi-condition aggregation, Net margin calculation |
| **14** | `14_high_value_transactions.sql` | Isolation of top 1% percentile transactions | `NTILE(100) OVER (PARTITION BY type ORDER BY amount)` |
| **15** | `15_payment_method_failure_rates.sql` | Technical gateway drop-off & revenue loss share | Channel failure breakdown, Global loss share |
| **16** | `16_reversal_impact_analysis.sql` | Chargeback, refund, and dispute leakage by category | Filtered aggregation, `HAVING` clause |
| **17** | `17_customer_concentration_pareto.sql` | Pareto 80/20 customer revenue concentration | Multi-stage CTEs, Running revenue ratio |
| **18** | `18_daily_cashflow_volatility.sql` | Daily net flow 7-day moving avg & 30-day volatility | `STDDEV()`, Rolling window `ROWS BETWEEN 6 PRECEDING` |
| **19** | `19_status_distribution.sql` | Full ledger status lifecycle distribution | Overall volume vs value share |
| **20** | `20_weekday_weekend_patterns.sql` | Day-of-week transactional rhythm & seasonality | `EXTRACT(DOW)`, `CASE WHEN` day naming |
| **21** | `21_category_growth_matrix.sql` | Quarter-over-quarter category growth matrix | Nested CTEs, `LAG() OVER (PARTITION BY category)` |

---

## Verification & Execution
All 21 queries are automatically verified by `analysis/run_sql_suite.py` against the DuckDB / PostgreSQL analytical engine.
To re-run the verification test suite:
```bash
python analysis/run_sql_suite.py
```
Output results and preview samples are saved to `analysis/query_results.json`.
