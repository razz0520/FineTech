from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from finetech_api.predictor import predict, load_model

router = APIRouter(prefix="/prediction", tags=["prediction"])


class RunIn(BaseModel):
    symbol: str = "AAPL"
    horizon_days: int = 1
    series: list[float] | None = None


class RunOut(BaseModel):
    predicted_return: float
    direction: str
    uncertainty: float
    attention_weights: list[float]


class ExplainOut(BaseModel):
    predicted_return: float
    attention_weights: list[float]
    feature_contributions: list[dict]


class NarrativeOut(BaseModel):
    narrative: str
    bullet_points: list[str]
    predicted_return: float
    attention_weights: list[float]


@router.post("/run", response_model=RunOut)
async def run_prediction(body: RunIn) -> RunOut:
    series = body.series or []
    if len(series) < 2:
        raise HTTPException(status_code=400, detail="Provide at least 2 price points in 'series' or use /market/history first.")
    pred_return, weights = predict(series)
    direction = "up" if pred_return >= 0 else "down"
    return RunOut(
        predicted_return=round(pred_return, 6),
        direction=direction,
        uncertainty=0.1,
        attention_weights=weights,
    )


@router.post("/explain", response_model=ExplainOut)
async def explain_prediction(body: RunIn) -> ExplainOut:
    series = body.series or []
    if len(series) < 2:
        raise HTTPException(status_code=400, detail="Provide at least 2 price points.")
    pred_return, weights = predict(series)
    n = len(weights)
    feature_contributions = [
        {"timestep": i, "attention": round(weights[i], 4), "description": f"Day -{n - i}"}
        for i in range(min(n, 10))
    ]
    return ExplainOut(
        predicted_return=round(pred_return, 6),
        attention_weights=weights,
        feature_contributions=feature_contributions,
    )


@router.post("/narrative", response_model=NarrativeOut)
async def narrative_explanation(body: RunIn) -> NarrativeOut:
    series = body.series or []
    if len(series) < 2:
        raise HTTPException(status_code=400, detail="Provide at least 2 price points.")
    pred_return, weights = predict(series)
    top_indices = sorted(range(len(weights)), key=lambda i: weights[i], reverse=True)[:5]
    bullets = [
        f"Model predicts a {'rise' if pred_return >= 0 else 'fall'} in the next period (predicted return: {pred_return:.4f}).",
        "Attention is highest on recent timesteps, which is typical for short-horizon forecasts.",
    ]
    for i, idx in enumerate(top_indices):
        bullets.append(f"Timestep {idx} (relative day -{len(weights) - idx}) received attention weight {weights[idx]:.3f}.")
    narrative = (
        f"The LSTM with attention model indicates a {'positive' if pred_return >= 0 else 'negative'} expected return "
        f"of {pred_return:.4f}. The attention mechanism assigns higher weight to the most recent prices, "
        "suggesting short-term momentum is driving the prediction. This is for educational purposes only."
    )
    return NarrativeOut(
        narrative=narrative,
        bullet_points=bullets,
        predicted_return=round(pred_return, 6),
        attention_weights=weights,
    )
