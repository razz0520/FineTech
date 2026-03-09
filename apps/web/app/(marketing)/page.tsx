"use client";

export default function MarketingPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">Unified Financial Intelligence</h2>
      <p className="text-sm text-slate-300 max-w-2xl">
        Learn core finance concepts, experiment with AI-powered market predictions, and analyze your
        simulated portfolios in one cohesive experience.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <FeatureCard
          title="Adaptive Learning"
          description="Structured lessons, quizzes, and gamified progress tracking to build financial literacy."
        />
        <FeatureCard
          title="AI Prediction Playground"
          description="LSTM+attention forecasts with explainable AI narratives and visual attributions."
        />
        <FeatureCard
          title="Portfolio Intelligence"
          description="Real-time analytics, risk metrics, and an AI advisor grounded in your data."
        />
      </div>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
}

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-xs text-slate-300">{description}</p>
    </div>
  );
}
