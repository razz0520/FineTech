from __future__ import annotations

from fastapi import APIRouter, Query, Depends
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from finetech_api.db import get_session
from finetech_api.models import NewsArticle, NewsSentiment

router = APIRouter(prefix="/news", tags=["news"])


class ArticleOut(BaseModel):
    id: str
    title: str
    description: str | None
    url: str | None
    source: str | None
    published_at: str | None
    symbols: list | None

    class Config:
        from_attributes = True


@router.get("/latest", response_model=list[ArticleOut])
async def latest_news(
    symbol: str | None = Query(None),
    limit: int = Query(20, le=50),
    session: AsyncSession = Depends(get_session),
) -> list[ArticleOut]:
    q = select(NewsArticle).order_by(desc(NewsArticle.published_at)).limit(limit * 2 if symbol else limit)
    result = await session.execute(q)
    rows = result.scalars().all()
    if symbol:
        sym = symbol.upper()
        rows = [r for r in rows if r.symbols and sym in r.symbols][:limit]
    return [
        ArticleOut(
            id=str(r.id),
            title=r.title,
            description=r.description,
            url=r.url,
            source=r.source,
            published_at=r.published_at.isoformat() if r.published_at and hasattr(r.published_at, "isoformat") else str(r.published_at) if r.published_at else None,
            symbols=r.symbols,
        )
        for r in rows
    ]


@router.post("/ingest")
async def ingest_news(body: list[dict], session: AsyncSession = Depends(get_session)) -> dict:
    """Accept list of {title, description, url, source, publishedAt} and store with sentiment."""
    from datetime import datetime
    from finetech_api.models import NewsArticle, NewsSentiment
    from sqlalchemy import select

    count = 0
    for a in body:
        title = (a.get("title") or "").strip()
        if not title:
            continue
        existing = await session.execute(select(NewsArticle).where(NewsArticle.title == title).limit(1))
        if existing.scalar_one_or_none():
            continue
        desc = (a.get("description") or "").strip()
        pub = a.get("publishedAt")
        published_at = None
        if pub:
            try:
                published_at = datetime.fromisoformat(str(pub).replace("Z", "+00:00"))
            except Exception:
                pass
        art = NewsArticle(
            title=title,
            description=desc,
            url=a.get("url"),
            source=a.get("source") if isinstance(a.get("source"), str) else (a.get("source") or {}).get("name"),
            published_at=published_at,
            symbols=a.get("symbols") or [],
        )
        session.add(art)
        await session.flush()
        label = (a.get("sentiment_label") or "neutral").lower()
        sp = a.get("score_positive", 0.33)
        sn = a.get("score_negative", 0.33)
        snu = a.get("score_neutral", 0.34)
        session.add(
            NewsSentiment(article_id=art.id, symbol=a.get("symbol"), score_positive=sp, score_negative=sn, score_neutral=snu, label=label)
        )
        count += 1
    await session.commit()
    return {"ingested": count}


@router.get("/sentiment")
async def sentiment(
    symbol: str = Query("AAPL"),
    days: int = Query(7, ge=1, le=90),
    session: AsyncSession = Depends(get_session),
) -> list[dict]:
    from sqlalchemy import and_
    from datetime import datetime, timedelta
    since = datetime.utcnow() - timedelta(days=days)
    result = await session.execute(
        select(NewsSentiment)
        .join(NewsArticle, NewsSentiment.article_id == NewsArticle.id)
        .where(NewsSentiment.symbol == symbol.upper(), NewsArticle.published_at >= since)
        .order_by(desc(NewsArticle.published_at))
        .limit(100)
    )
    rows = result.scalars().all()
    return [
        {
            "article_id": str(s.article_id),
            "symbol": s.symbol,
            "score_positive": s.score_positive,
            "score_negative": s.score_negative,
            "label": s.label,
        }
        for s in rows
    ]
