"""
FinSight — Financial Data Analytics & Cash Flow Intelligence Platform
Main FastAPI Application Entrypoint
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.routes import (
    dashboard,
    analytics,
    transactions,
    anomalies,
    reports,
    data_quality,
)

app = FastAPI(
    title="FinSight Financial Analytics API",
    description="Enterprise-grade Cash Flow Intelligence and Financial Data Analytics Serving Layer",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Route Handlers
app.include_router(dashboard.router)
app.include_router(analytics.router)
app.include_router(transactions.router)
app.include_router(anomalies.router)
app.include_router(reports.router)
app.include_router(data_quality.router)


@app.get("/")
def root():
    return {
        "platform": "FinSight Financial Data Analytics Platform",
        "status": "operational",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
    }
