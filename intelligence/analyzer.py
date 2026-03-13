"""
analyzer.py – Analyzes stored opportunities to compute key metrics:
  - Top agencies by number of opportunities
  - Top NAICS codes
  - Common set-asides
  - Frequently used keywords (from titles and descriptions)
"""
import re
from collections import Counter
from typing import Any

# Common English stop-words to exclude from keyword analysis
_STOP_WORDS = {
    "a", "an", "the", "and", "or", "of", "to", "in", "for", "on", "with",
    "at", "by", "from", "is", "it", "its", "be", "as", "are", "was", "were",
    "this", "that", "not", "but", "have", "had", "has", "he", "she", "they",
    "we", "i", "you", "do", "did", "will", "would", "could", "should", "may",
    "can", "no", "if", "up", "out", "so", "than", "then", "into", "over",
    "under", "about", "such", "any", "all", "each", "which", "who", "what",
    "how", "when", "where", "there", "their", "other", "per", "our", "your",
    "us", "new", "also", "only", "more", "same", "two", "one", "three", "s",
}


def _top_n(counter: Counter, n: int = 5) -> list[dict[str, Any]]:
    return [{"value": val, "count": cnt} for val, cnt in counter.most_common(n) if val]


def analyze(opportunities: list[dict]) -> dict[str, Any]:
    """
    Analyze a list of normalized opportunity dicts and return aggregated metrics.

    Returns a dict with keys:
        total_records   – total number of records analyzed
        top_agencies    – list of {value, count} for the 5 most active agencies
        top_naics       – list of {value, count} for the 5 most common NAICS codes
        top_set_asides  – list of {value, count} for the 5 most common set-asides
        top_keywords    – list of {value, count} for the 10 most frequent keywords
    """
    agencies: Counter = Counter()
    naics: Counter = Counter()
    set_asides: Counter = Counter()
    keywords: Counter = Counter()

    for opp in opportunities:
        agency = (opp.get("agency") or "").strip()
        if agency:
            agencies[agency] += 1

        code = (opp.get("naics_code") or "").strip()
        if code:
            naics[code] += 1

        sa = (opp.get("set_aside") or "").strip()
        if sa:
            set_asides[sa] += 1

        # Extract keywords from title + description
        text = " ".join(
            filter(None, [opp.get("title", ""), opp.get("description", "")])
        )
        for word in re.findall(r"[a-zA-Z]{3,}", text.lower()):
            if word not in _STOP_WORDS:
                keywords[word] += 1

    return {
        "total_records": len(opportunities),
        "top_agencies": _top_n(agencies, 5),
        "top_naics": _top_n(naics, 5),
        "top_set_asides": _top_n(set_asides, 5),
        "top_keywords": _top_n(keywords, 10),
    }
