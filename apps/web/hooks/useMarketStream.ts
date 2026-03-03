"use client";

import { useEffect, useState } from "react";

const WS_BASE = (typeof window !== "undefined" && (process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/^http/, "ws")) || "ws://localhost:8000";

export function useMarketStream(symbol: string) {
  const [lastQuote, setLastQuote] = useState<{ symbol: string; close: number | null; timestamp: string | null } | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    const ws = new WebSocket(`${WS_BASE}/ws/market`);
    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ symbol }));
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastQuote(data);
      } catch {
        // ignore
      }
    };
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    return () => ws.close();
  }, [symbol]);

  return { lastQuote, connected };
}
