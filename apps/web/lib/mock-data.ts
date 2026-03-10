/* ---------- shared mock helpers ---------- */
function randomWalk(base: number, days: number, volatility = 2): number[] {
  const out: number[] = [base];
  for (let i = 1; i < days; i++) {
    const change = (Math.random() - 0.48) * volatility;
    out.push(+(out[i - 1] + change).toFixed(2));
  }
  return out;
}

function dateRange(days: number): string[] {
  const out: string[] = [];
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

/* ---------- Market ---------- */
export interface MockOHLCV {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const BASE_PRICES: Record<string, number> = {
  AAPL: 185,
  MSFT: 420,
  GOOGL: 175,
  AMZN: 195,
  META: 510,
};

export function mockMarketHistory(symbol: string, days = 90): MockOHLCV[] {
  const base = BASE_PRICES[symbol] || 100;
  const closes = randomWalk(base, days);
  const dates = dateRange(days);
  return dates.map((d, i) => {
    const c = closes[i];
    const o = +(c + (Math.random() - 0.5) * 2).toFixed(2);
    return {
      timestamp: d + "T16:00:00Z",
      open: o,
      high: +(Math.max(o, c) + Math.random() * 3).toFixed(2),
      low: +(Math.min(o, c) - Math.random() * 3).toFixed(2),
      close: c,
      volume: Math.round(Math.random() * 5_000_000 + 1_000_000),
    };
  });
}

export const MOCK_SYMBOLS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "META", name: "Meta Platforms Inc." },
];

/* ---------- Prediction ---------- */
export function mockPrediction(series: number[]) {
  const last = series[series.length - 1] || 100;
  const prev = series[series.length - 2] || last;
  const ret = +((last - prev) / prev).toFixed(6);
  return {
    predicted_return: ret,
    direction: ret >= 0 ? "up" : "down",
    uncertainty: +(Math.random() * 0.3 + 0.05).toFixed(4),
    attention_weights: Array.from({ length: 10 }, () => +Math.random().toFixed(4)),
  };
}

export function mockExplain(series: number[]) {
  const pred = mockPrediction(series);
  return {
    predicted_return: pred.predicted_return,
    attention_weights: pred.attention_weights,
    feature_contributions: pred.attention_weights.map((w, i) => ({
      timestep: i,
      attention: w,
      description: `t-${10 - i}`,
    })),
  };
}

export function mockNarrative(series: number[]) {
  const pred = mockPrediction(series);
  const dir = pred.direction;
  const attentionWeights = pred.attention_weights;
  const maxWeight = Math.max(...attentionWeights);

  return {
    predicted_return: pred.predicted_return,
    attention_weights: pred.attention_weights,
    narrative: `[CALC] The attention mechanism assigned a peak weight of ${maxWeight.toFixed(2)} to the T-minus-2 price action, indicating a non-linear dependency. Predicted ${dir}ward delta is purely mechanical.`,
    bullet_points: [
      `[OK] Temporal weights concentrated in session T-minus-2.`,
      `[CALC] Predicted return volatility variance: ${pred.uncertainty.toFixed(4)}.`,
      `[WARN] Nominal ${dir}ward trend ignores macro-economic liquidity constraints.`,
    ],
  };
}

/* ---------- Portfolio ---------- */
export interface MockPortfolio {
  id: string;
  name: string;
  base_currency: string;
  positions: { symbol: string; quantity: number; cost_basis: number }[];
  total_value: number;
}

export function mockPortfolios(): MockPortfolio[] {
  return [
    {
      id: "demo-portfolio-1",
      name: "Operator Rahul Portfolio",
      base_currency: "USD",
      positions: [
        { symbol: "AAPL", quantity: 55, cost_basis: 187.5 },
        { symbol: "MSFT", quantity: 18, cost_basis: 412.0 },
        { symbol: "GOOGL", quantity: 22, cost_basis: 172.5 },
        { symbol: "AMZN", quantity: 24, cost_basis: 191.0 },
      ],
      total_value: 25730.5,
    },
  ];
}

export function mockRiskMetrics() {
  return {
    sharpe_ratio: 2.81,
    var_95: 0.0233,
    volatility: 0.0185,
  };
}

export function mockSnapshots(days = 30) {
  const dates = dateRange(days);
  const values = randomWalk(25730.5, days, 200);
  return dates.map((d, i) => ({ date: d, total_value: +values[i].toFixed(2) }));
}

/* ---------- News ---------- */
export function mockNews(symbol?: string) {
  const pool = [
    {
      id: "n1",
      title: `[INIT] ${symbol || "AAPL"} quarterly variance report: -0.4% delta vs expectations`,
      url: null,
    },
    { id: "n2", title: "[OK] Fed rate cycle transition: impact assessment pending", url: null },
    {
      id: "n3",
      title: `[CALC] Tech sector concentration risk index: +2.4pts`,
      url: null,
    },
    {
      id: "n4",
      title: "[INIT] Global liquidity flow analysis indicates capital flight to high-yield bonds",
      url: null,
    },
    {
      id: "n5",
      title: `[WARN] Analyst downgrade cycle initiated for ${symbol || "AAPL"}`,
      url: null,
    },
  ];
  return pool;
}

/* ---------- Courses (LMS) ---------- */
export function mockCourses() {
  return [
    {
      id: "c1",
      title: "Intro to Technical Analysis",
      description: "[BASE-LEVEL HYGIENE] Foundational patterns for basic operational competency.",
      difficulty: "beginner",
      tags: ["hygiene"],
    },
    {
      id: "c2",
      title: "Portfolio Theory & Risk Management",
      description: "[CORE] Essential mechanics of risk-adjusted returns and delta-neutrality.",
      difficulty: "intermediate",
      tags: ["risk"],
    },
    {
      id: "c3",
      title: "Machine Learning in Finance",
      description: "[PRIMARY TARGET] Optimized path for 12 LPA professional competence.",
      difficulty: "advanced",
      tags: ["professional-mastery"],
    },
    {
      id: "c4",
      title: "Options Trading Fundamentals",
      description: "[INTERMEDIATE] Leveraging volatility under structural constraints.",
      difficulty: "intermediate",
      tags: ["derivatives"],
    },
    {
      id: "c5",
      title: "Crypto & DeFi Essentials",
      description:
        "[BASE-LEVEL HYGIENE] Distributed ledger mechanics for system integrity awareness.",
      difficulty: "beginner",
      tags: ["hygiene"],
    },
  ];
}

/* ---------- Dashboard Stats ---------- */
export function mockDashboardStats() {
  return {
    enrollments: 3,
    xp: 1250,
    portfolioValue: 25730.5,
    newsCount: 12,
  };
}

/* ---------- Advisor ---------- */
const ADVISOR_RESPONSES: Record<string, string> = {
  diversif:
    "[INIT] Diversification packet activated. Your current allocation exhibits high tech-sector correlation. Optimal strategy requires non-correlated assets: Commodities (Gold/Oil) or Real Estate REITs to offset sector exposure.",
  risk: "[CALC] Risk metrics analyzed. Your VaR (Value-at-Risk) of 2.33% indicates a probabilistic floor, not a certainty. Under extreme market stress, tail-risk liquidation remains a non-zero dependency.",
  market:
    "[OK] Market analysis protocol engaged. Fundamental valuations are lagging price action. Technical parameters indicate a RSI-based overbought condition. Professional performance requires cross-validated entry signals.",
  invest:
    "[WARN] Investment philosophy insufficient. Nominal growth is a trailing indicator. Realized alpha requires disciplined capital allocation and strict adhereance to risk-management thresholds.",
};

export function mockAdvisorResponse(question: string): {
  answer: string;
  citations: string[];
  suggestions: string[];
} {
  const q = question.toLowerCase();
  let answer =
    "[INIT] Query received. Your current educational and financial velocity is insufficient for the 12 LPA target. Review 'Machine Learning in Finance' to reduce the performance gap.";

  for (const [key, resp] of Object.entries(ADVISOR_RESPONSES)) {
    if (q.includes(key)) {
      answer = resp;
      break;
    }
  }

  return {
    answer,
    citations: ["[OK] Data sourced from internal audit and market telemetry."],
    suggestions: ["How should I diversify?", "Explain risk metrics", "What is market analysis?"],
  };
}
