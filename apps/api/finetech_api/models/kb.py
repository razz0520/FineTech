from __future__ import annotations

from sqlalchemy import String, Text, Integer, LargeBinary
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base, IdMixin, TimestampedMixin


class KbDocument(Base, IdMixin, TimestampedMixin):
    __tablename__ = "kb_documents"

    source_type: Mapped[str] = mapped_column(String(64), nullable=False)
    source_id: Mapped[str | None] = mapped_column(String(256), nullable=True)
    title: Mapped[str | None] = mapped_column(String(512), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    metadata_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    embedding: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
