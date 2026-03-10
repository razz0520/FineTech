"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { API_BASE } from "@/lib/api";
import {
  mockPortfolios,
  mockRiskMetrics,
  mockSnapshots,
  type MockPortfolio,
} from "@/lib/mock-data";
import { StrategicRealityCheck } from "@/components/reality-check";

const DEV_USER_ID = process.env.NEXT_PUBLIC_DEV_USER_ID || "00000000-0000-0000-0000-000000000001";
const headers = { "X-User-Id": DEV_USER_ID };

const RISK_BADGES: Record<string, { label: string; class: string }> = {
  sharpe: {
    label: "[OK] Sharpe Ratio",
    class: "text-emerald-400 bg-emerald-500/5 border-emerald-500/20",
  },
  var: { label: "[CALC] VaR (95%)", class: "text-violet-400 bg-violet-500/5 border-violet-500/20" },
  vol: { label: "[INIT] Volatility", class: "text-cyan-400 bg-cyan-500/5 border-cyan-500/20" },
};

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<MockPortfolio[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<{ date: string; total_value: number }[]>([]);
  const [metrics, setMetrics] = useState({ sharpe_ratio: 0, var_95: 0, volatility: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/portfolio/`, { headers });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data && data.length > 0) {
          setPortfolios(data);
          setSelectedId(data[0].id);
        } else {
          const mocks = mockPortfolios();
          setPortfolios(mocks);
          setSelectedId(mocks[0].id);
        }
      } catch {
        const mocks = mockPortfolios();
        setPortfolios(mocks);
        setSelectedId(mocks[0].id);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    async function loadDetail() {
      try {
        const [histRes, metrRes] = await Promise.all([
          fetch(`${API_BASE}/api/portfolio/${selectedId}/history`, { headers }),
          fetch(`${API_BASE}/api/portfolio/${selectedId}/metrics`, { headers }),
        ]);
        if (histRes.ok) setHistory(await histRes.json());
        else setHistory(mockSnapshots());
        if (metrRes.ok) setMetrics(await metrRes.json());
        else setMetrics(mockRiskMetrics());
      } catch {
        setHistory(mockSnapshots());
        setMetrics(mockRiskMetrics());
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [selectedId]);

  const activePortfolio = portfolios.find((p) => p.id === selectedId);
  const isTechConcentrated =
    activePortfolio?.positions.some((p) =>
      ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"].includes(p.symbol),
    ) || false;

  return (
    <div className="space-y-8 animate-fade-in font-mono">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white uppercase">
          [INIT] Risk Officer Console
        </h2>
        <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest leading-relaxed">
          Capital allocation and performance verification sub-system.
        </p>
      </div>

      {isTechConcentrated && (
        <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-none animate-pulse">
          <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">
            [WARN] TECH CONCENTRATION RISK DETECTED
          </p>
          <p className="text-[10px] text-slate-500 mt-1 uppercase">
            Current allocation indicates high dependency on structural tech sector volatility. Alpha
            targets at risk due to positive correlation across top-tier equity positions.
          </p>
        </div>
      )}

      {/* Portfolio selector */}
      <div className="flex flex-wrap gap-4">
        {portfolios.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${selectedId === p.id ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold" : "bg-slate-900/50 text-slate-500 border border-white/5 hover:border-white/10"}`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-40 animate-pulse bg-slate-900/20" />
          ))}
        </div>
      ) : activePortfolio ? (
        <div className="space-y-6">
          {/* Main metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="glass-card p-5 border-t border-emerald-500/20">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                {RISK_BADGES.sharpe.label}
              </p>
              <p className="text-2xl font-bold text-emerald-400">
                {metrics.sharpe_ratio.toFixed(2)}
              </p>
              <p className="text-[10px] text-slate-500 uppercase mt-1">Efficiency Baseline: 1.0</p>
            </div>
            <div className="glass-card p-5 border-t border-violet-500/20">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                {RISK_BADGES.var.label}
              </p>
              <p className="text-2xl font-bold text-violet-400">
                {(metrics.var_95 * 100).toFixed(2)}%
              </p>
              <p className="text-[10px] text-slate-500 uppercase mt-1">Probabilistic Floor</p>
            </div>
            <div className="glass-card p-5 border-t border-cyan-500/20">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                {RISK_BADGES.vol.label}
              </p>
              <p className="text-2xl font-bold text-cyan-400">
                {(metrics.volatility * 100).toFixed(2)}%
              </p>
              <p className="text-[10px] text-slate-500 uppercase mt-1">Systemic Noise Index</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Chart */}
            <div className="lg:col-span-2 glass-card p-5 border-t border-white/5">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                [OK] Historic Telemetry: {activePortfolio.name}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="valGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.05)" />
                    <XAxis
                      dataKey="date"
                      stroke="#334155"
                      fontSize={9}
                      tickLine={false}
                      tickFormatter={(val) => val.split("-").slice(1).join("/")}
                    />
                    <YAxis stroke="#334155" fontSize={9} tickLine={false} hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(2,6,23,0.95)",
                        border: "1px solid rgba(148,163,184,0.1)",
                        borderRadius: "0px",
                        fontSize: "10px",
                        fontFamily: "monospace",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total_value"
                      stroke="#0ea5e9"
                      fillOpacity={1}
                      fill="url(#valGradient)"
                      strokeWidth={1.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Positions */}
            <div className="glass-card p-5 border-t border-white/5">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                [INIT] Liquidity Units
              </h3>
              <div className="space-y-3">
                {activePortfolio.positions.map((p) => {
                  const currentPrice = 200; // Mock price
                  const value = p.quantity * currentPrice;
                  const pl = value - p.quantity * p.cost_basis;
                  const plPerc = (pl / (p.quantity * p.cost_basis)) * 100;
                  return (
                    <div key={p.symbol} className="p-3 bg-slate-900/40 border border-white/5">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-white uppercase">{p.symbol}</span>
                        <span
                          className={`text-[10px] font-bold ${pl >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {pl >= 0 ? "+" : ""}
                          {plPerc.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-tight">
                        <span>Units: {p.quantity}</span>
                        <span>Value: ${value.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-10 text-center border-dashed border-rose-500/20">
          <p className="text-rose-400 font-bold uppercase tracking-widest">
            [ERROR] NO OPERATIONAL PORTFOLIO
          </p>
        </div>
      )}

      <StrategicRealityCheck />
    </div>
  );
}
