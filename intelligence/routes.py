"""
routes.py – FastAPI router exposing the opportunity intelligence endpoints.

Endpoints
---------
GET  /opportunity-intelligence
    Returns analyzed metrics, trend score, summary, and key insights
    based on the currently stored SAM.gov opportunity records.

POST /opportunity-intelligence/refresh
    Fetches the latest opportunities from SAM.gov, re-analyzes the data,
    and returns the updated intelligence payload.
"""
import logging

from fastapi import APIRouter, HTTPException

from collector import collect, load_all
from analyzer import analyze
from scorer import score
from summarizer import summarize

logger = logging.getLogger(__name__)

router = APIRouter(tags=["opportunity-intelligence"])


def _build_intelligence() -> dict:
    """Load stored records, analyze, score, and summarize them."""
    opportunities = load_all()
    metrics = analyze(opportunities)
    trend_score = score(metrics)
    return summarize(metrics, trend_score)


@router.get("/opportunity-intelligence")
def get_opportunity_intelligence() -> dict:
    """Return the current opportunity intelligence payload."""
    try:
        return _build_intelligence()
    except Exception as exc:
        logger.exception("Error building opportunity intelligence")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/opportunity-intelligence/refresh")
def refresh_opportunity_intelligence() -> dict:
    """
    Pull the latest opportunities from SAM.gov, persist them to SQLite,
    re-analyze the full dataset, and return the updated payload.
    """
    try:
        written = collect()
        payload = _build_intelligence()
        payload["records_fetched"] = written
        return payload
    except Exception as exc:
        logger.exception("Error refreshing opportunity intelligence")
        raise HTTPException(status_code=500, detail=str(exc)) from exc
