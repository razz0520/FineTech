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

import { API_BASE } from "@/lib/api";
import {
  mockMarketHistory,
  MOCK_SYMBOLS,
  mockPrediction,
  mockExplain,
  mockNarrative,
  mockNews,
} from "@/lib/mock-data";

function NewsWidget({ symbol }: { symbol: string }) {
  const [articles, setArticles] = useState<{ id: string; title: string; url: string | null }[]>([]);
  useEffect(() => {
    fetch(`${API_BASE}/api/news/latest?symbol=${symbol}&limit=5`)
      .then((r) => r.json())
      .then(setArticles)
      .catch(() => setArticles(mockNews(symbol)));
  }, [symbol]);
  if (articles.length === 0) return null;
  return (
    <div className="glass-card p-4">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Recent News
      </h4>
      <ul className="space-y-2">
        {articles.map((a) => (
          <li key={a.id} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 mt-1.5 shrink-0" />
            {a.url ? (
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-300 hover:text-white transition-colors truncate"
              >
                {a.title}
              </a>
            ) : (
              <span className="text-xs text-slate-400">{a.title}</span>
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
      .catch(() => setSymbols(MOCK_SYMBOLS));
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
      .catch(() => {
        setHistory(mockMarketHistory(symbol, 90));
        setPrediction(null);
        setExplain(null);
        setNarrative(null);
      })
      .finally(() => setLoading(false));
  }, [symbol]);

  const runPrediction = () => {
    const series = history.map((h) => h.close);
    if (series.length < 2) return;
    setLoading(true);

    const body = JSON.stringify({ symbol, horizon_days: horizon, series });
    const hdr = { "Content-Type": "application/json" };

    Promise.all([
      fetch(`${API_BASE}/api/prediction/run`, { method: "POST", headers: hdr, body })
        .then((r) => r.json())
        .catch(() => mockPrediction(series)) as Promise<PredictionResult>,
      fetch(`${API_BASE}/api/prediction/explain`, { method: "POST", headers: hdr, body })
        .then((r) => r.json())
        .catch(() => mockExplain(series)) as Promise<ExplainResult>,
      fetch(`${API_BASE}/api/prediction/narrative`, { method: "POST", headers: hdr, body })
        .then((r) => r.json())
        .catch(() => mockNarrative(series)) as Promise<NarrativeResult>,
    ])
      .then(([p, e, n]) => {
        setPrediction(p);
        setExplain(e);
        setNarrative(n);
      })
      .catch(() => {
        setPrediction(mockPrediction(series));
        setExplain(mockExplain(series));
        setNarrative(mockNarrative(series));
      })
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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          <span className="gradient-text">Prediction Playground</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1.5">
          Select a symbol, view history, and run the LSTM+attention model with explainable outputs.
        </p>
      </div>

      {/* Controls */}
      <div className="glass-card p-5">
        <div className="flex flex-wrap gap-4 items-end">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Symbol
            </span>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="input-glass min-w-[200px]"
            >
              {symbols.map((s) => (
                <option key={s.symbol} value={s.symbol}>
                  {s.symbol} – {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Horizon
            </span>
            <input
              type="number"
              min={1}
              max={30}
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
              className="input-glass w-20"
            />
          </label>
          <button
            type="button"
            onClick={runPrediction}
            disabled={loading || history.length < 2}
            className="btn-primary"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Running…
              </span>
            ) : (
              "Run Prediction"
            )}
          </button>
        </div>
      </div>

      <NewsWidget symbol={symbol} />

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Price History
          </h3>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                  <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis
                    stroke="#475569"
                    fontSize={10}
                    tickLine={false}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15,23,42,0.9)",
                      border: "1px solid rgba(148,163,184,0.1)",
                      borderRadius: "12px",
                      backdropFilter: "blur(12px)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    name="Close"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-slate-500 text-sm">No data available.</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            XAI – Attention Weights
          </h3>
          {attentionData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attentionData} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                  <XAxis
                    type="number"
                    domain={[0, 1]}
                    stroke="#475569"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#475569"
                    fontSize={10}
                    width={50}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15,23,42,0.9)",
                      border: "1px solid rgba(148,163,184,0.1)",
                      borderRadius: "12px",
                    }}
                  />
                  <Line type="monotone" dataKey="weight" stroke="#8b5cf6" name="Attention" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-slate-500 text-sm">
                Run prediction to see attention over timesteps.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Prediction result */}
      {prediction && (
        <div className="glass-card p-5 animate-slide-up">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Prediction Result
          </h3>
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${prediction.direction === "up" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={prediction.direction === "up" ? "" : "rotate-180"}
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
              <span className="text-sm font-semibold capitalize">{prediction.direction}</span>
            </div>
            <span className="text-sm text-slate-300">
              Predicted return:{" "}
              <span className="font-mono font-semibold text-white">
                {prediction.predicted_return.toFixed(4)}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Narrative */}
      {narrative && (
        <div className="glass-card p-5 animate-slide-up">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            AI Narrative
          </h3>
          <p className="text-sm text-slate-200 leading-relaxed mb-3 border-l-2 border-cyan-500/30 pl-4">
            {narrative.narrative}
          </p>
          <ul className="space-y-1.5">
            {narrative.bullet_points.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                <div className="w-1 h-1 rounded-full bg-cyan-500/50 mt-1.5 shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
