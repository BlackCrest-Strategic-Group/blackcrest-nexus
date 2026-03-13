"""
summarizer.py – Assembles analyzed metrics and a trend score into a
human-readable summary and structured key insights for the frontend.
"""
from typing import Any


def _first_value(items: list[dict]) -> str:
    """Return the 'value' field of the first list item, or an empty string."""
    return items[0]["value"] if items else ""


def summarize(metrics: dict[str, Any], trend_score: int) -> dict[str, Any]:
    """
    Build the summary payload that the frontend consumes.

    Parameters
    ----------
    metrics:
        Output of ``analyzer.analyze()``.
    trend_score:
        Integer score 0–100 from ``scorer.score()``.

    Returns
    -------
    dict with keys:
        score           – integer trend score
        summary         – one-sentence plain-text summary
        top_agency      – name of the most active agency
        top_naics       – most common NAICS code
        top_set_aside   – most common set-aside type
        top_keywords    – list of up to 10 keyword strings
        metrics         – the full metrics dict for richer frontend use
    """
    top_agency = _first_value(metrics.get("top_agencies", []))
    top_naics = _first_value(metrics.get("top_naics", []))
    top_set_aside = _first_value(metrics.get("top_set_asides", []))
    keyword_list = [kw["value"] for kw in metrics.get("top_keywords", [])]
    total = metrics.get("total_records", 0)

    # Build a plain-text summary sentence
    if total == 0:
        summary_text = (
            "No opportunity data is available yet. "
            "Run a refresh to pull the latest records from SAM.gov."
        )
    else:
        parts = [f"Analyzed {total} recent SAM.gov opportunities"]
        if top_agency:
            parts.append(f"led by {top_agency}")
        if top_naics:
            parts.append(f"(top NAICS: {top_naics})")
        if top_set_aside:
            parts.append(f"with '{top_set_aside}' as the most common set-aside")
        summary_text = " ".join(parts) + f". Trend score: {trend_score}/100."

    return {
        "score": trend_score,
        "summary": summary_text,
        "top_agency": top_agency,
        "top_naics": top_naics,
        "top_set_aside": top_set_aside,
        "top_keywords": keyword_list,
        "metrics": metrics,
    }
