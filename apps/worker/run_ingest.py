"""
Standalone script: fetch news, optionally score sentiment, POST to API /api/news/ingest.
Set NEWS_API_KEY, API_BASE_URL (default http://api:8000).
"""
from __future__ import annotations

import os
import httpx

API_BASE = os.environ.get("API_BASE_URL", "http://api:8000")
NEWS_API_KEY = os.environ.get("NEWS_API_KEY", "")


def fetch_news() -> list[dict]:
    if not NEWS_API_KEY:
        return []
    with httpx.Client() as client:
        r = client.get(
            "https://newsapi.org/v2/top-headlines",
            params={"category": "business", "apiKey": NEWS_API_KEY, "pageSize": 20},
            timeout=10,
        )
    if r.status_code != 200:
        return []
    return r.json().get("articles", [])


def main() -> None:
    articles = fetch_news()
    payload = []
    for a in articles:
        title = (a.get("title") or "").strip()
        if not title:
            continue
        payload.append({
            "title": title,
            "description": (a.get("description") or "").strip(),
            "url": a.get("url"),
            "source": a.get("source", {}).get("name") if isinstance(a.get("source"), dict) else None,
            "publishedAt": a.get("publishedAt"),
            "symbols": [],
            "sentiment_label": "neutral",
            "score_positive": 0.33,
            "score_negative": 0.33,
            "score_neutral": 0.34,
        })
    if not payload:
        print("No articles to ingest")
        return
    with httpx.Client() as client:
        r = client.post(f"{API_BASE}/api/news/ingest", json=payload, timeout=30)
    print(f"Ingested: {r.json().get('ingested', 0)} articles")


if __name__ == "__main__":
    main()
