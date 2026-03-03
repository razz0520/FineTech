from __future__ import annotations

from sqlalchemy import String, DateTime, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base, IdMixin


class PriceHistory(Base, IdMixin):
    __tablename__ = "price_history"

    symbol: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    timestamp: Mapped[object] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    open: Mapped[float] = mapped_column(Numeric(20, 4), nullable=False)
    high: Mapped[float] = mapped_column(Numeric(20, 4), nullable=False)
    low: Mapped[float] = mapped_column(Numeric(20, 4), nullable=False)
    close: Mapped[float] = mapped_column(Numeric(20, 4), nullable=False)
    volume: Mapped[float] = mapped_column(Numeric(20, 2), nullable=True)
    source: Mapped[str] = mapped_column(String(32), nullable=False)
