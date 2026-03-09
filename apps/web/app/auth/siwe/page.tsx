"use client";

import { useState } from "react";

import { API_BASE } from "@/lib/api";

const SIWE_DOMAIN = typeof window !== "undefined" ? window.location.host : "localhost";
const SIWE_ORIGIN =
  typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

export default function SiwePage() {
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [nonce, setNonce] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const getNonce = async () => {
    const res = await fetch(`${API_BASE}/api/auth/siwe/nonce`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });
    const data = await res.json();
    setNonce(data.nonce ?? "");
    const now = new Date().toISOString();
    const msg = `${SIWE_DOMAIN} wants you to sign in with your Ethereum account:\n${address}\n\nSign in to Finetech\n\nURI: ${SIWE_ORIGIN}\nVersion: 1\nChain ID: 1\nNonce: ${data.nonce}\nIssued At: ${now}`;
    setMessage(msg);
    return msg;
  };

  const verify = async () => {
    setStatus("Verifying…");
    const res = await fetch(`${API_BASE}/api/auth/siwe/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, message, signature, nonce }),
    });
    const data = await res.json();
    setStatus(res.ok ? "Signed in successfully." : data.detail || "Verification failed.");
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-xl font-semibold">Sign in with Ethereum (SIWE)</h2>
      <p className="text-sm text-slate-400">
        Enter your wallet address. You will be asked to sign a message in your wallet to prove
        ownership.
      </p>
      <input
        type="text"
        placeholder="0x..."
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full rounded border border-slate-700 bg-slate-900 text-white px-3 py-2 text-sm"
      />
      <button
        type="button"
        onClick={() => getNonce()}
        className="w-full rounded bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600"
      >
        Get sign-in message
      </button>
      {message && (
        <>
          <p className="text-xs text-slate-500 break-all">Message to sign (use your wallet):</p>
          <pre className="text-xs bg-slate-900 p-2 rounded overflow-auto max-h-32">{message}</pre>
          <input
            type="text"
            placeholder="Signature (0x...)"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-900 text-white px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={verify}
            className="w-full rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Verify and sign in
          </button>
        </>
      )}
      {status && <p className="text-sm text-slate-300">{status}</p>}
    </div>
  );
}
