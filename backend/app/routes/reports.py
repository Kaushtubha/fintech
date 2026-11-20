"""
FinSight Automated Reports Route
Delivers period analytics intelligence with dynamic narrative observations.
"""

from typing import Optional
from fastapi import APIRouter
from backend.app.services.report_service import ReportService

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/monthly")
def get_monthly_report(
    month: Optional[str] = None,
):
    return ReportService.generate_monthly_report(month=month)
