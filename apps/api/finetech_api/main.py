from collections import defaultdict
import time
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.requests import Request
from fastapi.responses import JSONResponse
import asyncio
import json

from .config import get_settings
from .routers import lms_router
from .routers import market
from .routers import prediction
from .routers import news
from .routers import portfolio
from .routers import advisor
from .routers import auth_siwe


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Finetech API",
        version="0.1.0",
        description="Backend for unified financial learning, prediction, and portfolio analytics.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    _rate_limit: dict[str, list[float]] = defaultdict(list)

    @app.middleware("http")
    async def rate_limit_middleware(request: Request, call_next):
        if request.url.path.startswith("/api/prediction") or request.url.path.startswith("/api/advisor"):
            key = request.client.host if request.client else "unknown"
            now = time.time()
            window = 60.0
            max_req = 30
            _rate_limit[key] = [t for t in _rate_limit[key] if now - t < window]
            if len(_rate_limit[key]) >= max_req:
                return JSONResponse(status_code=429, content={"detail": "Too many requests"})
            _rate_limit[key].append(now)
        return await call_next(request)

    @app.get("/health", tags=["system"])
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/version", tags=["system"])
    async def version() -> dict[str, str]:
        return {"version": "0.1.0"}

    app.include_router(lms_router, prefix="/api")
    app.include_router(market.router, prefix="/api")
    app.include_router(prediction.router, prefix="/api")
    app.include_router(news.router, prefix="/api")
    app.include_router(portfolio.router, prefix="/api")
    app.include_router(advisor.router, prefix="/api")
    app.include_router(auth_siwe.router, prefix="/api")

    @app.websocket("/ws/market")
    async def websocket_market(websocket: WebSocket):
        await websocket.accept()
        try:
            while True:
                data = await websocket.receive_text()
                msg = json.loads(data) if data else {}
                symbol = msg.get("symbol", "AAPL")
                try:
                    from .db import async_session_factory
                    from sqlalchemy import select, desc
                    from .models import PriceHistory
                    async with async_session_factory() as session:
                        r = await session.execute(
                            select(PriceHistory)
                            .where(PriceHistory.symbol == symbol.upper())
                            .order_by(desc(PriceHistory.timestamp))
                            .limit(1)
                        )
                        row = r.scalar_one_or_none()
                    if row:
                        await websocket.send_json({
                            "symbol": symbol,
                            "close": float(row.close),
                            "timestamp": row.timestamp.isoformat() if hasattr(row.timestamp, "isoformat") else str(row.timestamp),
                        })
                    else:
                        await websocket.send_json({"symbol": symbol, "close": None, "timestamp": None})
                except Exception:
                    await websocket.send_json({"symbol": symbol, "close": None, "error": "fetch failed"})
                await asyncio.sleep(5)
        except WebSocketDisconnect:
            pass

    return app


app = create_app()

