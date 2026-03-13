"""
collector.py – Fetches recent opportunities from SAM.gov, normalizes fields,
and stores records in an SQLite database.
"""
import os
import sqlite3
import logging
from datetime import datetime, timedelta, timezone
from contextlib import contextmanager

import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

SAM_API_KEY = os.getenv("SAM_API_KEY", "")
SAM_BASE_URL = "https://api.sam.gov/opportunities/v2/search"
DB_PATH = os.getenv("SQLITE_DB_PATH", "intelligence.db")

# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def db_cursor():
    conn = get_connection()
    try:
        cur = conn.cursor()
        yield cur
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    """Create the opportunities table if it does not already exist."""
    with db_cursor() as cur:
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS opportunities (
                notice_id        TEXT PRIMARY KEY,
                title            TEXT,
                agency           TEXT,
                naics_code       TEXT,
                set_aside        TEXT,
                posted_date      TEXT,
                response_date    TEXT,
                description      TEXT,
                opportunity_type TEXT,
                fetched_at       TEXT
            )
            """
        )


# ---------------------------------------------------------------------------
# Normalization
# ---------------------------------------------------------------------------

def _extract_agency(raw: dict) -> str:
    """Extract a best-effort agency name from a raw SAM.gov record."""
    if raw.get("fullParentPathName"):
        return raw["fullParentPathName"]
    org_hierarchy = raw.get("organizationHierarchy")
    if isinstance(org_hierarchy, list) and org_hierarchy:
        return org_hierarchy[0].get("name", "")
    return raw.get("department", "")


def _normalize(raw: dict) -> dict:
    """Map a raw SAM.gov opportunity dict to our canonical schema."""
    return {
        "notice_id": raw.get("noticeId") or raw.get("solicitationNumber") or "",
        "title": raw.get("title") or "",
        "agency": _extract_agency(raw),
        "naics_code": raw.get("naicsCode") or "",
        "set_aside": raw.get("typeOfSetAside") or raw.get("setAside") or "",
        "posted_date": raw.get("postedDate") or "",
        "response_date": raw.get("responseDeadLine") or raw.get("archiveDate") or "",
        "description": raw.get("description") or "",
        "opportunity_type": raw.get("type") or raw.get("opportunityType") or "",
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }


# ---------------------------------------------------------------------------
# SAM.gov fetch
# ---------------------------------------------------------------------------

def _fetch_page(posted_from: str, posted_to: str, offset: int = 0, limit: int = 100) -> dict:
    """Fetch a single page of opportunities from SAM.gov."""
    params = {
        "api_key": SAM_API_KEY,
        "postedFrom": posted_from,
        "postedTo": posted_to,
        "limit": limit,
        "offset": offset,
    }
    resp = requests.get(SAM_BASE_URL, params=params, timeout=30)
    resp.raise_for_status()
    return resp.json()


def collect(days_back: int = 30, max_records: int = 500) -> int:
    """
    Fetch up to *max_records* opportunities posted in the last *days_back* days
    from SAM.gov, normalize them, and upsert into SQLite.

    Returns the number of records written.
    """
    init_db()

    if not SAM_API_KEY:
        logger.warning("SAM_API_KEY is not set – skipping live fetch, returning 0 records.")
        return 0

    today = datetime.now(timezone.utc)
    posted_from = (today - timedelta(days=days_back)).strftime("%m/%d/%Y")
    posted_to = today.strftime("%m/%d/%Y")

    written = 0
    offset = 0
    limit = min(100, max_records)

    while written < max_records:
        try:
            data = _fetch_page(posted_from, posted_to, offset=offset, limit=limit)
        except requests.HTTPError as exc:
            logger.error("SAM.gov request failed: %s", exc)
            break

        opportunities = data.get("opportunitiesData") or data.get("opportunities") or []
        if not opportunities:
            break

        with db_cursor() as cur:
            for raw in opportunities:
                record = _normalize(raw)
                if not record["notice_id"]:
                    continue
                cur.execute(
                    """
                    INSERT INTO opportunities
                        (notice_id, title, agency, naics_code, set_aside,
                         posted_date, response_date, description, opportunity_type, fetched_at)
                    VALUES
                        (:notice_id, :title, :agency, :naics_code, :set_aside,
                         :posted_date, :response_date, :description, :opportunity_type, :fetched_at)
                    ON CONFLICT(notice_id) DO UPDATE SET
                        title            = excluded.title,
                        agency           = excluded.agency,
                        naics_code       = excluded.naics_code,
                        set_aside        = excluded.set_aside,
                        posted_date      = excluded.posted_date,
                        response_date    = excluded.response_date,
                        description      = excluded.description,
                        opportunity_type = excluded.opportunity_type,
                        fetched_at       = excluded.fetched_at
                    """,
                    record,
                )
                written += 1

        total = data.get("totalRecords", 0)
        offset += len(opportunities)
        if offset >= total or offset >= max_records:
            break

    logger.info("collect() wrote %d records to %s", written, DB_PATH)
    return written


def load_all() -> list[dict]:
    """Return all stored opportunities as a list of dicts."""
    init_db()
    with db_cursor() as cur:
        cur.execute("SELECT * FROM opportunities")
        return [dict(row) for row in cur.fetchall()]
