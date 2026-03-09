"use client";

import { useState, useEffect } from "react";

import { API_BASE } from "@/lib/api";
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
    <div className="space-y-6 max-w-3xl animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          <span className="gradient-text">AI Financial Advisor</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1.5">
          Ask questions about your portfolio and get educational, non-advice responses grounded in
          your data.
        </p>
      </div>

      {/* Portfolio selector */}
      <div className="flex gap-3 items-center">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Portfolio context
        </span>
        <select
          value={portfolioId ?? ""}
          onChange={(e) => setPortfolioId(e.target.value || null)}
          className="input-glass text-xs"
        >
          <option value="">None</option>
          {portfolios.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Chat area */}
      <div className="glass-card flex flex-col min-h-[420px] overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 flex items-center justify-center mb-4">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-cyan-400"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a8 8 0 0 0-8 8c0 3.4 2.1 6.3 5 7.4V20a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2.6c2.9-1.1 5-4 5-7.4a8 8 0 0 0-8-8z" />
                  <line x1="10" y1="22" x2="14" y2="22" />
                </svg>
              </div>
              <p className="text-sm text-slate-300 font-medium mb-1">Financial Advisor Ready</p>
              <p className="text-xs text-slate-500 max-w-xs">
                Ask about investing strategies, risk management, or get insights on your portfolio.
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-cyan-500/15 to-emerald-500/15 text-slate-200 border border-cyan-500/10"
                    : "bg-white/[0.03] text-slate-300 border border-white/5"
                }`}
              >
                {m.content}
                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">
                      Suggestions
                    </p>
                    <ul className="space-y-1">
                      {m.suggestions.map((s, j) => (
                        <li key={j} className="text-xs text-slate-400 flex items-start gap-1.5">
                          <span className="text-cyan-500 mt-0.5">→</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {m.citations && m.citations.length > 0 && (
                  <p className="mt-2 text-[10px] text-slate-600 italic">{m.citations[0]}</p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="p-4 border-t border-white/5 flex gap-2 bg-slate-950/30"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a financial question…"
            className="input-glass flex-1"
          />
          <button type="submit" disabled={loading} className="btn-primary px-5">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
