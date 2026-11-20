"""
FinSight Synthetic Transaction Dataset Generator
Generates realistic financial transaction data with deliberately injected
real-world data quality flaws for cleaning, EDA, and analytical modeling.

Target: ~70,000 transactions over 18 months (2025-01-01 to 2026-06-30).
"""

import os
import csv
import random
import math
from datetime import datetime, timedelta

# Fix seed for reproducibility
random.seed(42)

TOTAL_RECORDS = 70000

START_DATE = datetime(2025, 1, 1)
END_DATE = datetime(2026, 6, 30)
DATE_RANGE_DAYS = (END_DATE - START_DATE).days

INCOME_CATEGORIES = [
    ("Sales", 0.45, 1200, 18000),         # Category, weight, typical_min, typical_max
    ("Services", 0.25, 5000, 65000),
    ("Subscription", 0.18, 999, 14999),
    ("Interest", 0.07, 250, 8500),
    ("Other Income", 0.05, 500, 12000),
]

EXPENSE_CATEGORIES = [
    ("Operations", 0.22, 1500, 35000),
    ("Marketing", 0.20, 3000, 55000),
    ("Payroll", 0.25, 25000, 180000),
    ("Rent", 0.08, 30000, 120000),
    ("Utilities", 0.06, 800, 12000),
    ("Software", 0.09, 1200, 28000),
    ("Logistics", 0.06, 600, 15000),
    ("Other Expenses", 0.04, 300, 8000),
]

PAYMENT_METHODS = [
    ("UPI", 0.38),
    ("Credit Card", 0.26),
    ("Bank Transfer", 0.18),
    ("Debit Card", 0.12),
    ("Wallet", 0.06),
]

REGIONS = [
    ("South", 0.35),
    ("West", 0.28),
    ("North", 0.22),
    ("East", 0.10),
    ("Central", 0.05),
]

STATUS_WEIGHTS = [
    ("Completed", 0.85),
    ("Pending", 0.05),
    ("Failed", 0.07),
    ("Reversed", 0.03),
]

MERCHANTS_BY_CATEGORY = {
    "Sales": ["ZenRetail Direct", "OmniMart India", "Apex Commercial Store", "QuickKart Consumer", "B2B Wholesale Hub"],
    "Services": ["Tata Consulting Retainer", "Infosys Advisory Corp", "Accenture Cloud Services", "Bespoke Analytics Ltd", "KPMG Audit"],
    "Subscription": ["Salesforce CRM Cloud", "Slack Technologies", "Atlassian Jira/Confluence", "Notion Labs", "AWS Cloud Subscription"],
    "Interest": ["HDFC Liquid Fund Sweep", "ICICI Corporate Yield", "State Bank Fixed Deposit", "Kotak Treasury Yield"],
    "Other Income": ["Asset Liquidation Corp", "Vendor Rebate Direct", "State Tax Refund", "Scrap Recovery Sales"],
    "Operations": ["BlueDart Logistics Hub", "Amazon Business Hub", "Regus Office Supplies", "UrbanClap Facilities", "Staples Commercial"],
    "Marketing": ["Google Ad Services", "Meta Ads Marketing", "LinkedIn B2B Campaigns", "Omnicom Media Agency", "HubSpot Marketing Hub"],
    "Payroll": ["Corporate Payroll Disbursal", "HDFC Salary Batch", "ICICI Direct Staff Transfer", "Contractor Payment Pool"],
    "Rent": ["DLF CyberCity Properties", "Prestige Commercial Estates", "WeWork India Offices", "Embassy TechVillage"],
    "Utilities": ["BESCOM Electricity Board", "Airtel Leased Line Internet", "Tata Power Commercial", "Mahanagar Gas Utilities"],
    "Software": ["GitHub Enterprise", "Datadog Cloud Monitor", "Figma Design Platform", "Docker Hub Pro", "OpenAI Platform"],
    "Logistics": ["Delhivery Express Hub", "Shiprocket Fulfillment", "Safexpress Freight", "FedEx Domestic"],
    "Other Expenses": ["Ernst & Young Legal", "Deloitte Advisory Review", "Corporate Sundry Petty", "Local Courier Disbursals"],
}

# Deliberate casing & formatting errors to test cleaning
INCONSISTENT_CATEGORIES = {
    "Sales": ["sales", "SALES", "Sales ", " Sales", "Sale_Rev"],
    "Marketing": ["marketing", "MARKETING", "marketng", "Mktg"],
    "Operations": ["operations", "OPERATIONS", "operatns", "Ops"],
    "Payroll": ["payroll", "PAYROLL", "Pay Roll", "salary"],
    "Software": ["software", "SOFTWARE", "soft_ware"],
    "Subscription": ["subscription", "SUBSCRIPTION", "subscrptn"],
    "Services": ["services", "SERVICES", "Servicing"],
    "Utilities": ["utilities", "UTILITIES", "Utility"],
}

INCONSISTENT_PAYMENT = {
    "UPI": ["upi", "UPI", "Upi ", "upi_pay"],
    "Credit Card": ["credit card", "CREDIT CARD", "Credit-Card", "credit_card"],
    "Debit Card": ["debit card", "DEBIT CARD", "Debit-Card"],
    "Bank Transfer": ["bank transfer", "BANK TRANSFER", "bank_transfer", "NEFT/RTGS"],
    "Wallet": ["wallet", "WALLET", "Digital Wallet"],
}

INCONSISTENT_STATUS = {
    "Completed": ["completed", "COMPLETED", "SUCCESS", "done"],
    "Pending": ["pending", "PENDING", "in_process"],
    "Failed": ["failed", "FAILED", "declined", "error"],
    "Reversed": ["reversed", "REVERSED", "refunded", "chargeback"],
}


def weighted_choice(items):
    choices = [it[0] for it in items]
    weights = [it[1] for it in items]
    return random.choices(choices, weights=weights, k=1)[0]


def generate_records():
    records = []
    print(f"Generating {TOTAL_RECORDS} transaction records...")

    # Pre-generate 1,200 unique customers for realistic repeat customer dynamics
    customer_pool = [f"CUST{1000 + i}" for i in range(1200)]

    current_txn_num = 100000

    for i in range(TOTAL_RECORDS):
        current_txn_num += 1
        txn_id = f"TXN{current_txn_num}"

        # 1. Date selection with temporal trend (slight upward transaction density over time)
        day_offset = int(random.triangular(0, DATE_RANGE_DAYS, DATE_RANGE_DAYS * 0.7))
        record_date = START_DATE + timedelta(days=day_offset)
        date_str = record_date.strftime("%Y-%m-%d")

        # 2. Transaction Type (approx 62% Income, 38% Expense)
        txn_type = "Income" if random.random() < 0.62 else "Expense"

        # 3. Category selection
        if txn_type == "Income":
            category = weighted_choice(INCOME_CATEGORIES)
            cat_info = next(c for c in INCOME_CATEGORIES if c[0] == category)
        else:
            category = weighted_choice(EXPENSE_CATEGORIES)
            cat_info = next(c for c in EXPENSE_CATEGORIES if c[0] == category)

        # 4. Realistic lognormal / triangular amount based on category typical range
        _, _, min_amt, max_amt = cat_info
        # Lognormal variation around typical midpoint
        mid = (min_amt + max_amt) / 2
        sigma = 0.5
        amt = round(random.lognormvariate(math.log(mid), sigma), 2)
        amt = max(min_amt * 0.4, min(amt, max_amt * 2.8))
        amt = round(amt, 2)

        # 5. Payment Method & Status
        payment_method = weighted_choice(PAYMENT_METHODS)
        status = weighted_choice(STATUS_WEIGHTS)
        region = weighted_choice(REGIONS)

        # Customer & Merchant
        # Pareto distribution: top 20% customers generate ~75% of income
        if txn_type == "Income":
            if random.random() < 0.70:
                cust_id = random.choice(customer_pool[:240])  # Top customers
            else:
                cust_id = random.choice(customer_pool[240:])
        else:
            cust_id = random.choice(customer_pool)

        merchants = MERCHANTS_BY_CATEGORY.get(category, ["Apex Business Corp"])
        merchant = random.choice(merchants)
        currency = "INR"

        # =========================================================================
        # INJECT REAL-WORLD DATA QUALITY ISSUES (Deliberately designed for cleaning)
        # =========================================================================

        # Flaw A: Missing customer_id (~3% null or empty)
        if random.random() < 0.03:
            cust_id = "" if random.random() < 0.5 else None

        # Flaw B: Inconsistent Category Casing / Spelling (~4%)
        if category in INCONSISTENT_CATEGORIES and random.random() < 0.04:
            category = random.choice(INCONSISTENT_CATEGORIES[category])

        # Flaw C: Inconsistent Payment Method Casing (~4%)
        if payment_method in INCONSISTENT_PAYMENT and random.random() < 0.04:
            payment_method = random.choice(INCONSISTENT_PAYMENT[payment_method])

        # Flaw D: Inconsistent Status formatting (~3.5%)
        if status in INCONSISTENT_STATUS and random.random() < 0.035:
            status = random.choice(INCONSISTENT_STATUS[status])

        # Flaw E: Negative amount sign errors (~1.2%)
        if random.random() < 0.012:
            amt = -abs(amt)

        # Flaw F: Zero or negligible amounts (~0.5%)
        elif random.random() < 0.005:
            amt = 0.00

        # Flaw G: Extreme statistical outliers (~0.3%)
        elif random.random() < 0.003:
            amt = round(amt * random.uniform(15.0, 45.0), 2)  # e.g., 500k to 3m

        # Flaw H: Corrupted / Malformed Dates (~1.5%)
        if random.random() < 0.015:
            date_flaw_type = random.choice(["slash", "dot", "invalid_day", "empty"])
            if date_flaw_type == "slash":
                date_str = record_date.strftime("%d/%m/%Y")
            elif date_flaw_type == "dot":
                date_str = record_date.strftime("%Y.%m.%d")
            elif date_flaw_type == "invalid_day":
                date_str = f"{record_date.year}-02-31"  # Invalid calendar day
            elif date_flaw_type == "empty":
                date_str = ""

        # Flaw I: Missing merchant or region (~1.5%)
        if random.random() < 0.015:
            merchant = None
        if random.random() < 0.015:
            region = ""

        records.append({
            "transaction_id": txn_id,
            "transaction_date": date_str,
            "transaction_type": txn_type,
            "amount": amt,
            "category": category,
            "payment_method": payment_method,
            "customer_id": cust_id,
            "merchant": merchant,
            "status": status,
            "region": region,
            "currency": currency,
        })

    # Flaw J: Injected Duplicate Transaction IDs (~1,100 duplicate rows)
    print("Injecting duplicate transaction records to test deduplication...")
    num_duplicates = 1100
    for _ in range(num_duplicates):
        orig_row = random.choice(records[:50000])
        dup_row = dict(orig_row)
        # In a few duplicates, slightly modify amount or status to simulate conflict resolution
        if random.random() < 0.3:
            dup_row["status"] = "Completed"
        records.append(dup_row)

    # Shuffle dataset so duplicates and date variations are dispersed
    random.shuffle(records)

    return records


def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    raw_dir = os.path.join(base_dir, "data", "raw")
    os.makedirs(raw_dir, exist_ok=True)

    csv_path = os.path.join(raw_dir, "transactions_raw.csv")

    records = generate_records()

    fieldnames = [
        "transaction_id",
        "transaction_date",
        "transaction_type",
        "amount",
        "category",
        "payment_method",
        "customer_id",
        "merchant",
        "status",
        "region",
        "currency",
    ]

    print(f"Writing {len(records)} raw transaction rows to {csv_path}...")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)

    file_size_mb = os.path.getsize(csv_path) / (1024 * 1024)
    print(f"Dataset successfully created! Total Rows: {len(records):,}, File Size: {file_size_mb:.2f} MB")


if __name__ == "__main__":
    main()
