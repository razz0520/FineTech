from __future__ import annotations

import uuid
from fastapi import Header, HTTPException

from .db import get_session


async def get_current_user_id(x_user_id: str | None = Header(None, alias="X-User-Id")) -> uuid.UUID:
    """Resolve current user from header (dev) or session/JWT later."""
    if x_user_id:
        try:
            return uuid.UUID(x_user_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid X-User-Id")
    raise HTTPException(status_code=401, detail="Not authenticated")
