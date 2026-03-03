"use client";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">Dashboard</h2>
      <p className="text-sm text-slate-300">
        Overview of your learning progress, prediction experiments, and portfolio performance.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Learning Progress" value="0%" />
        <Card title="Playground Experiments" value="0" />
        <Card title="Portfolio Value" value="$0.00" />
      </div>
    </div>
  );
}

function Card(props: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <p className="text-xs text-slate-400 mb-1">{props.title}</p>
      <p className="text-lg font-semibold">{props.value}</p>
    </div>
  );
}

