# FinSight — Analytical Methodology & Architecture

## 1. Executive Summary
FinSight is designed as an enterprise-grade financial analytics and cash flow intelligence platform. Rather than serving as a static dashboard mock-up, FinSight demonstrates an end-to-end analytical lifecycle:
1. Synthetic Generation of realistic transaction records (75,000 transactions across 18 months).
2. Deliberate injection of real-world transactional imperfections.
3. Automated multi-stage Python data cleaning and validation pipeline.
4. Relational SQL modeling and 20+ analytical queries using CTEs, window functions (`LAG`, `SUM OVER`, `RANK`), and aggregations.
5. Statistical Anomaly Detection (IQR, Z-score, Rule-based velocity checks).
6. FastAPI analytical serving layer delivering sub-50ms query responses.
7. Modern React + Vite + Tailwind + Recharts dashboard with responsive KPI metrics, dynamic filters, and CSV reporting.

---

## 2. Dataset Synthesis Methodology

Financial transaction datasets in real enterprise environments exhibit distinct mathematical characteristics:
- **Lognormal Distribution of Amounts**: Small transactions occur frequently, while large enterprise invoices occur rarely.
- **Seasonality & Growth**: Commercial revenue demonstrates month-over-month growth patterns and quarterly closing surges.
- **Expense Ratios**: Operating expenses, payroll, and software licenses follow distinct cyclical rhythms (e.g. payroll on the 1st and last days of the month).
- **Payment Method Profiles**: UPI and debit cards dominate consumer/small-ticket transactions; bank transfers dominate high-ticket payroll and enterprise vendor payments.

### Deliberately Injected Data Quality Flaws:
To mirror production data warehouse ingestion challenges, the generation script injects:
1. **Duplicate Transaction IDs**: ~1.5% duplicate records to test deduplication logic.
2. **Missing Customer IDs**: ~2.5% null or blank strings requiring imputation or anonymous flagging.
3. **Negative & Zero Amounts**: Inadvertent debit signs or data-entry errors requiring absolute value correction or invalidation.
4. **Casing & Spelling Inconsistencies**: Variations such as `upi`, `Upi`, `Credit-card`, `bank_transfer`, `operaTIONS`, `sales`.
5. **Invalid / Corrupted Dates**: Out-of-bounds dates, unparseable strings, and future dates requiring parsing error traps.
6. **Outliers & Extreme Values**: Multi-million rupee test transactions and artificial spikes.
7. **Unsettled Statuses**: Failed, pending, and reversed transactions to ensure they are strictly segregated from recognized cash flow.

---

## 3. Data Cleaning Pipeline Architecture

The cleaning pipeline (`backend/scripts/clean_data.py`) executes an ordered 8-step pipeline:
1. **Schema & Type Cast**: Standardizes column headers and converts raw types.
2. **Deduplication**: Identifies and eliminates redundant transaction IDs, keeping the latest valid record.
3. **Date Harmonization**: Parses heterogeneous date formats into ISO `YYYY-MM-DD`, dropping or imputing unrecoverable records.
4. **Categorical Normalization**: Applies regex dictionaries to map spelling variations into canonical enums.
5. **Amount Sanitization**: Enforces positive real numbers, corrects signed accounting entries based on `transaction_type`.
6. **Null Imputation**: Imputes missing customer identifiers with standardized `CUST_ANON` and flags unknown merchants.
7. **Status & Type Validation**: Confirms transactions match valid lifecycle statuses (`Completed`, `Pending`, `Failed`, `Reversed`).
8. **Audit Trail & Quality Metrics**: Emits a machine-readable JSON quality report summarizing:
   - Initial row count vs clean row count
   - Duplicate count dropped
   - Null values imputed
   - Invalid dates corrected
   - Negative amounts rectified

---

## 4. Financial Metrics & Calculation Engine

Accuracy and accounting rigor govern all analytical computations:

| Metric | Formal Definition | Accounting Rationale |
| :--- | :--- | :--- |
| **Gross Revenue (Total Income)** | $\sum \text{amount} \text{ where } \text{type} = \text{'Income'} \land \text{status} = \text{'Completed'}$ | Only settled incoming receipts are recognized as income. |
| **Total Expenses** | $\sum \text{amount} \text{ where } \text{type} = \text{'Expense'} \land \text{status} = \text{'Completed'}$ | Only finalized disbursements represent operational outflow. |
| **Net Cash Flow** | $\text{Gross Revenue} - \text{Total Expenses}$ | The true surplus or deficit generated during the period. |
| **Transaction Volume** | $\text{Count of all transactions}$ | Total processing throughput across all channels. |
| **Success Rate (%)** | $\frac{\text{Count}(\text{status} = \text{'Completed'})}{\text{Total Transactions}} \times 100$ | Gateway reliability and operational health indicator. |
| **MoM Growth Rate (%)** | $\frac{\text{Metric}_t - \text{Metric}_{t-1}}{\text{Metric}_{t-1}} \times 100$ | Computed via SQL `LAG()` window function over ordered calendar months. |
| **Reversal Impact Rate** | $\frac{\sum \text{Reversed Amounts}}{\sum \text{Total Processed}} \times 100$ | Measures chargeback and dispute leakage. |

---

## 5. Statistical Anomaly Detection Methodology

FinSight implements a multi-tiered anomaly detection engine that flags suspicious transactions without claiming unverified machine learning magic:

### 1. Interquartile Range (IQR) Category Outlier Detection
For each transaction category $c$:
$$IQR_c = Q_3(c) - Q_1(c)$$
$$\text{Upper Threshold}_c = Q_3(c) + 1.5 \times IQR_c \quad (\text{Moderate Flier})$$
$$\text{Extreme Threshold}_c = Q_3(c) + 3.0 \times IQR_c \quad (\text{Extreme Outlier})$$

### 2. Z-Score Standardization
Measures how many standard deviations an amount deviates from the category mean:
$$Z = \frac{\text{amount} - \mu_c}{\sigma_c}$$
Transactions with $|Z| \ge 3.0$ are flagged for supervisor review.

### 3. Rule-Based Heuristics:
- **Velocity Burst**: High number of transactions for the same customer within 10 minutes.
- **Round-Sum Spikes**: Unusually large round sums (e.g. ₹500,000 exactly) in categories where fractional invoices are typical.
- **Failed Sequence**: Sudden spike in failed transactions for a specific payment channel or merchant.
