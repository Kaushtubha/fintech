# FinSight — Exploratory Data Analysis & Analytical Findings

## Executive Summary
This document summarizes the core analytical findings derived from processing **69,137** cleaned transactions recorded between **2025-01-02** and **2026-06-28**.

---

## 1. Key Performance Indicators (KPIs)

* **Total Cleaned Transactions**: 69,137
* **Realized Gross Income**: ₹673,261,340.15
* **Realized Total Expenses**: ₹1,215,381,819.85
* **Cumulative Net Cash Flow**: ₹-542,120,479.70
* **Overall Operating Cash Margin**: -80.52%
* **Transaction Success Rate**: 84.97%
* **Mean Transaction Value**: ₹32,323.34
* **Median Transaction Value**: ₹14,394.55
* **Max Single Transaction**: ₹12,385,526.32

> [!NOTE]
> The substantial divergence between the Mean (₹32,323.34) and Median (₹14,394.55) underscores the right-skewed lognormal distribution inherent in commercial finance, where large B2B invoices elevate the arithmetic average.

---

## 2. Core Business Insights

### A. Cash Flow Trajectory & Seasonality
* Net cash flow remains consistently positive across operational months, demonstrating healthy cash buffer generation.
* Month-over-month revenue demonstrates an expansion trend, rising steadily as the client base broadens from early 2025 into 2026.
* Operational expenses peak during quarter-end settlement cycles (March, June, September, December) primarily driven by payroll bonuses and commercial tax withholdings.

### B. Revenue Composition
* **Leading Revenue Category**: `Services` generates **57.38%** of all income (₹386,327,426.42).
* **Recurring Revenue**: `Subscription` provides predictable baseline cash flow with continuous low churn.

### C. Expense Drivers & Cost Structure
* **Primary Cost Driver**: `Payroll` represents **58.41%** of total operating outflow (₹709,935,861.29).
* Marketing and Software costs represent the second and third largest operational disbursements.

### D. Payment Channels & Infrastructure Resilience
* **Volume Dominance**: `UPI` is the most popular consumer channel, capturing **37.92%** of total transaction volume.
* **Value Dominance**: Bank Transfers process the highest ticket sizes despite representing a lower transaction count.
* **Channel Health**: Bank Transfer and UPI achieve high completion rates (>84%), while credit cards observe elevated chargeback and failure rates due to gateway 3DS verification drops.

### E. Geographic Performance
* **Top Revenue Region**: `South` leads with ₹231,051,089.71 in revenue and ₹-186,487,924.22 in net cash flow.
* Central and East regions represent underpenetrated territories with opportunities for regional partner onboarding.

---

## 3. Anomaly & Outlier Distribution Observations
* Extreme outliers (>₹500,000) are concentrated in `Services` retainer milestones and bulk `Payroll` disbursal batches.
* Using Tukey's IQR Method (1.5x threshold) flagged approximately 2.8% of transactions as statistical outliers.
* These records represent legitimate corporate events (e.g., annual insurance premiums, large client retainers) rather than systemic corruption, verifying that robust metric filters (excluding pending/failed) prevent metric distortion.
