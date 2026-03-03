from __future__ import annotations

import uuid
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, IdMixin, TimestampedMixin


class User(Base, IdMixin, TimestampedMixin):
    __tablename__ = "users"

    email: Mapped[str | None] = mapped_column(String(255), unique=True, index=True, nullable=True)
    wallet_address: Mapped[str | None] = mapped_column(String(42), unique=True, index=True, nullable=True)
    siwe_nonce: Mapped[str | None] = mapped_column(String(64), nullable=True)
    display_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    profile_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    auth_providers: Mapped[list["AuthProvider"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    user_settings: Mapped[list["UserSettings"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class AuthProvider(Base, IdMixin, TimestampedMixin):
    __tablename__ = "auth_providers"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    provider: Mapped[str] = mapped_column(String(64), nullable=False)
    provider_user_id: Mapped[str] = mapped_column(String(255), nullable=False)

    user: Mapped["User"] = relationship(back_populates="auth_providers")


class UserSettings(Base, IdMixin, TimestampedMixin):
    __tablename__ = "user_settings"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    key: Mapped[str] = mapped_column(String(128), nullable=False)
    value_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    user: Mapped["User"] = relationship(back_populates="user_settings")
