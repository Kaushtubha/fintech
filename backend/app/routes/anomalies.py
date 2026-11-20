"""
FinSight Anomaly Detection Route
Returns flagged transactions with statistical rationale, severity, and audit status.
"""

from typing import Optional
from fastapi import APIRouter
from backend.app.services.anomaly_service import AnomalyService

router = APIRouter(prefix="/api/anomalies", tags=["Anomalies"])


@router.get("")
def get_anomalies(
    method: Optional[str] = "all",
    category: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = 100,
):
    return AnomalyService.detect_anomalies(
        method=method,
        category=category,
        severity=severity,
        limit=limit,
    )


@router.get("/summary")
def get_anomaly_summary():
    return AnomalyService.get_anomaly_summary()
