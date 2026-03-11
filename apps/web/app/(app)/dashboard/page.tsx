"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PremiumCard } from "@/components/ui/premium-card";

import { API_BASE } from "@/lib/api";
import { mockDashboardStats } from "@/lib/mock-data";
const DEV_USER_ID = process.env.NEXT_PUBLIC_DEV_USER_ID || "00000000-0000-0000-0000-000000000001";
const headers = { "X-User-Id": DEV_USER_ID };

const QUICK_LINKS = [
  {
    href: "/learn",
    title: "Curriculum",
    description: "Master financial concepts with our structured learning modules.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    color: "cyan",
  },
  {
    href: "/playground",
    title: "Playground",
    description: "Test your strategies in a risk-free simulated environment.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    color: "emerald",
  },
  {
    href: "/portfolio",
    title: "Portfolio",
    description: "Analyze your assets and optimize your capital allocation.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
    color: "violet",
  },
];

export default function DashboardPage() {
  const [enrollments, setEnrollments] = useState(0);
  const [portfolioValue, setPortfolioValue] = useState<number | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [newsCount, setNewsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [enrollResp, portfolioResp, pointsResp, newsResp] = await Promise.allSettled([
          fetch(`${API_BASE}/api/lms/me/enrollments`, { headers }).then((r) => r.json()),
          fetch(`${API_BASE}/api/portfolio/`, { headers }).then((r) => r.json()),
          fetch(`${API_BASE}/api/lms/me/points-history?limit=200`, { headers }).then((r) =>
            r.json(),
          ),
          fetch(`${API_BASE}/api/news/latest?limit=50`).then((r) => r.json()),
        ]);

        let gotData = false;
        if (enrollResp.status === "fulfilled" && Array.isArray(enrollResp.value)) {
          setEnrollments(enrollResp.value.length);
          gotData = true;
        }
        if (portfolioResp.status === "fulfilled" && Array.isArray(portfolioResp.value)) {
          const portfolios = portfolioResp.value as { id: string }[];
          if (portfolios.length > 0) {
            try {
              const detail = await fetch(`${API_BASE}/api/portfolio/${portfolios[0].id}`, {
                headers,
              }).then((r) => r.json());
              setPortfolioValue(detail.total_value ?? 0);
              gotData = true;
            } catch {
              setPortfolioValue(0);
            }
          }
        }
        if (pointsResp.status === "fulfilled" && Array.isArray(pointsResp.value)) {
          const total = (pointsResp.value as { amount: number }[]).reduce(
            (s, p) => s + p.amount,
            0,
          );
          setTotalPoints(total);
          gotData = true;
        }
        if (newsResp.status === "fulfilled" && Array.isArray(newsResp.value)) {
          setNewsCount(newsResp.value.length);
          gotData = true;
        }

        if (!gotData) {
          const mock = mockDashboardStats();
          setEnrollments(mock.enrollments);
          setTotalPoints(mock.xp);
          setPortfolioValue(mock.portfolioValue);
          setNewsCount(mock.newsCount);
        }
      } catch {
        const mock = mockDashboardStats();
        setEnrollments(mock.enrollments);
        setTotalPoints(mock.xp);
        setPortfolioValue(mock.portfolioValue);
        setNewsCount(mock.newsCount);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6 animate-fade-in font-sans">
      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            Welcome back, <span className="text-gradient">Rahul</span>
          </h2>
          <p className="text-slate-400 font-medium">
            Your intelligence engine is <span className="text-emerald-400">fully optimized</span>{" "}
            for today&apos;s market telemetry.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PremiumCard className="py-2.5 px-4 rounded-2xl flex items-center gap-2 border-cyan-500/20 bg-cyan-500/5 shadow-cyan-500/10">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              Active Analysis
            </span>
          </PremiumCard>
        </div>
      </header>

      {/* Main Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PremiumCard gradient className="group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Enrollments
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{loading ? "—" : enrollments}</div>
          <div className="text-xs text-slate-500 font-medium">Active operational courses</div>
        </PremiumCard>

        <PremiumCard gradient className="group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Experience
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {loading ? "—" : totalPoints.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 font-medium">Academic velocity score</div>
        </PremiumCard>

        <PremiumCard gradient className="group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Liquidity
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {loading ? "—" : portfolioValue !== null ? `$${portfolioValue.toLocaleString()}` : "$0"}
          </div>
          <div className="text-xs text-slate-500 font-medium">Net-worth valuation</div>
        </PremiumCard>

        <PremiumCard gradient className="group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 ring-1 amber-emerald-500/20">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1" />
                <path d="M21 12a9 9 0 0 0-9-9" />
                <path d="M21 12H12V3" />
              </svg>
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Intelligence
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{loading ? "—" : newsCount}</div>
          <div className="text-xs text-slate-500 font-medium">Market telemetry streams</div>
        </PremiumCard>
      </section>

      {/* Portfolio Intelligence & Analysis Area */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <PremiumCard className="lg:col-span-2 relative min-h-[400px] flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="relative z-10 flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white">Portfolio Intelligence</h3>
              <p className="text-sm text-slate-500">
                Real-time performance tracking and predictive modeling.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                1W
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                1M
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                1Y
              </button>
            </div>
          </div>

          {/* Placeholder for chart */}
          <div className="flex-1 flex items-center justify-center relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-[1px] bg-white/5" />
              <div className="h-full w-[1px] bg-white/5" />
            </div>
            <div className="w-full h-48 bg-gradient-to-t from-cyan-500/10 to-emerald-500/5 clip-path-chart" />
            <div className="absolute text-slate-600 text-[10px] font-bold uppercase tracking-widest">
              Intelligence Visualization Engine Loading...
            </div>
          </div>

          <div className="relative z-10 mt-8 grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Volatily Index
              </p>
              <p className="text-lg font-bold text-white">
                12.4% <span className="text-[10px] text-emerald-400 font-bold ml-1">LOW</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Sharpe Ratio
              </p>
              <p className="text-lg font-bold text-white">
                2.84 <span className="text-[10px] text-emerald-400 font-bold ml-1">GOOD</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Alpha Projection
              </p>
              <p className="text-lg font-bold text-cyan-400">+14.2%</p>
            </div>
          </div>
        </PremiumCard>

        <div className="space-y-6">
          <PremiumCard className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border-indigo-500/20 shadow-indigo-500/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-white tracking-tight">AI Advisor</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">
                  Ready for inquiry
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              &quot;I&apos;ve analyzed your current risk exposure. Would you like to see the
              optimization report for your tech holdings?&quot;
            </p>
            <Link href="/advisor" className="btn-premium w-full text-sm">
              Initiate Consultation
            </Link>
          </PremiumCard>

          <div className="grid grid-cols-1 gap-4">
            {QUICK_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="group">
                <PremiumCard className="p-4 group-hover:bg-white/[0.06] transition-colors border-white/5 group-hover:border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2.5 rounded-xl bg-${link.color}-500/10 text-${link.color}-400 ring-1 ring-${link.color}-500/20 group-hover:scale-110 transition-transform`}
                      >
                        {link.icon}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-200 group-hover:text-white transition-colors">
                          {link.title}
                        </h5>
                        <p className="text-[11px] text-slate-500 truncate max-w-[150px]">
                          {link.description}
                        </p>
                      </div>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-slate-600 group-hover:text-white animate-pulse group-hover:translate-x-1 transition-all"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </PremiumCard>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
