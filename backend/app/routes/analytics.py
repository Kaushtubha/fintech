"""
FinSight Specialized Analytical Endpoints
Provides granular breakdown endpoints for Revenue, Expenses, Categories, Payments, and Customers.
"""

from typing import Optional
from fastapi import APIRouter
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/revenue")
def get_revenue(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    region: Optional[str] = None,
):
    return AnalyticsService.get_revenue_analysis(
        start_date=start_date,
        end_date=end_date,
        region=region,
    )


@router.get("/expenses")
def get_expenses(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    region: Optional[str] = None,
):
    return AnalyticsService.get_expense_analysis(
        start_date=start_date,
        end_date=end_date,
        region=region,
    )


@router.get("/categories")
def get_categories(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    region: Optional[str] = None,
):
    rev = AnalyticsService.get_revenue_analysis(start_date=start_date, end_date=end_date, region=region)
    exp = AnalyticsService.get_expense_analysis(start_date=start_date, end_date=end_date, region=region)
    return {
        "income_categories": rev.get("by_category", []),
        "expense_categories": exp.get("by_category", []),
    }


@router.get("/payments")
def get_payments(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    return AnalyticsService.get_payment_analysis(
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/customers")
def get_customers(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    return AnalyticsService.get_customer_analytics(
        start_date=start_date,
        end_date=end_date,
    )
