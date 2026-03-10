"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    // Artificial delay for premium feel
    await new Promise((r) => setTimeout(r, 800));

    const result = login(email, password);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Login failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-950 overflow-hidden">
      {/* Left Side: Dynamic Visuals (Mirroring Signup) */}
      <div className="hidden lg:flex relative flex-col items-center justify-center p-12 mesh-gradient overflow-hidden">
        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]" />

        {/* Floating elements for depth */}
        <div className="absolute top-1/4 -right-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -left-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-700" />

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
              className="text-emerald-400"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-6 animate-slide-up [animation-delay:0.1s]">
            Welcome <span className="gradient-text">Back to Finetech</span>
          </h1>
          <p className="text-lg text-slate-400 mb-8 animate-slide-up [animation-delay:0.2s]">
            Continue your journey in mastering the markets with our unified financial intelligence
            platform.
          </p>

          <div className="grid grid-cols-2 gap-4 animate-slide-up [animation-delay:0.3s]">
            <div className="glass-panel p-4 rounded-2xl text-left border-white/5 hover:border-cyan-500/30 transition-colors group">
              <div className="text-cyan-400 mb-2 group-hover:scale-110 transition-transform">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="text-sm font-semibold text-white">Market Intel</div>
              <div className="text-xs text-slate-500">Scan live opportunities</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl text-left border-white/5 hover:border-emerald-500/30 transition-colors group">
              <div className="text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-white">Secure Access</div>
              <div className="text-xs text-slate-500">Encrypted data protection</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex items-center justify-center p-8 lg:p-12 relative">
        {/* Subtle background glow for mobile */}
        <div className="lg:hidden absolute inset-0 mesh-gradient opacity-30" />

        <div className="w-full max-w-sm relative z-10">
          <div className="text-center mb-10 stagger-children">
            <h2 className="text-3xl font-bold text-white mb-2">Login</h2>
            <p className="text-slate-400">Access your professional dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 stagger-children">
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-400 animate-fade-in">
                {error}
              </div>
            )}

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
              <div className="flex justify-between items-end mb-1 px-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-glass w-full py-3.5 px-4 bg-slate-900/50 border-white/5 focus:border-cyan-500/50 transition-all rounded-xl shadow-inner"
                autoComplete="current-password"
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
              ) : (
                <>
                  Sign In
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 16l4-4m0 0l-4-4m4 4H9"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center animate-fade-in [animation-delay:0.5s]">
            <p className="text-slate-500 text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
