# FinSight — Financial Data Analytics & Cash Flow Intelligence Platform

> **Portfolio Project for ZenStatement Data Analyst Application**  
> Built with Python, DuckDB / PostgreSQL, FastAPI, React 19, Vite, Tailwind CSS & Recharts.

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![DuckDB](https://img.shields.io/badge/DuckDB-PostgreSQL_SQL-FFF000?style=for-the-badge&logo=duckdb&logoColor=black)](https://duckdb.org)
[![React](https://img.shields.io/badge/React-19.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

---

## 1. Executive Overview & Problem Statement

Modern enterprises process tens of thousands of complex financial transactions across diverse operational departments, clients, payment gateways, and accounting periods. Raw ledger transactions alone cannot answer essential CFO questions:
- *Where is cash being generated vs where is capital bleeding?*
- *What is the true monthly net cash flow and operating cash margin?*
- *Which payment rails suffer from technical failure drop-offs?*
- *Which customers represent 80% of revenue concentration (Pareto principle)?*
- *Which individual transactions exhibit statistical anomaly flags (Tukey's IQR & 3-Sigma)?*

**FinSight** is an enterprise-grade financial analytics platform that transforms raw financial transaction data into actionable business intelligence through a complete data engineering and analytics workflow:
1. **Raw Financial Dataset Generation** (71,100 records with realistic commercial distributions and deliberately injected real-world flaws).
2. **Automated Data Cleaning Pipeline** (deduplication, date parsing, regex categorical normalization, monetary sign rectification, and null imputation).
3. **Exploratory Data Analysis (EDA)** (Jupyter Notebook `exploratory_analysis.ipynb` analyzing distribution, skew, and cash flow patterns).
4. **Relational SQL Analytics Database** (21 verified production queries using CTEs, window functions like `LAG`, `SUM OVER`, `DENSE_RANK`, `NTILE`, and aggregations).
5. **Statistical Anomaly Detection Engine** (IQR fences, Z-score standard deviations, and rule-based velocity checks).
6. **Algorithmic Narrative Reporting Engine** (dynamically generated observations from calculated values, not static text).
7. **FastAPI Serving Layer** (sub-50ms query response times with thread-safe analytical execution).
8. **Interactive Fintech Dashboard** (React 19 + Tailwind CSS + Recharts with responsive filters, pagination, and CSV export).

---

## 2. End-to-End Analytical Architecture

```
┌────────────────────────────────────────────────────────┐
│               RAW TRANSACTION INGESTION                │
│    71,100 Records | Deliberate Injected Data Flaws     │
│   (Duplicates, Malformed Dates, Negatives, Typos)      │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│            PYTHON DATA CLEANING PIPELINE               │
│        backend/scripts/clean_data.py                   │
│   • Deduplication on transaction_id (1,100 dropped)    │
│   • Multi-pass ISO date normalization (534 dropped)   │
│   • Absolute value sign rectification (765 fixed)      │
│   • Regex category harmonization (2,071 mapped)        │
│   • Output: 69,137 Clean Records (97.24% retention)    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│        ANALYTICAL SQL ENGINE (DUCKDB / POSTGRES)       │
│        analysis/sql_queries/ (21 Production Queries)   │
│   • Month-over-Month Growth with LAG() OVER ()         │
│   • Running Cumulative Revenue with SUM() OVER ()      │
│   • Customer Pareto 80/20 Concentration Analysis       │
│   • Gateway Conversion & Failure Ratios                │
│   • Statistical Anomaly Isolation (IQR & Z-score)      │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│              FASTAPI SERVING BACKEND                   │
│        backend/app/main.py (Port 8000)                 │
│   • /api/dashboard/summary  • /api/dashboard/trends   │
│   • /api/analytics/revenue  • /api/analytics/expenses  │
│   • /api/transactions       • /api/anomalies          │
│   • /api/reports/monthly    • /api/data-quality       │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│            REACT 19 INTERACTIVE DASHBOARD              │
│        frontend/src/ (Port 5173, Vite + Recharts)      │
│   • Command Center Overview with KPI Cards             │
│   • Granular Revenue & Expense Deep-Dives              │
│   • Filterable Transaction Ledger & CSV Exporter       │
│   • Anomaly Audit Review & Automated Monthly Reports   │
└────────────────────────────────────────────────────────┘
```

---

## 3. Dataset Design & Ingestion Audit

The dataset simulates an enterprise with 18 months of financial operations (January 2025 – June 2026).

### A. Data Schema
| Column | Type | Example | Business Description |
|---|---|---|---|
| `transaction_id` | String | `TXN100042` | Unique transaction identifier |
| `transaction_date` | Date | `2026-03-15` | Canonical ISO calendar date |
| `transaction_type` | String | `Income` / `Expense` | Inflow vs Outflow categorization |
| `amount` | Decimal(12,2) | `24500.00` | Monetary value in INR (₹) |
| `category` | String | `Sales` | Functional business unit |
| `payment_method` | String | `UPI` | Payment rail (UPI, Credit Card, Bank Transfer, Debit Card, Wallet) |
| `customer_id` | String | `CUST1042` | Client account tag or `CUST_ANON` |
| `merchant` | String | `WeWork India` | Counterparty organization |
| `status` | String | `Completed` | Settlement state (`Completed`, `Pending`, `Failed`, `Reversed`) |
| `region` | String | `South` | Commercial territory (North, South, East, West, Central) |
| `currency` | String | `INR` | Standardized currency code |

### B. Injected Data Quality Flaws & Cleansing Audit
To mirror real-world data warehouse ingestion, the raw dataset included deliberate imperfections. The automated cleaning pipeline resolved:

| Quality Issue Injected | Raw Count Affected | Cleaning Resolution Logic | Clean Production Result |
|---|---|---|---|
| **Duplicate IDs** | 1,100 | Deduplicated by natural key `transaction_id` | 100% Unique Keys |
| **Corrupted Dates** | 534 | Multi-pass parsing (`%Y-%m-%d`, `%d/%m/%Y`, `%Y.%m.%d`); dropped invalid calendar days | 100% Valid ISO Dates |
| **Zero / Invalid Amounts** | 329 | Dropped non-numeric and 0.00 entries | All Amounts > 0.00 |
| **Negative Debits** | 765 | Converted signed accounting debits to positive magnitude | Standardized Absolute Values |
| **Category Typo & Casing** | 2,071 | Regex mapped variations (e.g. `sale_rev`, `mktg`, `operatns`, `ops`) | Canonical 13 Categories |
| **Payment Inconsistencies** | 2,538 | Normalized `upi_pay`, `Credit-Card`, `NEFT/RTGS` | 5 Banking Rails |
| **Status Inconsistencies** | 2,363 | Standardized `SUCCESS`, `in_process`, `declined`, `refunded` | 4 Lifecycle States |
| **Missing Customer IDs** | 2,098 | Imputed null/empty values with `CUST_ANON` | Zero Null References |
| **Missing Merchants/Regions**| 2,103 | Imputed with `Direct Merchant Partner` and `Central` | Complete Dimensional Data |
| **Final Clean Retention** | — | — | **69,137 Rows (97.24%)** |

---

## 4. Analytical SQL Queries Catalog (21 Verified Queries)

Located in [`analysis/sql_queries/`](analysis/sql_queries/), every query has been validated against the production database:

1. `01_monthly_revenue.sql`: Gross completed revenue & average ticket size by month (`DATE_TRUNC`, `SUM`, `AVG`).
2. `02_expense_breakdown.sql`: Category expenditure share with percentage of total (`CTE`, `SUM() OVER ()`).
3. `03_top_customers.sql`: VIP client ranking by total spend & order frequency (`GROUP BY`, `ORDER BY DESC`, `LIMIT 10`).
4. `04_mom_revenue_growth.sql`: Month-over-month revenue growth percentage (`CTE`, `LAG() OVER (ORDER BY month)`).
5. `05_transaction_success_rate.sql`: Gateway conversion, success, and drop-off rates (`CASE WHEN`, `ROUND()`).
6. `06_net_cash_flow.sql`: Monthly Net Cash Flow & Operating Margin % (Conditional Aggregation, Inflow vs Outflow).
7. `07_revenue_by_category.sql`: Revenue distribution & cumulative revenue share (`SUM() OVER (ORDER BY ... ROWS BETWEEN ...)`).
8. `08_revenue_by_payment_method.sql`: Channel volume share vs settled value share (Multi-metric aggregation).
9. `09_average_transaction_value.sql`: Ticket size benchmarks across all business units (`AVG`, `MIN`, `MAX`).
10. `10_running_revenue.sql`: Cumulative YTD revenue pacing (Window `SUM() OVER (ORDER BY month)`).
11. `11_top_categories_ranking.sql`: Category expenditure rankings partitioned by quarter (`DATE_TRUNC('quarter')`, `DENSE_RANK()`).
12. `12_expense_growth_mom.sql`: MoM expense burn change and rate of cost expansion (Window `LAG()`).
13. `13_regional_performance.sql`: Geographic territory profitability and net margin.
14. `14_high_value_transactions.sql`: Isolation of top 1% percentile transactions (`NTILE(100)`).
15. `15_payment_method_failure_rates.sql`: Technical gateway drop-off & revenue loss share.
16. `16_reversal_impact_analysis.sql`: Chargeback, refund, and dispute leakage by category (`HAVING` filter).
17. `17_customer_concentration_pareto.sql`: Pareto 80/20 customer revenue concentration (Multi-stage CTEs).
18. `18_daily_cashflow_volatility.sql`: Daily net flow 7-day moving avg & 30-day volatility (`STDDEV`, rolling window).
19. `19_status_distribution.sql`: Full ledger status lifecycle distribution.
20. `20_weekday_weekend_patterns.sql`: Day-of-week transactional rhythm & seasonality (`EXTRACT(DOW)`).
21. `21_category_growth_matrix.sql`: Quarter-over-quarter category growth matrix (Partitioned `LAG()`).

Run the automated SQL test suite:
```bash
python analysis/run_sql_suite.py
```

---

## 5. Statistical Anomaly Detection Engine

Unlike gimmicky AI black-boxes, FinSight applies sound mathematical and statistical anomaly detection:

### 1. Tukey's Interquartile Range (IQR) Method
Calculated per category $c$:
$$\text{Upper Bound}_c = Q_3(c) + 1.5 \times (Q_3(c) - Q_1(c)) \quad [\text{Medium Severity}]$$
$$\text{Extreme Bound}_c = Q_3(c) + 3.0 \times (Q_3(c) - Q_1(c)) \quad [\text{High Severity}]$$

### 2. Z-Score Standardization
Measures standard deviation divergence:
$$Z = \frac{\text{Amount} - \mu_c}{\sigma_c}$$
Transactions with $|Z| \ge 3.0$ are flagged for review.

### 3. Rule-Based Operational Checks
- High-value `Failed` or `Reversed` transactions (>₹50,000) indicating potential gateway failure or dispute risk.
- Outlier records are assigned review workflows: `Pending Review`, `Reviewed`, or `Escalated`.

---

## 6. Algorithmic Automated Reporting

The reporting engine (`/api/reports/monthly?month=2026-04`) computes period metrics and dynamically synthesizes observations:
- *Calculates exact MoM revenue variance and expense delta.*
- *Determines if expense growth outpaced revenue expansion and measures margin compression.*
- *Highlights primary commercial drivers and major departmental cost centers.*
- *Summarizes gateway reliability and dispute leakages.*

---

## 7. Interactive Dashboard UI (React 19 + Tailwind CSS)

The frontend features 8 dedicated modules:
1. **Overview Dashboard**: Executive KPI cards, Cash Flow Trajectory composed chart, category pies, and channel breakdown.
2. **Revenue Analysis**: MoM revenue expansion bar chart, top 10 enterprise customer accounts leaderboard, and regional heatmap.
3. **Expense Analysis**: Departmental cost allocation, monthly burn rate, and top institutional vendor disbursements.
4. **Transactions Ledger**: Search by keyword, multi-select filters, sortable columns, pagination (69k+ records), and one-click CSV export.
5. **Payment Method Intelligence**: Channel conversion scorecard, gateway drop-off loss value, and volume vs value shares.
6. **Anomaly Review**: Filter by detection method (IQR, Z-Score, Rule-Based), severity badges, and audit statuses.
7. **Monthly Intelligence Reports**: Month picker, financial summary cards, dynamic algorithmic insights, and PDF printable format.
8. **Data Quality Audit**: Cleaning pipeline funnel, transformation metrics log, and interview talking points guide.

---

## 8. Local Setup & Verification Guide

### Prerequisites
- Python 3.10+ (Standard library, DuckDB, FastAPI, Uvicorn, Pydantic)
- Node.js 18+ & npm

### Step 1: Clone Repository
```bash
git clone https://github.com/Kaushtubha/fintech.git
cd fintech
```

### Step 2: Backend Setup & Data Pipeline Execution
```bash
# 1. Install python dependencies
pip install -r backend/requirements.txt

# 2. Generate raw transaction dataset (71,100 records)
python backend/scripts/generate_dataset.py

# 3. Run automated cleaning pipeline
python backend/scripts/clean_data.py

# 4. Run SQL Analytics test suite
python analysis/run_sql_suite.py

# 5. Execute backend test suite
python -m backend.tests.run_tests

# 6. Start FastAPI server
uvicorn backend.app.main:app --reload --port 8000
```
API Documentation will be live at: `http://127.0.0.1:8000/docs`

### Step 3: Frontend Dashboard Setup
```bash
cd frontend
npm install
npm run dev
```
Dashboard UI will be live at: `http://localhost:5173`

---

## 9. Interview Discussion Cheat Sheet (ZenStatement Role)

### Q1: How did you clean the dataset and handle data quality issues?
> **Answer**: *"I implemented a multi-stage Python pipeline in `clean_data.py`. I first deduplicated records on `transaction_id` (dropping 1,100 duplicate rows). I built a robust date parser that handled multiple date formats (`YYYY-MM-DD`, `DD/MM/YYYY`, dots) while trapping calendar boundary errors (e.g. Feb 31). Negative amounts were rectified to absolute values. Categorical inconsistencies (like `sale_rev`, `mktg`, `Pay Roll`) were standardized via regex dictionaries to canonical taxonomies. Null customer IDs were imputed with `CUST_ANON` to prevent referential integrity errors while maintaining a 97.24% retention rate."*

### Q2: Why did you use DuckDB / PostgreSQL rather than just Pandas?
> **Answer**: *"While Pandas is good for small in-memory manipulation, financial analytics in enterprise settings requires ACID compliance, relational integrity, and the expressive power of analytical SQL. DuckDB implements the full PostgreSQL SQL dialect, allows running complex multi-stage CTEs and window functions (`LAG`, `SUM OVER`, `DENSE_RANK`, `NTILE`) directly at columnar speeds, and scales seamlessly to tens of millions of rows without memory exhaustion."*

### Q3: How did you ensure financial numbers don't become misleading?
> **Answer**: *"By strictly separating ledger transaction statuses. Failed, pending, and reversed transactions represent gateway drop-offs and dispute claims, NOT recognized revenue or operating disbursements. In the metrics engine, gross revenue and operating expenses only aggregate transactions where `status = 'Completed'`. Reversals are tracked in a dedicated leakage metric rather than being silently netted against cash flow."*

### Q4: How did you identify transaction anomalies without over-hyping AI?
> **Answer**: *"I built an anomaly detection engine based on statistical and operational rules. First, Tukey's IQR Method calculates dynamic upper fences ($Q_3 + 1.5 \times IQR$) per category, flagging statistical outliers. Second, Z-Score standardization flags transactions exceeding 3 standard deviations from the category mean. Third, rule-based checks isolate high-value failed or reversed requests. Each flagged record provides human-readable reasons, severity ratings, and an audit review status."*

---

## 10. License
MIT License. Developed for the ZenStatement Data Analyst Portfolio.
