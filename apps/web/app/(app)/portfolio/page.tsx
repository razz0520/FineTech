"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const DEV_USER_ID = process.env.NEXT_PUBLIC_DEV_USER_ID || "00000000-0000-0000-0000-000000000001";
const headers = { "X-User-Id": DEV_USER_ID };

const COLORS = ["#34d399", "#818cf8", "#f472b6", "#fbbf24", "#94a3b8"];

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<{ id: string; name: string; base_currency: string }[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<{
    positions: { symbol: string; quantity: number; cost_basis: number }[];
    total_value: number;
  } | null>(null);
  const [risk, setRisk] = useState<{ sharpe_ratio: number | null; var_95: number | null; volatility: number | null } | null>(null);
  const [snapshots, setSnapshots] = useState<{ date: string; total_value: number }[]>([]);
  const [symbol, setSymbol] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/portfolio/`, { headers })
      .then((r) => r.json())
      .then((list: { id: string; name: string; base_currency: string }[]) => {
        setPortfolios(list);
        if (list.length && !selected) setSelected(list[0].id);
      })
      .catch(() => setPortfolios([]));
  }, []);

  useEffect(() => {
    if (!selected) return;
    Promise.all([
      fetch(`${API_BASE}/api/portfolio/${selected}`, { headers }).then((r) => r.json()),
      fetch(`${API_BASE}/api/portfolio/${selected}/risk`, { headers }).then((r) => r.json()),
      fetch(`${API_BASE}/api/portfolio/${selected}/snapshots?days=30`, { headers }).then((r) => r.json()),
    ])
      .then(([d, r, s]) => {
        setDetail(d);
        setRisk(r);
        setSnapshots(Array.isArray(s) ? s.map((x: { date: string; total_value: number }) => ({ date: x.date, total_value: x.total_value })) : []);
      })
      .catch(() => {
        setDetail(null);
        setRisk(null);
        setSnapshots([]);
      });
  }, [selected]);

  const createPortfolio = () => {
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
      .catch(() => {});
  };

  const submitTrade = () => {
    if (!selected || !symbol || !quantity || !price) return;
    setSubmitting(true);
    fetch(`${API_BASE}/api/portfolio/${selected}/transaction`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: symbol.toUpperCase(), side, quantity: Number(quantity), price: Number(price) }),
    })
      .then(() => {
        setSymbol("");
        setQuantity("");
        setPrice("");
        if (selected) {
          fetch(`${API_BASE}/api/portfolio/${selected}`, { headers })
            .then((r) => r.json())
            .then(setDetail);
        }
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
    <div className="space-y-6">
      <h2 className="text-xl font-semibold tracking-tight">Portfolio analyzer</h2>
      <p className="text-sm text-slate-300">
        Paper-trading portfolios with allocation, performance, and risk metrics.
      </p>

      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={selected ?? ""}
          onChange={(e) => setSelected(e.target.value || null)}
          className="rounded border border-slate-700 bg-slate-900 text-white px-3 py-2 text-sm"
        >
          <option value="">Select portfolio</option>
          {portfolios.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={createPortfolio}
          className="rounded bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600"
        >
          New portfolio
        </button>
      </div>

      {detail && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <h3 className="text-sm font-medium mb-2">Allocation</h3>
              <div className="h-48">
                {allocationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={allocationData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={(e) => e.name}>
                        {allocationData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-500 text-sm">No positions. Add a trade below.</p>
                )}
              </div>
              <p className="text-sm mt-2">Total value: ${detail.total_value.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <h3 className="text-sm font-medium mb-2">Risk metrics</h3>
              <ul className="text-sm space-y-1">
                <li>Sharpe ratio: {risk?.sharpe_ratio ?? "—"}</li>
                <li>VaR (95%): {risk?.var_95 != null ? (risk.var_95 * 100).toFixed(2) + "%" : "—"}</li>
                <li>Volatility: {risk?.volatility ?? "—"}</li>
              </ul>
            </div>
          </div>

          {snapshots.length > 1 && (
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <h3 className="text-sm font-medium mb-2">Equity curve</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={snapshots}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Line type="monotone" dataKey="total_value" stroke="#34d399" dot={false} name="Value" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
            <h3 className="text-sm font-medium mb-2">Simulated trade</h3>
            <div className="flex flex-wrap gap-2 items-end">
              <input
                placeholder="Symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="rounded border border-slate-700 bg-slate-900 text-white px-2 py-1.5 text-sm w-24"
              />
              <select
                value={side}
                onChange={(e) => setSide(e.target.value as "buy" | "sell")}
                className="rounded border border-slate-700 bg-slate-900 text-white px-2 py-1.5 text-sm"
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
              <input
                type="number"
                placeholder="Qty"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="rounded border border-slate-700 bg-slate-900 text-white px-2 py-1.5 text-sm w-20"
              />
              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="rounded border border-slate-700 bg-slate-900 text-white px-2 py-1.5 text-sm w-24"
              />
              <button
                type="button"
                onClick={submitTrade}
                disabled={submitting}
                className="rounded bg-emerald-600 px-4 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {submitting ? "…" : "Execute"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
