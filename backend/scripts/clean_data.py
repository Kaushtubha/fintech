"""
FinSight Automated Data Cleaning & Quality Pipeline
Loads raw transactions CSV, performs schema validation, deduplication,
date parsing, categorical standardization, amount sanitization, and null imputation.
Outputs:
1. backend/data/processed/transactions_cleaned.csv
2. backend/data/processed/cleaning_report.json
"""

import os
import csv
import json
import re
from datetime import datetime

CATEGORY_MAP = {
    # Income
    r"^\s*sale(s|_rev)?\s*$": "Sales",
    r"^\s*service(s|ing)?\s*$": "Services",
    r"^\s*subscr(iption|ptn)?\s*$": "Subscription",
    r"^\s*interest\s*$": "Interest",
    r"^\s*other\s*income\s*$": "Other Income",
    # Expense
    r"^\s*(operation(s)?|operatns|ops)\s*$": "Operations",
    r"^\s*(market(ing)?|marketng|mktg)\s*$": "Marketing",
    r"^\s*(payroll|pay\s*roll|salary)\s*$": "Payroll",
    r"^\s*rent\s*$": "Rent",
    r"^\s*(utilit(ies|y))\s*$": "Utilities",
    r"^\s*(software|soft_ware)\s*$": "Software",
    r"^\s*logistics\s*$": "Logistics",
    r"^\s*other\s*expense(s)?\s*$": "Other Expenses",
}

PAYMENT_MAP = {
    r"^\s*upi(_pay)?\s*$": "UPI",
    r"^\s*credit[\s_-]?card\s*$": "Credit Card",
    r"^\s*debit[\s_-]?card\s*$": "Debit Card",
    r"^\s*(bank[\s_-]?transfer|neft/rtgs)\s*$": "Bank Transfer",
    r"^\s*(digital\s*)?wallet\s*$": "Wallet",
}

STATUS_MAP = {
    r"^\s*(completed|success|done)\s*$": "Completed",
    r"^\s*(pending|in_process)\s*$": "Pending",
    r"^\s*(failed|declined|error)\s*$": "Failed",
    r"^\s*(reversed|refunded|chargeback)\s*$": "Reversed",
}

VALID_INCOME_CATS = {"Sales", "Services", "Subscription", "Interest", "Other Income"}
VALID_EXPENSE_CATS = {"Operations", "Marketing", "Payroll", "Rent", "Utilities", "Software", "Logistics", "Other Expenses"}


def standardize_with_regex(val, regex_dict, fallback):
    if not val or not str(val).strip() or str(val).strip().lower() in ("none", "nan", "null"):
        return fallback
    str_val = str(val).strip()
    for pattern, canonical in regex_dict.items():
        if re.match(pattern, str_val, re.IGNORECASE):
            return canonical
    return fallback if fallback else str_val.title()


def parse_date_robust(date_val):
    if not date_val or not str(date_val).strip() or str(date_val).strip().lower() in ("none", "nan", "null"):
        return None
    date_str = str(date_val).strip()
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%Y.%m.%d", "%m-%d-%Y"):
        try:
            parsed = datetime.strptime(date_str, fmt)
            # Enforce reasonable operational calendar boundary (2024 to 2027)
            if 2024 <= parsed.year <= 2027:
                return parsed.strftime("%Y-%m-%d")
        except (ValueError, TypeError):
            continue
    return None


def run_pipeline():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    raw_path = os.path.join(base_dir, "data", "raw", "transactions_raw.csv")
    proc_dir = os.path.join(base_dir, "data", "processed")
    os.makedirs(proc_dir, exist_ok=True)
    clean_path = os.path.join(proc_dir, "transactions_cleaned.csv")
    report_path = os.path.join(proc_dir, "cleaning_report.json")

    print(f"[FinSight Data Cleaning] Reading raw dataset from: {raw_path}")
    if not os.path.exists(raw_path):
        raise FileNotFoundError(f"Raw dataset file not found at {raw_path}. Run generate_dataset.py first.")

    raw_records = []
    with open(raw_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            raw_records.append(row)

    initial_rows = len(raw_records)
    print(f"Initial raw rows: {initial_rows:,}")

    report = {
        "execution_timestamp": datetime.now().isoformat(),
        "initial_raw_rows": initial_rows,
        "duplicates_removed": 0,
        "missing_customer_ids_imputed": 0,
        "missing_merchants_imputed": 0,
        "missing_regions_imputed": 0,
        "negative_amounts_rectified": 0,
        "zero_or_invalid_amounts_dropped": 0,
        "corrupted_dates_dropped": 0,
        "categories_standardized": 0,
        "payment_methods_standardized": 0,
        "statuses_standardized": 0,
        "final_cleaned_rows": 0,
        "clean_retention_rate_pct": 0.0,
    }

    seen_ids = set()
    cleaned_records = []

    for row in raw_records:
        txn_id = (row.get("transaction_id") or "").strip()

        # 1. Deduplication on transaction_id
        if not txn_id or txn_id in seen_ids:
            report["duplicates_removed"] += 1
            continue
        seen_ids.add(txn_id)

        # 2. Date parsing and validation
        raw_date = row.get("transaction_date")
        clean_date = parse_date_robust(raw_date)
        if not clean_date:
            report["corrupted_dates_dropped"] += 1
            continue

        # 3. Amount parsing and sanitization
        raw_amt_str = str(row.get("amount") or "").strip()
        try:
            amt = float(raw_amt_str)
        except ValueError:
            report["zero_or_invalid_amounts_dropped"] += 1
            continue

        if amt < 0:
            amt = abs(amt)
            report["negative_amounts_rectified"] += 1
        elif amt == 0:
            report["zero_or_invalid_amounts_dropped"] += 1
            continue

        clean_amt = round(amt, 2)

        # 4. Standardize transaction_type
        raw_type = (row.get("transaction_type") or "").strip().lower()
        txn_type = "Income" if "inc" in raw_type else "Expense"

        # 5. Standardize Category
        orig_cat = (row.get("category") or "").strip()
        default_cat = "Sales" if txn_type == "Income" else "Operations"
        clean_cat = standardize_with_regex(orig_cat, CATEGORY_MAP, fallback=default_cat)
        if txn_type == "Income" and clean_cat not in VALID_INCOME_CATS:
            clean_cat = "Other Income"
        elif txn_type == "Expense" and clean_cat not in VALID_EXPENSE_CATS:
            clean_cat = "Other Expenses"
        if clean_cat != orig_cat:
            report["categories_standardized"] += 1

        # 6. Standardize Payment Method
        orig_pm = (row.get("payment_method") or "").strip()
        clean_pm = standardize_with_regex(orig_pm, PAYMENT_MAP, fallback="UPI")
        if clean_pm != orig_pm:
            report["payment_methods_standardized"] += 1

        # 7. Standardize Status
        orig_status = (row.get("status") or "").strip()
        clean_status = standardize_with_regex(orig_status, STATUS_MAP, fallback="Completed")
        if clean_status != orig_status:
            report["statuses_standardized"] += 1

        # 8. Impute missing metadata
        raw_cust = (row.get("customer_id") or "").strip()
        if not raw_cust or raw_cust.lower() in ("none", "nan", "null"):
            clean_cust = "CUST_ANON"
            report["missing_customer_ids_imputed"] += 1
        else:
            clean_cust = raw_cust

        raw_merch = (row.get("merchant") or "").strip()
        if not raw_merch or raw_merch.lower() in ("none", "nan", "null"):
            clean_merch = "Direct Merchant Partner"
            report["missing_merchants_imputed"] += 1
        else:
            clean_merch = raw_merch

        raw_reg = (row.get("region") or "").strip()
        if not raw_reg or raw_reg.lower() in ("none", "nan", "null"):
            clean_reg = "Central"
            report["missing_regions_imputed"] += 1
        else:
            clean_reg = raw_reg.title()

        cleaned_records.append({
            "transaction_id": txn_id,
            "transaction_date": clean_date,
            "transaction_type": txn_type,
            "amount": f"{clean_amt:.2f}",
            "category": clean_cat,
            "payment_method": clean_pm,
            "customer_id": clean_cust,
            "merchant": clean_merch,
            "status": clean_status,
            "region": clean_reg,
            "currency": "INR",
        })

    # Sort deterministically
    cleaned_records.sort(key=lambda r: (r["transaction_date"], r["transaction_id"]))

    final_rows = len(cleaned_records)
    report["final_cleaned_rows"] = final_rows
    report["clean_retention_rate_pct"] = round((final_rows / initial_rows) * 100.0, 2)

    # Write cleaned CSV
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
    with open(clean_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(cleaned_records)

    with open(report_path, mode="w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print("\n" + "=" * 55)
    print("FINSIGHT DATA CLEANING PIPELINE COMPLETED")
    print(f"Initial Raw Records:             {initial_rows:,}")
    print(f"Duplicates Removed:              {report['duplicates_removed']:,}")
    print(f"Corrupted Dates Dropped:         {report['corrupted_dates_dropped']:,}")
    print(f"Zero/Invalid Amounts Dropped:    {report['zero_or_invalid_amounts_dropped']:,}")
    print(f"Negative Amounts Rectified:      {report['negative_amounts_rectified']:,}")
    print(f"Categories Standardized:         {report['categories_standardized']:,}")
    print(f"Payment Methods Standardized:    {report['payment_methods_standardized']:,}")
    print(f"Statuses Standardized:           {report['statuses_standardized']:,}")
    print(f"Missing Customer IDs Imputed:    {report['missing_customer_ids_imputed']:,}")
    print(f"Missing Merchants Imputed:       {report['missing_merchants_imputed']:,}")
    print(f"Missing Regions Imputed:         {report['missing_regions_imputed']:,}")
    print(f"Final Cleaned Records:           {final_rows:,} ({report['clean_retention_rate_pct']}%)")
    print("=" * 55 + "\n")


if __name__ == "__main__":
    run_pipeline()
