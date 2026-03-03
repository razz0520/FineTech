from __future__ import annotations

import uuid
from sqlalchemy import String, Text, DateTime, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base, IdMixin, TimestampedMixin


class NewsArticle(Base, IdMixin, TimestampedMixin):
    __tablename__ = "news_articles"

    title: Mapped[str] = mapped_column(String(1024), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    url: Mapped[str | None] = mapped_column(Text, nullable=True)
    source: Mapped[str | None] = mapped_column(String(128), nullable=True)
    published_at: Mapped[object] = mapped_column(DateTime(timezone=True), nullable=True)
    symbols: Mapped[list | None] = mapped_column(JSONB, nullable=True)


class NewsSentiment(Base, IdMixin, TimestampedMixin):
    __tablename__ = "news_sentiment"

    article_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("news_articles.id", ondelete="CASCADE"), nullable=False)
    symbol: Mapped[str | None] = mapped_column(String(32), nullable=True)
    score_positive: Mapped[float] = mapped_column(Float, nullable=True)
    score_negative: Mapped[float] = mapped_column(Float, nullable=True)
    score_neutral: Mapped[float] = mapped_column(Float, nullable=True)
    label: Mapped[str | None] = mapped_column(String(32), nullable=True)
