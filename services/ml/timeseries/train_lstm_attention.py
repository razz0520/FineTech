"""
Training script for LSTM+attention stock prediction model.
Saves artifact to services/ml/artifacts/model.pt
"""
from __future__ import annotations

import argparse
from pathlib import Path
import numpy as np
import torch
from torch.utils.data import TensorDataset, DataLoader

from .model import LSTMAttentionPredictor


def generate_synthetic_series(n_samples: int, seq_len: int) -> tuple[torch.Tensor, torch.Tensor]:
    t = np.linspace(0, 20, n_samples + seq_len)
    y = np.sin(t) + 0.1 * np.cumsum(np.random.randn(n_samples + seq_len) * 0.1)
    X, Y = [], []
    for i in range(n_samples):
        X.append(y[i : i + seq_len].reshape(-1, 1))
        Y.append(y[i + seq_len] - y[i + seq_len - 1])
    return torch.tensor(np.array(X), dtype=torch.float32), torch.tensor(np.array(Y), dtype=torch.float32)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--seq_len", type=int, default=60)
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--out", type=str, default="artifacts/model.pt")
    args = parser.parse_args()
    seq_len = args.seq_len
    X, Y = generate_synthetic_series(2000, seq_len)
    dataset = TensorDataset(X, Y)
    loader = DataLoader(dataset, batch_size=32, shuffle=True)
    model = LSTMAttentionPredictor(input_size=1, hidden_size=64, num_layers=2, dropout=0.2)
    opt = torch.optim.Adam(model.parameters(), lr=1e-3)
    for _ in range(args.epochs):
        for xb, yb in loader:
            opt.zero_grad()
            pred, _ = model(xb)
            loss = ((pred - yb) ** 2).mean()
            loss.backward()
            opt.step()
    out_path = Path(__file__).resolve().parent.parent / args.out
    out_path.parent.mkdir(parents=True, exist_ok=True)
    torch.save({"model_state": model.state_dict(), "seq_len": seq_len}, out_path)
    print(f"Saved to {out_path}")


if __name__ == "__main__":
    main()
