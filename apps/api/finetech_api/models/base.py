from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import UUID
import uuid


class Base(DeclarativeBase):
    pass


class TimestampedMixin:
    created_at: Mapped[object] = mapped_column(server_default=func.now())
    updated_at: Mapped[object] = mapped_column(server_default=func.now(), onupdate=func.now())


class IdMixin:
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

