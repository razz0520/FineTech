"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { API_BASE } from "@/lib/api";
import { mockDashboardStats } from "@/lib/mock-data";
const DEV_USER_ID = process.env.NEXT_PUBLIC_DEV_USER_ID || "00000000-0000-0000-0000-000000000001";
const headers = { "X-User-Id": DEV_USER_ID };

import { StrategicRealityCheck } from "@/components/reality-check";

const STAT_CARDS = [
  {
    key: "enrollments",
    title: "[INIT] Enrolled Courses",
    subtitle: "active operational context",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
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
    key: "xp",
    title: "[CALC] XP Metrics",
    subtitle: "academic velocity per session",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    color: "emerald",
  },
  {
    key: "portfolio",
    title: "[OK] Portfolio Liquidity",
    subtitle: "mark-to-market valuation",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    color: "violet",
  },
  {
    key: "news",
    title: "[INIT] News Ingestion",
    subtitle: "unfiltered market telemetry",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1" />
        <path d="M21 12a9 9 0 0 0-9-9" />
        <path d="M21 12H12V3" />
      </svg>
    ),
    color: "amber",
  },
];

const QUICK_LINKS = [
  {
    href: "/learn",
    title: "[INIT] Curriculum",
    description: "Operational knowledge ingestion modules for professional mastery.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    href: "/playground",
    title: "[CALC] Prediction Playground",
    description: "Cold-engine LSTM+Attention simulators for market dependency verification.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    href: "/portfolio",
    title: "[OK] Risk Management",
    description: "Capital allocation and Sharpe-ratio boundary analysis controllers.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
];

const COLOR_MAP: Record<string, { iconBg: string; iconText: string; topBorder: string }> = {
  cyan: { iconBg: "bg-cyan-500/10", iconText: "text-cyan-400", topBorder: "border-t-cyan-500/50" },
  emerald: {
    iconBg: "bg-emerald-500/10",
    iconText: "text-emerald-400",
    topBorder: "border-t-emerald-500/50",
  },
  violet: {
    iconBg: "bg-violet-500/10",
    iconText: "text-violet-400",
    topBorder: "border-t-violet-500/50",
  },
  amber: {
    iconBg: "bg-amber-500/10",
    iconText: "text-amber-400",
    topBorder: "border-t-amber-500/50",
  },
};

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

        // If no API data came through, use mocks
        if (!gotData) {
          const mock = mockDashboardStats();
          setEnrollments(mock.enrollments);
          setTotalPoints(mock.xp);
          setPortfolioValue(mock.portfolioValue);
          setNewsCount(mock.newsCount);
        }
      } catch {
        // Fallback to mock data
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

  const values: Record<string, string> = {
    enrollments: loading ? "—" : `${enrollments}`,
    xp: loading ? "—" : `${totalPoints}`,
    portfolio: loading
      ? "—"
      : portfolioValue !== null
        ? `$${portfolioValue.toLocaleString()}`
        : "No portfolio",
    news: loading ? "—" : `${newsCount}`,
  };

  return (
    <div className="space-y-8 animate-fade-in font-mono">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          <span className="text-white">[INIT] Operator Dashboard: Rahul</span>
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-xs text-slate-500 uppercase tracking-widest">
            System Status: <span className="text-emerald-500">[OPERATIONAL]</span>
          </p>
          <div className="w-1 h-1 rounded-full bg-slate-700" />
          <p className="text-xs text-slate-500 uppercase tracking-widest">
            Identity: <span className="text-white">RAHUL_0520</span>
          </p>
        </div>
        {totalPoints <= 1250 && !loading && (
          <div className="mt-4 p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl">
            <p className="text-xs text-rose-400 font-bold tracking-tight">
              {
                "[WARN] OPPORTUNITY COST DETECTED: XP has remained stagnant for 24+ hours. The gap between current performance and 12 LPA baseline is widening. Resume 'Machine Learning in Finance' immediately."
              }
            </p>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children">
        {STAT_CARDS.map((card) => {
          const colors = COLOR_MAP[card.color];
          return (
            <div key={card.key} className={`glass-card p-5 border-t-2 ${colors.topBorder}`}>
              <div className="flex items-start justify-between mb-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {card.title}
                </p>
                <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                  <span className={colors.iconText}>{card.icon}</span>
                </div>
              </div>
              <p
                className={`text-2xl font-bold ${loading ? "animate-pulse text-slate-600" : "text-white"}`}
              >
                {values[card.key]}
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-tight mt-1">
                {card.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick links */}
      <div>
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
          [INIT] Logic Controllers
        </h3>
        <div className="grid gap-4 md:grid-cols-3 stagger-children">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="glass-card gradient-border p-5 block group hover:translate-y-[-2px] transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors border border-cyan-500/20">
                  {link.icon}
                </div>
                <h3 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors uppercase tracking-tight">
                  {link.title}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                {link.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Reality Check */}
      <StrategicRealityCheck />
    </div>
  );
}
