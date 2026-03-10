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
  return {
    predicted_return: pred.predicted_return,
    attention_weights: pred.attention_weights,
    narrative: `The model identifies a ${dir}ward trend based on recent price momentum. The most influential timesteps are in the last 3–5 trading sessions, suggesting short-term patterns are driving the forecast.`,
    bullet_points: [
      `Recent ${dir === "up" ? "bullish" : "bearish"} momentum detected in closing prices.`,
      "Attention is concentrated on the most recent trading sessions.",
      `Predicted return: ${(pred.predicted_return * 100).toFixed(2)}% with moderate confidence.`,
      "Consider combining this signal with fundamental analysis.",
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
      name: "Growth Portfolio",
      base_currency: "USD",
      positions: [
        { symbol: "AAPL", quantity: 50, cost_basis: 170.25 },
        { symbol: "MSFT", quantity: 30, cost_basis: 380.5 },
        { symbol: "GOOGL", quantity: 25, cost_basis: 155.0 },
        { symbol: "AMZN", quantity: 20, cost_basis: 178.3 },
      ],
      total_value: 50 * 185 + 30 * 420 + 25 * 175 + 20 * 195,
    },
  ];
}

export function mockRiskMetrics() {
  return {
    sharpe_ratio: +(Math.random() * 2 + 0.5).toFixed(2),
    var_95: +(Math.random() * 0.05 + 0.01).toFixed(4),
    volatility: +(Math.random() * 0.02 + 0.005).toFixed(4),
  };
}

export function mockSnapshots(days = 30) {
  const dates = dateRange(days);
  const values = randomWalk(25000, days, 300);
  return dates.map((d, i) => ({ date: d, total_value: +values[i].toFixed(2) }));
}

/* ---------- News ---------- */
export function mockNews(symbol?: string) {
  const pool = [
    { id: "n1", title: `${symbol || "AAPL"} beats quarterly earnings estimates`, url: null },
    { id: "n2", title: "Fed signals potential rate cut in coming months", url: null },
    {
      id: "n3",
      title: `${symbol || "Tech sector"} sees renewed investor interest amid AI expansion`,
      url: null,
    },
    { id: "n4", title: "Global markets rally on positive economic data", url: null },
    { id: "n5", title: `Analysts upgrade ${symbol || "AAPL"} price target`, url: null },
  ];
  return pool;
}

/* ---------- Courses (LMS) ---------- */
export function mockCourses() {
  return [
    {
      id: "c1",
      title: "Intro to Technical Analysis",
      description:
        "Learn candlestick patterns, support/resistance levels, and moving average strategies.",
      difficulty: "beginner",
      tags: ["technical-analysis"],
    },
    {
      id: "c2",
      title: "Portfolio Theory & Risk Management",
      description: "Understand diversification, beta, Sharpe ratio, and Modern Portfolio Theory.",
      difficulty: "intermediate",
      tags: ["portfolio", "risk"],
    },
    {
      id: "c3",
      title: "Machine Learning in Finance",
      description: "Apply LSTM, random forests, and sentiment analysis to market prediction.",
      difficulty: "advanced",
      tags: ["ml", "prediction"],
    },
    {
      id: "c4",
      title: "Options Trading Fundamentals",
      description:
        "Calls, puts, Greeks, and common options strategies for hedging and speculation.",
      difficulty: "intermediate",
      tags: ["options", "derivatives"],
    },
    {
      id: "c5",
      title: "Crypto & DeFi Essentials",
      description:
        "Blockchain fundamentals, tokenomics, liquidity pools, and yield farming basics.",
      difficulty: "beginner",
      tags: ["crypto", "defi"],
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
    "Diversification is a risk management strategy that mixes a wide variety of investments within a portfolio. The rationale is that a diversified portfolio will, on average, yield higher returns and pose a lower risk than any individual investment. Consider spreading your holdings across different asset classes, sectors, and geographies.",
  risk: "Risk management involves identifying, assessing, and controlling threats to your portfolio. Key metrics include Value-at-Risk (VaR), Sharpe ratio, and portfolio volatility. A well-balanced portfolio typically aims for a Sharpe ratio above 1.0 and limits individual position sizes to manage concentration risk.",
  market:
    "Market analysis can be approached through fundamental analysis (examining financial statements, industry conditions, and economic factors) or technical analysis (studying price patterns and trading volumes). Most professional investors combine both approaches for a more complete picture.",
  invest:
    "The core principles of investing include: start early to benefit from compound returns, diversify across asset classes, maintain a long-term perspective, keep costs low, and regularly rebalance your portfolio. Dollar-cost averaging is an effective strategy to reduce timing risk.",
};

export function mockAdvisorResponse(question: string): {
  answer: string;
  citations: string[];
  suggestions: string[];
} {
  const q = question.toLowerCase();
  let answer =
    "That's a great question about financial markets. Based on general financial principles, I'd recommend reviewing your overall investment strategy, considering your risk tolerance, time horizon, and financial goals. Diversification across asset classes is generally considered a foundational strategy for managing portfolio risk.";

  for (const [key, resp] of Object.entries(ADVISOR_RESPONSES)) {
    if (q.includes(key)) {
      answer = resp;
      break;
    }
  }

  return {
    answer,
    citations: ["Source: Financial education content (demo mode)"],
    suggestions: [
      "Ask about portfolio diversification strategies",
      "Learn about risk management metrics",
      "Explore technical vs fundamental analysis",
    ],
  };
}
