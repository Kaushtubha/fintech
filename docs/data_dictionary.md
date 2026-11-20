# FinSight — Data Dictionary

## Overview
This document defines the schema, data types, allowed values, and business meaning of all fields in the FinSight Financial Analytics Platform dataset.

---

## 1. Core Transaction Fields

| Column Name | Data Type (Clean) | Example Value | Allowed / Typical Values | Description & Business Rules |
| :--- | :--- | :--- | :--- | :--- |
| `transaction_id` | `VARCHAR(32)` / `string` | `TXN100001` | Format: `TXN` + 6 digits | Unique transaction identifier. Clean pipeline removes duplicates and verifies uniqueness. |
| `transaction_date` | `DATE` / `YYYY-MM-DD` | `2026-03-15` | Valid ISO-8601 calendar dates | The date the transaction was recorded or initiated. Dates outside realistic ranges (e.g., year > 2026 or year < 2024) are rejected/flagged. |
| `transaction_type` | `VARCHAR(10)` | `Income`, `Expense` | `Income`, `Expense` | High-level cash flow classification. Determines whether cash is inflow or outflow. Standardized to Title Case. |
| `amount` | `DECIMAL(12, 2)` | `2450.00` | Real positive numbers > 0.00 | Monetary value in INR. Raw errors with negative amounts or zero are cleaned or corrected according to transaction type. |
| `category` | `VARCHAR(50)` | `Sales` | See Category Taxonomy below | Business functional classification (e.g., Sales, Operations, Payroll). Standardized against inconsistent spelling/casing. |
| `payment_method` | `VARCHAR(30)` | `UPI` | `UPI`, `Credit Card`, `Debit Card`, `Bank Transfer`, `Wallet` | Gateway/channel used to process the transaction. Standardized to official banking nomenclature. |
| `customer_id` | `VARCHAR(32)` | `CUST1021` | Format: `CUST` + 4-6 digits, or `ANON_EXT` | Identifier for the client, payer, or employee/vendor. Missing values are imputed with standardized default tags. |
| `merchant` | `VARCHAR(100)` | `Apex Retail Hub` | Business name / vendor string | Name of the internal business unit, client organization, or third-party vendor receiving/sending payment. |
| `status` | `VARCHAR(20)` | `Completed` | `Completed`, `Pending`, `Failed`, `Reversed` | Transaction lifecycle status. Only `Completed` transactions constitute recognized revenue, expense, and realized cash flow. |
| `region` | `VARCHAR(30)` | `South` | `North`, `South`, `East`, `West`, `Central`, `International` | Geographic commercial sales or operational territory. |
| `currency` | `VARCHAR(5)` | `INR` | Standardized to `INR` | Base operational currency. Standardized to Indian Rupee (₹). |

---

## 2. Category Taxonomy

### Income Categories
* **Sales**: Core commercial revenue from product and merchandise sales.
* **Services**: Billable consulting, technical implementations, professional retainers.
* **Subscription**: Recurring SaaS contracts, monthly retainers, annual platform licenses.
* **Interest**: Treasury earnings, sweep accounts, short-term fixed deposit yield.
* **Other Income**: Asset disposals, rebates, one-off vendor refunds, miscellaneous receipts.

### Expense Categories
* **Operations**: Server hosting, office lease supplies, SaaS tools, day-to-day facilities.
* **Marketing**: Ad spend (Meta, Google, LinkedIn), conferences, PR campaigns, influencer sponsorships.
* **Payroll**: Employee salaries, contractor compensation, employee health insurance, bonuses.
* **Rent**: Commercial lease contracts for headquarters and regional fulfilment hubs.
* **Utilities**: Electricity, high-speed leased line internet, water, municipal fees.
* **Software**: Developer tooling (GitHub, AWS, Datadog), accounting software, productivity suites.
* **Logistics**: Shipping couriers, freight carriers, packaging materials, warehousing fees.
* **Other Expenses**: Petty cash, legal retainers, audit fees, compliance filings.

---

## 3. Transaction Status Lifecycle

```
[Initiated] ──> [Pending] ──┬──> [Completed] ──> [Reversed]
                            └──> [Failed]
```

* **Completed**: Successfully cleared through banking channels. Included in cash flow, revenue, and expense metrics.
* **Pending**: Transaction in transit / unsettled clearing house status. Excluded from cash flow until settled.
* **Failed**: Dropped or declined due to insufficient funds, gateway timeouts, or authentication failure. Tracked in payment failure metrics.
* **Reversed**: Chargeback, merchant refund, or settlement cancellation. Tracked separately in reversal impact metrics.

---

## 4. Data Quality Standards & Ingestion Rules

1. **Uniqueness**: `transaction_id` must be 100% unique in the cleaned production table.
2. **Amount Integrity**: All completed transactions must have `amount > 0`.
3. **Date Validity**: Dates must fall within the designated operational period (2025-01-01 to 2026-12-31).
4. **Referential Consistency**: `customer_id` must follow standardized pattern `CUST{4-6 digits}` or fallback to `CUST_ANON`.
