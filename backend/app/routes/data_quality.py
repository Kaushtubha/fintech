"""
FinSight Data Quality & Ingestion Summary Route
Provides audit metrics comparing raw vs cleaned records, dropped values, and imputed fields.
"""

import os
import json
from fastapi import APIRouter

router = APIRouter(prefix="/api/data-quality", tags=["Data Quality"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REPORT_PATH = os.path.join(BASE_DIR, "data", "processed", "cleaning_report.json")


@router.get("")
def get_data_quality_summary():
    """
    Returns the ingested data quality audit report.
    """
    if os.path.exists(REPORT_PATH):
        with open(REPORT_PATH, "r", encoding="utf-8") as f:
            return json.load(f)

    return {
        "status": "pending",
        "message": "Cleaning report not yet generated. Run clean_data.py to initialize."
    }
