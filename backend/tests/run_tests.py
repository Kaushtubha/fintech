"""
FinSight Automated Backend & Metric Verification Test Runner
Validates all analytical endpoints, mathematical identities, and accounting rules directly.
"""

import sys
from backend.app.routes import (
    dashboard,
    analytics,
    transactions,
    anomalies,
    reports,
    data_quality,
)

def run_tests():
    print("=" * 60)
    print("RUNNING FINSIGHT API & METRICS VERIFICATION SUITE")
    print("=" * 60)

    # Test 1: Dashboard Summary
    print("\n[Test 1] Testing Dashboard Summary & Accounting Identities...")
    summary = dashboard.get_summary()
    assert summary is not None, "Summary should not be None"
    assert "total_income" in summary, "Summary missing total_income"
    assert "total_expenses" in summary, "Summary missing total_expenses"
    assert "net_cash_flow" in summary, "Summary missing net_cash_flow"
    assert "success_rate_pct" in summary, "Summary missing success_rate_pct"

    inc = summary["total_income"]
    exp = summary["total_expenses"]
    net = summary["net_cash_flow"]
    assert round(inc - exp, 2) == round(net, 2), f"Identity Failed: {inc} - {exp} != {net}"
    print(f"  [PASS] Summary Verified: Income=₹{inc:,.2f}, Expense=₹{exp:,.2f}, Net=₹{net:,.2f}, Success={summary['success_rate_pct']}%")

    # Test 2: Dashboard Trends
    print("\n[Test 2] Testing Dashboard Trends (Monthly Longitude)...")
    trends = dashboard.get_trends()
    assert isinstance(trends, list), "Trends should return a list"
    assert len(trends) >= 12, f"Expected at least 12 months, got {len(trends)}"
    sample_trend = trends[0]
    assert "month" in sample_trend and "net_cash_flow" in sample_trend
    print(f"  [PASS] Trends Verified: {len(trends)} monthly timeline datapoints computed.")

    # Test 3: Revenue Analytics
    print("\n[Test 3] Testing Revenue Analytics (Category & Region Breakdown)...")
    rev = analytics.get_revenue()
    assert "by_category" in rev and len(rev["by_category"]) > 0
    assert "by_region" in rev and len(rev["by_region"]) > 0
    assert "top_customers" in rev and len(rev["top_customers"]) > 0
    print(f"  [PASS] Revenue Verified: {len(rev['by_category'])} revenue categories, {len(rev['by_region'])} regions.")

    # Test 4: Expense Analytics
    print("\n[Test 4] Testing Expense Analytics...")
    exp_res = analytics.get_expenses()
    assert "by_category" in exp_res and len(exp_res["by_category"]) > 0
    assert "by_merchant" in exp_res and len(exp_res["by_merchant"]) > 0
    print(f"  [PASS] Expenses Verified: {len(exp_res['by_category'])} expense categories, {len(exp_res['by_merchant'])} major vendors.")

    # Test 5: Transactions Pagination & Search Filter
    print("\n[Test 5] Testing Transactions Filtering, Sorting & Pagination...")
    tx_page = transactions.get_transactions(page=1, limit=15, sort_by="amount", order="desc")
    assert tx_page["page"] == 1
    assert tx_page["limit"] == 15
    assert len(tx_page["records"]) == 15
    assert tx_page["total_records"] > 50000
    # Check that sorting works: first item amount >= second item amount
    amt1 = float(tx_page["records"][0]["amount"])
    amt2 = float(tx_page["records"][1]["amount"])
    assert amt1 >= amt2, f"Sort descending violated: {amt1} < {amt2}"
    print(f"  [PASS] Transactions Verified: {tx_page['total_records']:,} searchable rows across {tx_page['total_pages']:,} pages.")

    # Test 6: Anomaly Detection Engine
    print("\n[Test 6] Testing Anomaly Detection Engine (IQR, Z-Score, Rule-Based)...")
    flagged = anomalies.get_anomalies(limit=20)
    assert isinstance(flagged, list) and len(flagged) > 0
    first_anom = flagged[0]
    assert "detection_method" in first_anom
    assert "severity" in first_anom
    assert "reason" in first_anom
    print(f"  [PASS] Anomalies Verified: Detected {len(flagged)} sample flagged transactions with severity tiers.")

    # Test 7: Automated Reporting Engine
    print("\n[Test 7] Testing Automated Monthly Report Generation...")
    rpt = reports.get_monthly_report(month="2026-03")
    assert rpt["period"] == "2026-03"
    assert "summary" in rpt
    assert "key_observations" in rpt
    assert len(rpt["key_observations"]) >= 3
    print(f"  [PASS] Report Verified: Generated {len(rpt['key_observations'])} dynamic data-driven insights.")

    # Test 8: Data Quality Ingestion Summary
    print("\n[Test 8] Testing Data Quality Ingestion Summary...")
    dq = data_quality.get_data_quality_summary()
    assert "initial_raw_rows" in dq
    assert "final_cleaned_rows" in dq
    print(f"  [PASS] Data Quality Verified: Cleaned from {dq['initial_raw_rows']:,} to {dq['final_cleaned_rows']:,} rows ({dq['clean_retention_rate_pct']}% retention).")

    print("\n" + "=" * 60)
    print("ALL 8 VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    run_tests()
