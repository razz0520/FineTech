"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-context";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    // Artificial delay for "premium" feel during transition
    await new Promise((r) => setTimeout(r, 800));

    const result = signup(name, email, password);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Signup failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-950 overflow-hidden">
      {/* Left Side: Dynamic Visuals (Hidden on mobile) */}
      <div className="hidden lg:flex relative flex-col items-center justify-center p-12 mesh-gradient overflow-hidden">
        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]" />

        {/* Floating elements for depth */}
        <div className="absolute top-1/4 -left-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-700" />

        <div className="relative z-10 max-w-md text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center mx-auto mb-8 shadow-2xl animate-slide-up">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-cyan-400"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-6 animate-slide-up [animation-delay:0.1s]">
            Master Your <span className="gradient-text">Financial Future</span>
          </h1>
          <p className="text-lg text-slate-400 mb-8 animate-slide-up [animation-delay:0.2s]">
            Join thousands of users using FineTech to build portfolios, learn technical analysis, and predict market trends with AI.
          </p>

          <div className="grid grid-cols-2 gap-4 animate-slide-up [animation-delay:0.3s]">
            <div className="glass-panel p-4 rounded-2xl text-left border-white/5 hover:border-cyan-500/30 transition-colors group">
              <div className="text-cyan-400 mb-2 group-hover:scale-110 transition-transform">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 6V12M12 12L15 15M12 12L9 15" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-white">AI Predictions</div>
              <div className="text-xs text-slate-500">Real-time market insights</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl text-left border-white/5 hover:border-emerald-500/30 transition-colors group">
              <div className="text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 3V21H21" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M19 9L13.5 14.5L8.5 9.5L3.5 14.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-white">Learn to Trade</div>
              <div className="text-xs text-slate-500">Structured financial path</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Signup Form */}
      <div className="flex items-center justify-center p-8 lg:p-12 relative">
        {/* Subtle background glow for mobile */}
        <div className="lg:hidden absolute inset-0 mesh-gradient opacity-30" />

        <div className="w-full max-w-sm relative z-10">
          <div className="text-center mb-10 stagger-children">
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-slate-400">Step into the next generation of finance</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 stagger-children">
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-400 animate-fade-in">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="input-glass w-full py-3.5 px-4 bg-slate-900/50 border-white/5 focus:border-cyan-500/50 transition-all rounded-xl shadow-inner"
                autoComplete="name"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="input-glass w-full py-3.5 px-4 bg-slate-900/50 border-white/5 focus:border-cyan-500/50 transition-all rounded-xl shadow-inner"
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-glass w-full py-3.5 px-4 bg-slate-900/50 border-white/5 focus:border-cyan-500/50 transition-all rounded-xl shadow-inner"
                autoComplete="new-password"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-4 rounded-xl text-base shadow-lg shadow-cyan-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-slate-900" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  Start Growing
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center animate-fade-in [animation-delay:0.5s]">
            <p className="text-slate-500 text-sm">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
