from __future__ import annotations

import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Query, Depends
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from finetech_api.db import get_session
from finetech_api.models import PriceHistory

router = APIRouter(prefix="/market", tags=["market"])


class OHLCVPoint(BaseModel):
    timestamp: str
    open: float
    high: float
    low: float
    close: float
    volume: float | None


@router.get("/symbols")
async def list_symbols() -> list[dict]:
    return [
        {"symbol": "AAPL", "name": "Apple Inc."},
        {"symbol": "MSFT", "name": "Microsoft Corporation"},
        {"symbol": "GOOGL", "name": "Alphabet Inc."},
        {"symbol": "AMZN", "name": "Amazon.com Inc."},
        {"symbol": "META", "name": "Meta Platforms Inc."},
    ]


@router.get("/history", response_model=list[OHLCVPoint])
async def get_history(
    symbol: str = Query("AAPL"),
    days: int = Query(90, ge=1, le=365),
    session: AsyncSession = Depends(get_session),
) -> list[OHLCVPoint]:
    result = await session.execute(
        select(PriceHistory)
        .where(PriceHistory.symbol == symbol.upper())
        .order_by(desc(PriceHistory.timestamp))
        .limit(days)
    )
    rows = result.scalars().all()
    if not rows:
        return _mock_ohlcv(symbol, days)
    return [
        OHLCVPoint(
            timestamp=row.timestamp.isoformat() if hasattr(row.timestamp, "isoformat") else str(row.timestamp),
            open=float(row.open),
            high=float(row.high),
            low=float(row.low),
            close=float(row.close),
            volume=float(row.volume) if row.volume is not None else None,
        )
        for row in reversed(rows)
    ]


def _mock_ohlcv(symbol: str, days: int) -> list[OHLCVPoint]:
    import random
    base = 150.0 if symbol == "AAPL" else 100.0
    out = []
    dt = datetime.utcnow() - timedelta(days=days)
    for _ in range(days):
        change = (random.random() - 0.48) * 4
        close = base
        open_p = base
        base = base + change
        high = max(open_p, base) + random.random() * 2
        low = min(open_p, base) - random.random() * 2
        out.append(
            OHLCVPoint(
                timestamp=dt.isoformat() + "Z",
                open=round(open_p, 2),
                high=round(high, 2),
                low=round(low, 2),
                close=round(base, 2),
                volume=round(random.random() * 1e6),
            )
        )
        dt += timedelta(days=1)
    return out
