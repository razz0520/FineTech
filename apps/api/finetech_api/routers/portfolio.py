from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from finetech_api.db import get_session
from finetech_api.deps import get_current_user_id
from finetech_api.models import Portfolio, Position, Transaction, PortfolioSnapshot

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


class PortfolioOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    base_currency: str
    created_at: str | None

    class Config:
        from_attributes = True


class PositionOut(BaseModel):
    id: uuid.UUID
    portfolio_id: uuid.UUID
    symbol: str
    quantity: float
    cost_basis: float
    opened_at: str
    closed_at: str | None

    class Config:
        from_attributes = True


class TransactionIn(BaseModel):
    symbol: str
    side: str
    quantity: float
    price: float


class SnapshotOut(BaseModel):
    id: uuid.UUID
    portfolio_id: uuid.UUID
    date: str
    total_value: float
    cash: float
    pnl: float | None
    risk_metrics: dict | None

    class Config:
        from_attributes = True


@router.get("/", response_model=list[PortfolioOut])
async def list_portfolios(
    session: AsyncSession = Depends(get_session),
    user_id: uuid.UUID = Depends(get_current_user_id),
) -> list[PortfolioOut]:
    result = await session.execute(select(Portfolio).where(Portfolio.user_id == user_id))
    rows = result.scalars().all()
    return [
        PortfolioOut(
            id=r.id,
            user_id=r.user_id,
            name=r.name,
            base_currency=r.base_currency,
            created_at=str(r.created_at) if r.created_at else None,
        )
        for r in rows
    ]


@router.post("/", response_model=PortfolioOut)
async def create_portfolio(
    name: str = "Default",
    base_currency: str = "USD",
    session: AsyncSession = Depends(get_session),
    user_id: uuid.UUID = Depends(get_current_user_id),
) -> PortfolioOut:
    p = Portfolio(user_id=user_id, name=name, base_currency=base_currency)
    session.add(p)
    await session.commit()
    await session.refresh(p)
    return PortfolioOut(
        id=p.id,
        user_id=p.user_id,
        name=p.name,
        base_currency=p.base_currency,
        created_at=str(p.created_at) if p.created_at else None,
    )


@router.get("/{portfolio_id}", response_model=dict)
async def get_portfolio(
    portfolio_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    user_id: uuid.UUID = Depends(get_current_user_id),
) -> dict:
    result = await session.execute(
        select(Portfolio).where(Portfolio.id == portfolio_id, Portfolio.user_id == user_id)
    )
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    pos_result = await session.execute(select(Position).where(Position.portfolio_id == portfolio_id, Position.closed_at.is_(None)))
    positions = pos_result.scalars().all()
    total = sum(float(pos.quantity * pos.cost_basis) for pos in positions)
    return {
        "id": str(p.id),
        "name": p.name,
        "base_currency": p.base_currency,
        "positions": [
            {"id": str(pos.id), "symbol": pos.symbol, "quantity": float(pos.quantity), "cost_basis": float(pos.cost_basis)}
            for pos in positions
        ],
        "total_value": round(total, 2),
    }


@router.post("/{portfolio_id}/transaction", response_model=dict)
async def add_transaction(
  portfolio_id: uuid.UUID,
  body: TransactionIn,
  session: AsyncSession = Depends(get_session),
  user_id: uuid.UUID = Depends(get_current_user_id),
) -> dict:
    result = await session.execute(
        select(Portfolio).where(Portfolio.id == portfolio_id, Portfolio.user_id == user_id)
    )
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    now = datetime.utcnow()
    tx = Transaction(
        portfolio_id=portfolio_id,
        symbol=body.symbol.upper(),
        side=body.side.lower(),
        quantity=body.quantity,
        price=body.price,
        executed_at=now,
        type="buy" if body.side.lower() == "buy" else "sell",
        simulated=True,
    )
    session.add(tx)
    await session.flush()
    if body.side.lower() == "buy":
        pos = Position(
            portfolio_id=portfolio_id,
            symbol=body.symbol.upper(),
            quantity=body.quantity,
            cost_basis=body.price,
            opened_at=now,
            closed_at=None,
        )
        session.add(pos)
    else:
        pos_result = await session.execute(
            select(Position).where(
                Position.portfolio_id == portfolio_id,
                Position.symbol == body.symbol.upper(),
                Position.closed_at.is_(None),
            ).order_by(Position.opened_at)
        )
        to_close = pos_result.scalars().all()
        remaining = body.quantity
        for pos in to_close:
            if remaining <= 0:
                break
            close_qty = min(float(pos.quantity), remaining)
            if close_qty >= float(pos.quantity):
                pos.closed_at = now
            remaining -= close_qty
    await session.commit()
    return {"status": "ok", "transaction_id": str(tx.id)}


@router.get("/{portfolio_id}/snapshots", response_model=list[SnapshotOut])
async def list_snapshots(
    portfolio_id: uuid.UUID,
    days: int = Query(30, le=365),
    session: AsyncSession = Depends(get_session),
    user_id: uuid.UUID = Depends(get_current_user_id),
) -> list[SnapshotOut]:
    result = await session.execute(
        select(Portfolio).where(Portfolio.id == portfolio_id, Portfolio.user_id == user_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Portfolio not found")
    snap_result = await session.execute(
        select(PortfolioSnapshot).where(PortfolioSnapshot.portfolio_id == portfolio_id).order_by(PortfolioSnapshot.date.desc()).limit(days)
    )
    rows = snap_result.scalars().all()
    return [
        SnapshotOut(
            id=r.id,
            portfolio_id=r.portfolio_id,
            date=r.date.isoformat(),
            total_value=float(r.total_value),
            cash=float(r.cash),
            pnl=float(r.pnl) if r.pnl is not None else None,
            risk_metrics=r.risk_metrics,
        )
        for r in rows
    ]


@router.get("/{portfolio_id}/risk")
async def get_risk(
    portfolio_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    user_id: uuid.UUID = Depends(get_current_user_id),
) -> dict:
    result = await session.execute(
        select(Portfolio).where(Portfolio.id == portfolio_id, Portfolio.user_id == user_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Portfolio not found")
    snap_result = await session.execute(
        select(PortfolioSnapshot).where(PortfolioSnapshot.portfolio_id == portfolio_id).order_by(PortfolioSnapshot.date.desc()).limit(30)
    )
    snaps = snap_result.scalars().all()
    if len(snaps) < 2:
        return {"sharpe_ratio": None, "var_95": None, "beta": None, "volatility": None}
    values = [float(s.total_value) for s in reversed(snaps)]
    returns = [(values[i] - values[i - 1]) / values[i - 1] if values[i - 1] else 0 for i in range(1, len(values))]
    import math
    vol = math.sqrt(sum(r * r for r in returns) / len(returns)) * math.sqrt(252) if returns else 0
    mean_ret = sum(returns) / len(returns) * 252 if returns else 0
    rf = 0.05
    sharpe = (mean_ret - rf) / vol if vol else None
    var_95 = None
    if returns:
        sorted_ret = sorted(returns)
        idx = max(0, int(len(sorted_ret) * 0.05) - 1)
        var_95 = abs(sorted_ret[idx]) if idx >= 0 else None
    return {"sharpe_ratio": round(sharpe, 4) if sharpe is not None else None, "var_95": var_95, "beta": None, "volatility": round(vol, 4)}