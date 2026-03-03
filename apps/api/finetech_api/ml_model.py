"""LSTM+attention module for inference (mirrors services/ml/timeseries/model.py)."""
from __future__ import annotations

import torch
import torch.nn as nn


class LSTMAttentionPredictor(nn.Module):
    def __init__(
        self,
        input_size: int = 1,
        hidden_size: int = 64,
        num_layers: int = 2,
        dropout: float = 0.0,
    ):
        super().__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(
            input_size,
            hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0,
        )
        self.attention_score = nn.Linear(hidden_size * 2, 1)
        self.fc = nn.Sequential(
            nn.Linear(hidden_size, hidden_size),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_size, 1),
        )

    def forward(self, x: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        lstm_out, (h_n, _) = self.lstm(x)
        h_T = h_n[-1]
        batch, seq_len, _ = lstm_out.shape
        h_T_expanded = h_T.unsqueeze(1).expand(-1, seq_len, -1)
        score_input = torch.cat([h_T_expanded, lstm_out], dim=-1)
        e_t = self.attention_score(score_input).squeeze(-1)
        alpha = torch.softmax(e_t, dim=1)
        c = (alpha.unsqueeze(-1) * lstm_out).sum(dim=1)
        out = self.fc(c).squeeze(-1)
        return out, alpha
