"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

function NewsWidget({ symbol }: { symbol: string }) {
  const [articles, setArticles] = useState<{ id: string; title: string; url: string | null }[]>([]);
  useEffect(() => {
    fetch(`${API_BASE}/api/news/latest?symbol=${symbol}&limit=5`)
      .then((r) => r.json())
      .then(setArticles)
      .catch(() => setArticles([]));
  }, [symbol]);
  if (articles.length === 0) return null;
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 mt-2">
      <h4 className="text-xs font-medium text-slate-400 mb-2">Recent news</h4>
      <ul className="space-y-1 text-xs">
        {articles.map((a) => (
          <li key={a.id}>
            {a.url ? (
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white truncate block"
              >
                {a.title}
              </a>
            ) : (
              <span className="text-slate-300">{a.title}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface OHLCV {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface PredictionResult {
  predicted_return: number;
  direction: string;
  uncertainty: number;
  attention_weights: number[];
}

interface ExplainResult {
  predicted_return: number;
  attention_weights: number[];
  feature_contributions: { timestep: number; attention: number; description: string }[];
}

interface NarrativeResult {
  narrative: string;
  bullet_points: string[];
  predicted_return: number;
  attention_weights: number[];
}

export default function PlaygroundPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [symbols, setSymbols] = useState<{ symbol: string; name: string }[]>([]);
  const [history, setHistory] = useState<OHLCV[]>([]);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [explain, setExplain] = useState<ExplainResult | null>(null);
  const [narrative, setNarrative] = useState<NarrativeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [horizon, setHorizon] = useState(1);

  useEffect(() => {
    fetch(`${API_BASE}/api/market/symbols`)
      .then((r) => r.json())
      .then(setSymbols)
      .catch(() => setSymbols([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/market/history?symbol=${symbol}&days=90`)
      .then((r) => r.json())
      .then((data: OHLCV[]) => {
        setHistory(data);
        setPrediction(null);
        setExplain(null);
        setNarrative(null);
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [symbol]);

  const runPrediction = () => {
    const series = history.map((h) => h.close);
    if (series.length < 2) return;
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/api/prediction/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, horizon_days: horizon, series }),
      }).then((r) => r.json()) as Promise<PredictionResult>,
      fetch(`${API_BASE}/api/prediction/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, horizon_days: horizon, series }),
      }).then((r) => r.json()) as Promise<ExplainResult>,
      fetch(`${API_BASE}/api/prediction/narrative`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, horizon_days: horizon, series }),
      }).then((r) => r.json()) as Promise<NarrativeResult>,
    ])
      .then(([p, e, n]) => {
        setPrediction(p);
        setExplain(e);
        setNarrative(n);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const chartData = history.map((h) => ({
    date: h.timestamp.slice(0, 10),
    close: h.close,
    high: h.high,
    low: h.low,
  }));

  const attentionData =
    explain?.feature_contributions?.map((f) => ({
      name: f.description,
      weight: f.attention,
    })) ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold tracking-tight">Stock Prediction Playground</h2>
      <p className="text-sm text-slate-300">
        Select a symbol, view history, and run the LSTM+attention model with explainable outputs.
      </p>

      <div className="flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Symbol</span>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="rounded border border-slate-700 bg-slate-900 text-white px-2 py-1 text-sm"
          >
            {symbols.map((s) => (
              <option key={s.symbol} value={s.symbol}>
                {s.symbol} – {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Horizon (days)</span>
          <input
            type="number"
            min={1}
            max={30}
            value={horizon}
            onChange={(e) => setHorizon(Number(e.target.value))}
            className="rounded border border-slate-700 bg-slate-900 text-white px-2 py-1 text-sm w-16"
          />
        </label>
        <button
          type="button"
          onClick={runPrediction}
          disabled={loading || history.length < 2}
          className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Running…" : "Run prediction & explain"}
        </button>
      </div>

      <NewsWidget symbol={symbol} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-sm font-medium mb-2">Price history</h3>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke="#34d399"
                    strokeWidth={2}
                    name="Close"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-sm">
                No data. Start API and ensure market history is available.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-sm font-medium mb-2">XAI – Attention weights</h3>
          {attentionData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attentionData} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" domain={[0, 1]} stroke="#94a3b8" fontSize={10} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={50} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                  />
                  <Line type="monotone" dataKey="weight" stroke="#818cf8" name="Attention" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">
              Run prediction to see attention over timesteps.
            </p>
          )}
        </div>
      </div>

      {prediction && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-sm font-medium mb-2">Prediction</h3>
          <p className="text-sm">
            Direction:{" "}
            <span className={prediction.direction === "up" ? "text-emerald-400" : "text-rose-400"}>
              {prediction.direction}
            </span>
            {" · "}
            Predicted return: {prediction.predicted_return.toFixed(4)}
          </p>
        </div>
      )}

      {narrative && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-sm font-medium mb-2">Narrative explanation</h3>
          <p className="text-sm text-slate-200 mb-2">{narrative.narrative}</p>
          <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
            {narrative.bullet_points.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
