from __future__ import annotations

import uuid
from sqlalchemy import String, ForeignKey, Numeric, Date, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date

from .base import Base, IdMixin, TimestampedMixin


class Portfolio(Base, IdMixin, TimestampedMixin):
    __tablename__ = "portfolios"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    base_currency: Mapped[str] = mapped_column(String(8), nullable=False, default="USD")

    positions: Mapped[list["Position"]] = relationship(back_populates="portfolio", cascade="all, delete-orphan")
    transactions: Mapped[list["Transaction"]] = relationship(back_populates="portfolio", cascade="all, delete-orphan")
    snapshots: Mapped[list["PortfolioSnapshot"]] = relationship(back_populates="portfolio", cascade="all, delete-orphan")


class Position(Base, IdMixin, TimestampedMixin):
    __tablename__ = "positions"

    portfolio_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False)
    symbol: Mapped[str] = mapped_column(String(32), nullable=False)
    quantity: Mapped[float] = mapped_column(Numeric(20, 8), nullable=False)
    cost_basis: Mapped[float] = mapped_column(Numeric(20, 4), nullable=False)
    opened_at: Mapped[object] = mapped_column(DateTime(timezone=True), nullable=False)
    closed_at: Mapped[object] = mapped_column(DateTime(timezone=True), nullable=True)

    portfolio: Mapped["Portfolio"] = relationship(back_populates="positions")


class Transaction(Base, IdMixin, TimestampedMixin):
    __tablename__ = "transactions"

    portfolio_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False)
    symbol: Mapped[str] = mapped_column(String(32), nullable=False)
    side: Mapped[str] = mapped_column(String(8), nullable=False)
    quantity: Mapped[float] = mapped_column(Numeric(20, 8), nullable=False)
    price: Mapped[float] = mapped_column(Numeric(20, 4), nullable=False)
    executed_at: Mapped[object] = mapped_column(DateTime(timezone=True), nullable=False)
    type: Mapped[str] = mapped_column(String(32), nullable=False, default="buy")
    simulated: Mapped[bool] = mapped_column(nullable=False, default=True)

    portfolio: Mapped["Portfolio"] = relationship(back_populates="transactions")


class PortfolioSnapshot(Base, IdMixin, TimestampedMixin):
    __tablename__ = "portfolio_snapshots"

    portfolio_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    total_value: Mapped[float] = mapped_column(Numeric(20, 4), nullable=False)
    cash: Mapped[float] = mapped_column(Numeric(20, 4), nullable=False)
    pnl: Mapped[float] = mapped_column(Numeric(20, 4), nullable=True)
    risk_metrics: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    portfolio: Mapped["Portfolio"] = relationship(back_populates="snapshots")
