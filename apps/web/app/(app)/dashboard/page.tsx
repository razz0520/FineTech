"use client";

import { useEffect, useState } from "react";

import { API_BASE } from "@/lib/api";
const DEV_USER_ID = process.env.NEXT_PUBLIC_DEV_USER_ID || "00000000-0000-0000-0000-000000000001";
const headers = { "X-User-Id": DEV_USER_ID };

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

        if (enrollResp.status === "fulfilled" && Array.isArray(enrollResp.value)) {
          setEnrollments(enrollResp.value.length);
        }
        if (portfolioResp.status === "fulfilled" && Array.isArray(portfolioResp.value)) {
          const portfolios = portfolioResp.value as { id: string }[];
          if (portfolios.length > 0) {
            try {
              const detail = await fetch(`${API_BASE}/api/portfolio/${portfolios[0].id}`, {
                headers,
              }).then((r) => r.json());
              setPortfolioValue(detail.total_value ?? 0);
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
        }
        if (newsResp.status === "fulfilled" && Array.isArray(newsResp.value)) {
          setNewsCount(newsResp.value.length);
        }
      } catch {
        // fallback to defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-slate-300 mt-1">
          Overview of your learning progress, prediction experiments, and portfolio performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          title="Enrolled courses"
          value={loading ? "…" : `${enrollments}`}
          subtitle="active enrollments"
        />
        <Card
          title="XP points"
          value={loading ? "…" : `${totalPoints}`}
          subtitle="from quizzes and activities"
        />
        <Card
          title="Portfolio value"
          value={
            loading
              ? "…"
              : portfolioValue !== null
                ? `$${portfolioValue.toFixed(2)}`
                : "No portfolio"
          }
          subtitle="first portfolio total"
        />
        <Card
          title="News articles"
          value={loading ? "…" : `${newsCount}`}
          subtitle="recent ingested headlines"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <QuickLink
          href="/learn"
          title="📚 Learn"
          description="Browse courses, lessons, and quizzes to build financial literacy."
        />
        <QuickLink
          href="/playground"
          title="🔮 Prediction playground"
          description="Run LSTM+attention forecasts with explainable AI narratives."
        />
        <QuickLink
          href="/portfolio"
          title="💼 Portfolio"
          description="Manage paper-trading portfolios with allocation and risk analytics."
        />
      </div>
    </div>
  );
}

function Card(props: { title: string; value: string; subtitle: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <p className="text-xs text-slate-400 mb-1">{props.title}</p>
      <p className="text-lg font-semibold">{props.value}</p>
      <p className="text-xs text-slate-500 mt-1">{props.subtitle}</p>
    </div>
  );
}

function QuickLink(props: { href: string; title: string; description: string }) {
  return (
    <a
      href={props.href}
      className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 block hover:border-slate-600 transition-colors"
    >
      <h3 className="text-sm font-semibold mb-1">{props.title}</h3>
      <p className="text-xs text-slate-400">{props.description}</p>
    </a>
  );
}
