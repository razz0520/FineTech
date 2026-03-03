from __future__ import annotations

import uuid
import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from finetech_api.db import get_session
from finetech_api.models import User

router = APIRouter(prefix="/auth/siwe", tags=["auth"])


class NonceIn(BaseModel):
    address: str


class VerifyIn(BaseModel):
    address: str
    message: str
    signature: str
    nonce: str


@router.post("/nonce")
async def get_nonce(body: NonceIn) -> dict:
    if not body.address or not body.address.startswith("0x") or len(body.address) != 42:
        raise HTTPException(status_code=400, detail="Invalid Ethereum address")
    nonce = secrets.token_hex(32)
    return {"nonce": nonce, "address": body.address}


@router.post("/verify")
async def verify_signature(
    body: VerifyIn,
    session: AsyncSession = Depends(get_session),
) -> dict:
    if not body.address or not body.signature or not body.nonce:
        raise HTTPException(status_code=400, detail="Missing address, signature, or nonce")
    # In production: verify EIP-4361 message and signature via eth_account or web3.
    # For now we accept any signature and create/link user.
    result = await session.execute(select(User).where(User.wallet_address == body.address))
    user = result.scalar_one_or_none()
    if not user:
        user = User(wallet_address=body.address, siwe_nonce=body.nonce)
        session.add(user)
        await session.flush()
    else:
        user.siwe_nonce = body.nonce
    await session.commit()
    await session.refresh(user)
    return {"user_id": str(user.id), "wallet_address": user.wallet_address}
