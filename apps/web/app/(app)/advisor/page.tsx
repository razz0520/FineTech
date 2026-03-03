"use client";

import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const DEV_USER_ID = process.env.NEXT_PUBLIC_DEV_USER_ID || "00000000-0000-0000-0000-000000000001";
const headers = { "Content-Type": "application/json", "X-User-Id": DEV_USER_ID };

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  suggestions?: string[];
}

export default function AdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [portfolios, setPortfolios] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/portfolio/`, { headers: { "X-User-Id": DEV_USER_ID } })
      .then((r) => r.json())
      .then((list: { id: string; name: string }[]) => setPortfolios(list))
      .catch(() => {});
  }, []);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/advisor/query`, {
        method: "POST",
        headers,
        body: JSON.stringify({ question: q, portfolio_id: portfolioId || null }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          citations: data.citations,
          suggestions: data.suggestions,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, the advisor is unavailable. Try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-xl font-semibold tracking-tight">AI financial strategy advisor</h2>
      <p className="text-sm text-slate-300">
        Ask questions about your portfolio and get educational, non-advice responses grounded in your data and the knowledge base.
      </p>

      <div className="flex gap-2 items-center">
        <span className="text-sm text-slate-400">Portfolio context:</span>
        <select
          value={portfolioId ?? ""}
          onChange={(e) => setPortfolioId(e.target.value || null)}
          className="rounded border border-slate-700 bg-slate-900 text-white px-2 py-1.5 text-sm"
        >
          <option value="">None</option>
          {portfolios.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/40 flex flex-col min-h-[320px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <p className="text-slate-500 text-sm">Ask a question about investing, risk, or your portfolio (educational only).</p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
              <div
                className={
                  m.role === "user"
                    ? "inline-block rounded-lg bg-slate-700 px-3 py-2 text-sm"
                    : "inline-block rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-200 max-w-[85%]"
                }
              >
                {m.content}
                {m.suggestions && m.suggestions.length > 0 && (
                  <ul className="mt-2 list-disc list-inside text-xs text-slate-400">
                    {m.suggestions.map((s, j) => (
                      <li key={j}>{s}</li>
                    ))}
                  </ul>
                )}
                {m.citations && m.citations.length > 0 && (
                  <p className="mt-1 text-xs text-slate-500">{m.citations[0]}</p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <p className="text-slate-500 text-sm">Thinking…</p>
          )}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="p-4 border-t border-slate-800 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question…"
            className="flex-1 rounded border border-slate-700 bg-slate-900 text-white px-3 py-2 text-sm placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
