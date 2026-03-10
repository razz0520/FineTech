"use client";

import { useEffect, useState, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { API_BASE } from "@/lib/api";
import { mockPortfolios, mockRiskMetrics, mockSnapshots } from "@/lib/mock-data";
const DEV_USER_ID = process.env.NEXT_PUBLIC_DEV_USER_ID || "00000000-0000-0000-0000-000000000001";
const headers = { "X-User-Id": DEV_USER_ID };

const COLORS = ["#06b6d4", "#8b5cf6", "#f472b6", "#fbbf24", "#10b981"];

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<
    { id: string; name: string; base_currency: string }[]
  >([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<{
    positions: { symbol: string; quantity: number; cost_basis: number }[];
    total_value: number;
  } | null>(null);
  const [risk, setRisk] = useState<{
    sharpe_ratio: number | null;
    var_95: number | null;
    volatility: number | null;
  } | null>(null);
  const [snapshots, setSnapshots] = useState<{ date: string; total_value: number }[]>([]);
  const [symbol, setSymbol] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [usingMock, setUsingMock] = useState(false);

  // Load portfolios
  useEffect(() => {
    fetch(`${API_BASE}/api/portfolio/`, { headers })
      .then((r) => r.json())
      .then((list: { id: string; name: string; base_currency: string }[]) => {
        setPortfolios(list);
        setSelected((prev) => prev || (list.length ? list[0].id : null));
      })
      .catch(() => {
        // Use mock data
        const mocks = mockPortfolios();
        setPortfolios(
          mocks.map((p) => ({ id: p.id, name: p.name, base_currency: p.base_currency })),
        );
        setSelected(mocks[0]?.id || null);
        setUsingMock(true);
      });
  }, []);

  // Load portfolio detail
  const loadDetail = useCallback(
    (id: string) => {
      if (usingMock) {
        const mock = mockPortfolios().find((p) => p.id === id);
        if (mock) {
          setDetail({ positions: mock.positions, total_value: mock.total_value });
          setRisk(mockRiskMetrics());
          setSnapshots(mockSnapshots());
        }
        return;
      }

      Promise.all([
        fetch(`${API_BASE}/api/portfolio/${id}`, { headers }).then((r) => r.json()),
        fetch(`${API_BASE}/api/portfolio/${id}/risk`, { headers }).then((r) => r.json()),
        fetch(`${API_BASE}/api/portfolio/${id}/snapshots?days=30`, { headers }).then((r) =>
          r.json(),
        ),
      ])
        .then(([d, r, s]) => {
          setDetail(d);
          setRisk(r);
          setSnapshots(
            Array.isArray(s)
              ? s.map((x: { date: string; total_value: number }) => ({
                  date: x.date,
                  total_value: x.total_value,
                }))
              : [],
          );
        })
        .catch(() => {
          const mock = mockPortfolios().find((p) => p.id === id) || mockPortfolios()[0];
          setDetail({ positions: mock.positions, total_value: mock.total_value });
          setRisk(mockRiskMetrics());
          setSnapshots(mockSnapshots());
          setUsingMock(true);
        });
    },
    [usingMock],
  );

  useEffect(() => {
    if (selected) loadDetail(selected);
  }, [selected, loadDetail]);

  const createPortfolio = () => {
    if (usingMock) {
      const id = crypto.randomUUID();
      setPortfolios((prev) => [
        ...prev,
        { id, name: `Portfolio ${prev.length + 1}`, base_currency: "USD" },
      ]);
      setSelected(id);
      setDetail({ positions: [], total_value: 0 });
      setRisk(mockRiskMetrics());
      setSnapshots([]);
      return;
    }
    fetch(`${API_BASE}/api/portfolio/`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((r) => r.json())
      .then((p: { id: string }) => {
        setPortfolios((prev) => [...prev, { id: p.id, name: "Default", base_currency: "USD" }]);
        setSelected(p.id);
      })
      .catch(() => {
        // Fallback
        const id = crypto.randomUUID();
        setPortfolios((prev) => [
          ...prev,
          { id, name: `Portfolio ${prev.length + 1}`, base_currency: "USD" },
        ]);
        setSelected(id);
        setDetail({ positions: [], total_value: 0 });
      });
  };

  const submitTrade = () => {
    if (!selected || !symbol || !quantity || !price) return;
    setSubmitting(true);

    const newPosition = {
      symbol: symbol.toUpperCase(),
      quantity: Number(quantity),
      cost_basis: Number(price),
    };

    if (usingMock) {
      // Handle locally
      setDetail((prev) => {
        if (!prev) return prev;
        const existing = prev.positions.find((p) => p.symbol === newPosition.symbol);
        let positions;
        if (side === "buy") {
          if (existing) {
            positions = prev.positions.map((p) =>
              p.symbol === newPosition.symbol
                ? {
                    ...p,
                    quantity: p.quantity + newPosition.quantity,
                    cost_basis: newPosition.cost_basis,
                  }
                : p,
            );
          } else {
            positions = [...prev.positions, newPosition];
          }
        } else {
          positions = prev.positions
            .map((p) =>
              p.symbol === newPosition.symbol
                ? { ...p, quantity: p.quantity - newPosition.quantity }
                : p,
            )
            .filter((p) => p.quantity > 0);
        }
        const total_value = positions.reduce((s, p) => s + p.quantity * p.cost_basis, 0);
        return { positions, total_value };
      });
      setSymbol("");
      setQuantity("");
      setPrice("");
      setSubmitting(false);
      return;
    }

    fetch(`${API_BASE}/api/portfolio/${selected}/transaction`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol: symbol.toUpperCase(),
        side,
        quantity: Number(quantity),
        price: Number(price),
      }),
    })
      .then(() => {
        setSymbol("");
        setQuantity("");
        setPrice("");
        if (selected) loadDetail(selected);
      })
      .catch(() => {
        // Fallback to local state
        setDetail((prev) => {
          if (!prev) return prev;
          const positions =
            side === "buy"
              ? [...prev.positions, newPosition]
              : prev.positions.filter((p) => p.symbol !== newPosition.symbol);
          const total_value = positions.reduce((s, p) => s + p.quantity * p.cost_basis, 0);
          return { positions, total_value };
        });
        setSymbol("");
        setQuantity("");
        setPrice("");
      })
      .finally(() => setSubmitting(false));
  };

  const allocationData =
    detail?.positions?.map((p, i) => ({
      name: p.symbol,
      value: p.quantity * p.cost_basis,
      color: COLORS[i % COLORS.length],
    })) ?? [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          <span className="gradient-text">Portfolio Analyzer</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1.5">
          Paper-trading portfolios with allocation, performance, and risk metrics.
        </p>
        {usingMock && (
          <p className="text-[11px] text-amber-400/70 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
            Running in demo mode — trades are stored locally
          </p>
        )}
      </div>

      {/* Portfolio selector */}
      <div className="glass-card p-5">
        <div className="flex flex-wrap gap-4 items-end">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Portfolio
            </span>
            <select
              value={selected ?? ""}
              onChange={(e) => setSelected(e.target.value || null)}
              className="input-glass min-w-[200px]"
            >
              <option value="">Select portfolio</option>
              {portfolios.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={createPortfolio} className="btn-primary">
            + New Portfolio
          </button>
        </div>
      </div>

      {detail && (
        <>
          {/* Charts row */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Allocation */}
            <div className="glass-card p-5">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Allocation
              </h3>
              <div className="h-52">
                {allocationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        label={(e) => e.name}
                        strokeWidth={0}
                      >
                        {allocationData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(15,23,42,0.9)",
                          border: "1px solid rgba(148,163,184,0.1)",
                          borderRadius: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-slate-500 text-sm">No positions. Add a trade below.</p>
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-xs text-slate-400">
                  Total value:{" "}
                  <span className="text-white font-semibold text-sm">
                    ${detail.total_value.toFixed(2)}
                  </span>
                </p>
              </div>
            </div>

            {/* Risk metrics */}
            <div className="glass-card p-5">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Risk Metrics
              </h3>
              <div className="space-y-4">
                <RiskMetric
                  label="Sharpe Ratio"
                  value={risk?.sharpe_ratio != null ? risk.sharpe_ratio.toFixed(2) : "—"}
                  color="cyan"
                />
                <RiskMetric
                  label="VaR (95%)"
                  value={risk?.var_95 != null ? (risk.var_95 * 100).toFixed(2) + "%" : "—"}
                  color="violet"
                />
                <RiskMetric
                  label="Volatility"
                  value={risk?.volatility != null ? risk.volatility.toFixed(4) : "—"}
                  color="amber"
                />
              </div>
            </div>
          </div>

          {/* Equity curve */}
          {snapshots.length > 1 && (
            <div className="glass-card p-5">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Equity Curve
              </h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={snapshots}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                    <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                    <Line
                      type="monotone"
                      dataKey="total_value"
                      stroke="#10b981"
                      dot={false}
                      strokeWidth={2}
                      name="Value"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Trade form */}
          <div className="glass-card p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Simulated Trade
            </h3>
            <div className="flex flex-wrap gap-3 items-end">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 uppercase">Symbol</span>
                <input
                  placeholder="AAPL"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="input-glass w-24"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 uppercase">Side</span>
                <select
                  value={side}
                  onChange={(e) => setSide(e.target.value as "buy" | "sell")}
                  className="input-glass"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 uppercase">Qty</span>
                <input
                  type="number"
                  placeholder="10"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="input-glass w-20"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 uppercase">Price</span>
                <input
                  type="number"
                  placeholder="150.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="input-glass w-24"
                />
              </label>
              <button
                type="button"
                onClick={submitTrade}
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? "…" : "Execute Trade"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function RiskMetric({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    cyan: "text-cyan-400 bg-cyan-500/10",
    violet: "text-violet-400 bg-violet-500/10",
    amber: "text-amber-400 bg-amber-500/10",
  };
  const cls = colorMap[color] || colorMap.cyan;
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-sm font-mono font-semibold px-2.5 py-0.5 rounded-lg ${cls}`}>
        {value}
      </span>
    </div>
  );
}
