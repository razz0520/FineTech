"""
Load LSTM+attention model and run inference. Model artifact from services/ml/artifacts/model.pt
"""
from __future__ import annotations

import os
from pathlib import Path
import numpy as np

try:
    import torch
except ImportError:
    torch = None

_MODEL = None
_SEQ_LEN = 60


def _get_model_path() -> Path:
    default = Path(__file__).resolve().parent.parent.parent.parent / "services" / "ml" / "artifacts" / "model.pt"
    return Path(os.environ.get("FINETECH_MODEL_PATH", str(default)))


def load_model() -> bool:
    global _MODEL, _SEQ_LEN
    if torch is None:
        return False
    path = _get_model_path()
    if not path.exists():
        return False
    try:
        ckpt = torch.load(path, map_location="cpu", weights_only=True)
        _SEQ_LEN = ckpt.get("seq_len", 60)
        from .ml_model import LSTMAttentionPredictor
        _MODEL = LSTMAttentionPredictor(input_size=1, hidden_size=64, num_layers=2, dropout=0.0)
        _MODEL.load_state_dict(ckpt["model_state"])
        _MODEL.eval()
        return True
    except Exception:
        return False


def predict(series: list[float]) -> tuple[float, list[float]]:
    """Returns (predicted_return, attention_weights)."""
    global _MODEL, _SEQ_LEN
    if _MODEL is None and not load_model():
        if len(series) < 2:
            return 0.0, []
        n = min(60, len(series))
        last = series[-1]
        prev = series[-2]
        stub_return = (last - prev) / prev if prev else 0.0
        stub_weights = [1.0 / n] * n
        return float(stub_return), stub_weights
    seq_len = min(_SEQ_LEN, len(series))
    if seq_len == 0:
        return 0.0, []
    x = np.array(series[-seq_len:], dtype=np.float32).reshape(1, -1, 1)
    with torch.no_grad():
        t = torch.tensor(x)
        out, alpha = _MODEL(t)
        pred = out.item()
        weights = alpha[0].tolist()
    return float(pred), weights
