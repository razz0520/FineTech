"""
Ingest news from NewsAPI and optionally run FinBERT sentiment. Run periodically.
"""
from __future__ import annotations

import os
import uuid
from datetime import datetime
import httpx

# Optional: FinBERT via Hugging Face or local
try:
    from transformers import pipeline
    _sentiment = pipeline("sentiment-analysis", model="ProsusAI/finbert")
except Exception:
    _sentiment = None


NEWS_API_KEY = os.environ.get("NEWS_API_KEY", "")
NEWS_API_URL = "https://newsapi.org/v2/top-headlines"


def fetch_news() -> list[dict]:
    if not NEWS_API_KEY:
        return []
    with httpx.Client() as client:
        r = client.get(
            NEWS_API_URL,
            params={"category": "business", "apiKey": NEWS_API_KEY, "pageSize": 20},
            timeout=10,
        )
    if r.status_code != 200:
        return []
    data = r.json()
    return data.get("articles", [])


def score_sentiment(text: str) -> dict:
    if not text or not _sentiment:
        return {"label": "neutral", "score_positive": 0.33, "score_negative": 0.33, "score_neutral": 0.34}
    try:
        out = _sentiment(text[:512])[0]
        label = out["label"].lower()
        score = out["score"]
        if label == "positive":
            return {"label": "positive", "score_positive": score, "score_negative": 0, "score_neutral": 1 - score}
        if label == "negative":
            return {"label": "negative", "score_positive": 0, "score_negative": score, "score_neutral": 1 - score}
        return {"label": "neutral", "score_positive": 0, "score_negative": 0, "score_neutral": score}
    except Exception:
        return {"label": "neutral", "score_positive": 0.33, "score_negative": 0.33, "score_neutral": 0.34}


async def run_ingest(session) -> int:
    from finetech_api.models import NewsArticle, NewsSentiment
    from sqlalchemy import select

    articles = fetch_news()
    count = 0
    for a in articles:
        title = (a.get("title") or "").strip()
        if not title:
            continue
        desc = (a.get("description") or "").strip()
        url = a.get("url")
        source = a.get("source", {}).get("name")
        pub = a.get("publishedAt")
        published_at = None
        if pub:
            try:
                published_at = datetime.fromisoformat(pub.replace("Z", "+00:00"))
            except Exception:
                pass
        existing = await session.execute(select(NewsArticle).where(NewsArticle.title == title).limit(1))
        if existing.scalar_one_or_none():
            continue
        art = NewsArticle(
            title=title,
            description=desc,
            url=url,
            source=source,
            published_at=published_at,
            symbols=[],
        )
        session.add(art)
        await session.flush()
        sent = score_sentiment(title + " " + (desc or ""))
        session.add(
            NewsSentiment(
                article_id=art.id,
                symbol=None,
                score_positive=sent.get("score_positive"),
                score_negative=sent.get("score_negative"),
                score_neutral=sent.get("score_neutral"),
                label=sent.get("label"),
            )
        )
        count += 1
    return count
