"""
FinSight Automated Backend & Metric Verification Tests
Validates all endpoints, HTTP status codes, calculations, and accounting rules.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_root_and_health():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "operational"

    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"


def test_dashboard_summary():
    res = client.get("/api/dashboard/summary")
    assert res.status_code == 200
    data = res.json()
    assert "total_income" in data
    assert "total_expenses" in data
    assert "net_cash_flow" in data
    assert "success_rate_pct" in data
    # Validate Net Cash Flow Identity: Income - Expenses == Net Cash Flow
    income = data["total_income"]
    expenses = data["total_expenses"]
    net = data["net_cash_flow"]
    assert round(income - expenses, 2) == round(net, 2)


def test_dashboard_trends():
    res = client.get("/api/dashboard/trends")
    assert res.status_code == 200
    trends = res.json()
    assert isinstance(trends, list)
    assert len(trends) > 0
    first = trends[0]
    assert "month" in first
    assert "income" in first
    assert "expenses" in first
    assert "net_cash_flow" in first


def test_revenue_analytics():
    res = client.get("/api/analytics/revenue")
    assert res.status_code == 200
    data = res.json()
    assert "by_category" in data
    assert "by_region" in data
    assert "top_customers" in data
    assert len(data["by_category"]) > 0


def test_expense_analytics():
    res = client.get("/api/analytics/expenses")
    assert res.status_code == 200
    data = res.json()
    assert "by_category" in data
    assert "by_merchant" in data
    assert "monthly_burn" in data


def test_transactions_pagination():
    res = client.get("/api/transactions?page=1&limit=10")
    assert res.status_code == 200
    data = res.json()
    assert data["page"] == 1
    assert data["limit"] == 10
    assert len(data["records"]) == 10
    assert data["total_records"] > 50000


def test_anomalies_endpoint():
    res = client.get("/api/anomalies?limit=15")
    assert res.status_code == 200
    anomalies = res.json()
    assert isinstance(anomalies, list)
    assert len(anomalies) > 0
    first = anomalies[0]
    assert "detection_method" in first
    assert "severity" in first
    assert "reason" in first


def test_monthly_report():
    res = client.get("/api/reports/monthly?month=2026-04")
    assert res.status_code == 200
    report = res.json()
    assert report["period"] == "2026-04"
    assert "summary" in report
    assert "key_observations" in report
    assert len(report["key_observations"]) >= 3


def test_data_quality():
    res = client.get("/api/data-quality")
    assert res.status_code == 200
    dq = res.json()
    assert "initial_raw_rows" in dq
    assert "final_cleaned_rows" in dq
    assert "clean_retention_rate_pct" in dq
