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
import { StrategicRealityCheck } from "@/components/reality-check";

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
    <div className="glass-card p-4 border-l-2 border-cyan-500/20">
      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">
        [INIT] Telemetry Stream: {symbol}
      </h4>
      <ul className="space-y-2">
        {articles.map((a) => (
          <li key={a.id} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-sm bg-slate-700 mt-1.5 shrink-0" />
            <span className="text-[11px] text-slate-400 font-mono italic">{a.title}</span>
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
    <div className="space-y-8 animate-fade-in font-mono">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white uppercase">
          [INIT] Prediction Engine
        </h2>
        <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest leading-relaxed">
          LSTM + Attention mechanism for high-frequency dependency mapping.
        </p>
      </div>

      {/* Controls */}
      <div className="glass-card p-5 border-t border-white/5">
        <div className="flex flex-wrap gap-6 items-end">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              [SYMBOL] TARGET
            </span>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="input-glass min-w-[200px] text-xs font-bold"
            >
              {symbols.map((s) => (
                <option key={s.symbol} value={s.symbol}>
                  {s.symbol} :: {s.name.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              [HORIZON] ΔT
            </span>
            <input
              type="number"
              min={1}
              max={30}
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
              className="input-glass w-24 text-xs font-bold"
            />
          </label>
          <button
            type="button"
            onClick={runPrediction}
            disabled={loading || history.length < 2}
            className="btn-primary rounded-none border border-cyan-500/50 hover:bg-cyan-500/20"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
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
                [CALC] EXECUTING…
              </span>
            ) : (
              "[INIT] RUN_PREDICTION"
            )}
          </button>
        </div>
      </div>

      <NewsWidget symbol={symbol} />

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-5 border-t border-cyan-500/20">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
            [OK] Price Action Delta
          </h3>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.05)" />
                  <XAxis dataKey="date" stroke="#334155" fontSize={9} tickLine={false} />
                  <YAxis stroke="#334155" fontSize={9} tickLine={false} domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(2,6,23,0.95)",
                      border: "1px solid rgba(148,163,184,0.1)",
                      borderRadius: "0px",
                      fontSize: "10px",
                      fontFamily: "monospace",
                    }}
                  />
                  <Line
                    type="stepAfter"
                    dataKey="close"
                    stroke="#0ea5e9"
                    strokeWidth={1.5}
                    name="Valuation"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-slate-600 text-[10px] uppercase">[ERROR] NO TELEMETRY DATA</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-5 border-t border-violet-500/20">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
            [CALC] Attention Weight Distribution
          </h3>
          {attentionData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attentionData} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.05)" />
                  <XAxis
                    type="number"
                    domain={[0, 1]}
                    stroke="#334155"
                    fontSize={9}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#334155"
                    fontSize={9}
                    width={50}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(2,6,23,0.95)",
                      border: "1px solid rgba(148,163,184,0.1)",
                      borderRadius: "0px",
                      fontSize: "10px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#8b5cf6"
                    name="Attention"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-slate-600 text-[10px] uppercase">
                [WAIT] RUN_PREDICTION TO GENERATE WEIGHT MATRIX
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Prediction result */}
      {prediction && (
        <div className="glass-card p-5 animate-slide-up border-l-4 border-cyan-500/40">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
            [OK] Mechanical Vector Output
          </h3>
          <div className="flex items-center gap-8">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-sm ${prediction.direction === "up" ? "bg-emerald-500/5 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/5 text-rose-400 border border-rose-500/20"}`}
            >
              <span className="text-xs font-bold uppercase tracking-widest">
                {prediction.direction}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 uppercase tracking-tight">
              Predicted Delta:{" "}
              <span className="text-white font-bold">{prediction.predicted_return.toFixed(6)}</span>
            </span>
            <span className="text-[11px] text-slate-400 uppercase tracking-tight">
              Model Variance:{" "}
              <span className="text-white font-bold">{prediction.uncertainty.toFixed(4)}</span>
            </span>
          </div>
        </div>
      )}

      {/* Narrative */}
      {narrative && (
        <div className="glass-card p-5 animate-slide-up border-l-4 border-violet-500/40 bg-violet-500/5">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
            [CALC] Neural Inference Narrative
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-6 font-mono italic">
            {narrative.narrative}
          </p>
          <div className="space-y-2">
            {narrative.bullet_points.map((b, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-violet-500 font-bold shrink-0">::</span>
                <span className="text-[11px] text-slate-400 uppercase tracking-tight leading-snug">
                  {b}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <StrategicRealityCheck />
    </div>
  );
}
