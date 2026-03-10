"use client";

import { useState, useEffect, useRef } from "react";
import { API_BASE } from "@/lib/api";
import { mockAdvisorResponse } from "@/lib/mock-data";
import { StrategicRealityCheck } from "@/components/reality-check";

const DEV_USER_ID = process.env.NEXT_PUBLIC_DEV_USER_ID || "00000000-0000-0000-0000-000000000001";
const hdrs = { "Content-Type": "application/json", "X-User-Id": DEV_USER_ID };

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  citations?: string[];
  suggestions?: string[];
}

interface AdvisorResponse {
  answer: string;
  citations?: string[];
  suggestions?: string[];
}

const SUGGESTIONS = [
  { text: "How should I diversify?", type: "diversif" },
  { text: "Explain risk metrics", type: "risk" },
  { text: "What is market analysis?", type: "market" },
];

export default function AdvisorPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m0",
      role: "assistant",
      content:
        "[INIT] Zero-G Advisor initialized. Your status as 'Operator Rahul' is confirmed. Query the system for capital allocation optimization or risk boundary verification.",
      timestamp: new Date().toISOString(),
      suggestions: SUGGESTIONS.map((s) => s.text),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Small delay for psychological "calculation" effect
      await new Promise((r) => setTimeout(r, 600));

      let responseData: AdvisorResponse;
      try {
        const res = await fetch(`${API_BASE}/api/advisor/chat`, {
          method: "POST",
          headers: hdrs,
          body: JSON.stringify({ question: content, history: messages }),
        });
        if (!res.ok) throw new Error();
        responseData = (await res.json()) as AdvisorResponse;
      } catch {
        responseData = mockAdvisorResponse(content) as AdvisorResponse;
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseData.answer,
        timestamp: new Date().toISOString(),
        citations: responseData.citations,
        suggestions: responseData.suggestions,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "[ERROR] SYSTEM FAULT: High-latency connection to inference engine. Review local telemetry.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto font-mono">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-4 mb-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-none border-l-2 ${
                m.role === "user"
                  ? "bg-slate-900/50 border-slate-500/50 text-slate-300"
                  : "bg-cyan-500/5 border-cyan-500/30 text-white"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {m.role === "user" ? "[OPERATOR]" : "[ZERO-G]"}
                </span>
                <span className="text-[9px] text-slate-600">
                  {new Date(m.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-xs leading-relaxed italic border-l border-white/5 pl-3">
                {m.content}
              </p>

              {m.citations && m.citations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    [OK] Sources
                  </p>
                  <ul className="space-y-1">
                    {m.citations.map((c, i) => (
                      <li key={i} className="text-[9px] text-slate-600 truncate italic">
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {m.suggestions && m.suggestions.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {m.suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s)}
                      className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-tighter"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-cyan-500/5 border-l-2 border-cyan-500/30 p-4">
              <span className="text-[10px] font-bold text-cyan-400 animate-pulse uppercase tracking-[0.2em]">
                [CALC] PROCESSING_QUERY…
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="glass-card p-2 flex items-center gap-2 border-t border-white/5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="[INIT] ENTER_QUERY…"
          className="flex-1 bg-transparent border-none focus:ring-0 text-xs font-mono placeholder:text-slate-600 uppercase"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-50 transition-colors"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>

      <div className="mt-8">
        <StrategicRealityCheck />
      </div>
    </div>
  );
}
