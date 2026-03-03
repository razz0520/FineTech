from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from finetech_api.db import get_session
from finetech_api.deps import get_current_user_id
from finetech_api.models import Portfolio, Position, KbDocument

router = APIRouter(prefix="/advisor", tags=["advisor"])


class QueryIn(BaseModel):
    question: str
    portfolio_id: uuid.UUID | None = None


class QueryOut(BaseModel):
    answer: str
    citations: list[str]
    suggestions: list[str]


def _build_context(portfolio_summary: str, kb_snippets: list[str], news_snippet: str) -> str:
    parts = []
    if portfolio_summary:
        parts.append("User portfolio summary:\n" + portfolio_summary)
    if kb_snippets:
        parts.append("Relevant knowledge base excerpts:\n" + "\n".join(kb_snippets[:5]))
    if news_snippet:
        parts.append("Recent market/news context:\n" + news_snippet)
    return "\n\n".join(parts) if parts else "No additional context."


@router.post("/query", response_model=QueryOut)
async def advisor_query(
    body: QueryIn,
    session: AsyncSession = Depends(get_session),
    user_id: uuid.UUID = Depends(get_current_user_id),
) -> QueryOut:
    portfolio_summary = ""
    if body.portfolio_id:
        result = await session.execute(
            select(Portfolio).where(Portfolio.id == body.portfolio_id, Portfolio.user_id == user_id)
        )
        p = result.scalar_one_or_none()
        if p:
            pos_result = await session.execute(
                select(Position).where(Position.portfolio_id == p.id, Position.closed_at.is_(None))
            )
            positions = pos_result.scalars().all()
            portfolio_summary = ", ".join(
                f"{pos.symbol}: {float(pos.quantity)} @ {float(pos.cost_basis)}" for pos in positions
            ) or "No open positions."

    kb_result = await session.execute(
        select(KbDocument).where(KbDocument.content.isnot(None)).limit(5)
    )
    kb_rows = kb_result.scalars().all()
    kb_snippets = [r.content[:500] for r in kb_rows if r.content]

    context = _build_context(portfolio_summary, kb_snippets, "Market context not loaded.")
    prompt = f"""You are an educational financial assistant. Do not give personalized financial advice or recommend specific trades.
Answer the following question based only on the context and general knowledge. Be concise and educational.

Context:
{context}

Question: {body.question}

Provide a short answer (2-4 sentences), then list 1-3 bullet suggestions (educational only)."""

    try:
        import os
        import google.generativeai as genai
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            text = response.text or "I couldn't generate a response. Please try again."
        else:
            text = (
                "This is a placeholder response. Set GEMINI_API_KEY to enable the AI advisor. "
                "The advisor uses RAG over your portfolio and knowledge base to provide educational answers only."
            )
    except Exception as e:
        text = f"Advisor temporarily unavailable: {e!s}. This is for educational use only."

    lines = [t.strip() for t in text.split("\n") if t.strip()]
    answer = lines[0] if lines else text
    suggestions = [l.lstrip("- ").strip() for l in lines[1:] if l.startswith("-") or l.startswith("*")][:3]
    citations = []
    if kb_snippets:
        citations.append("Knowledge base excerpts were used to inform this response.")
    return QueryOut(answer=answer, citations=citations, suggestions=suggestions)
