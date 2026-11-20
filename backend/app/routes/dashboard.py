"""
FinSight Dashboard API Routes
Provides KPI summaries and longitudinal trends for executive dashboards.
"""

from typing import Optional
from fastapi import APIRouter
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary")
def get_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
    payment_method: Optional[str] = None,
    region: Optional[str] = None,
):
    """
    Returns executive KPI summary cards: Total Income, Expenses, Net Cash Flow,
    Success Rate, Volume, Average Transaction Value, and Growth %
    """
    return AnalyticsService.get_dashboard_summary(
        start_date=start_date,
        end_date=end_date,
        category=category,
        payment_method=payment_method,
        region=region,
    )


@router.get("/trends")
def get_trends(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
    region: Optional[str] = None,
):
    """
    Returns monthly historical cash flow timeline with MoM acceleration metrics.
    """
    return AnalyticsService.get_trends(
        start_date=start_date,
        end_date=end_date,
        category=category,
        region=region,
    )
