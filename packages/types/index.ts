// Shared DTOs and type contracts for the Finetech platform.

export type UserId = string;
export type CourseId = string;
export type LessonId = string;
export type QuizId = string;
export type PortfolioId = string;

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface CourseSummary {
  id: CourseId;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
}

export interface PortfolioSnapshotDTO {
  id: string;
  portfolioId: PortfolioId;
  date: string;
  totalValue: number;
  cash: number;
  pnl: number;
  riskMetrics: {
    sharpeRatio?: number;
    var95?: number;
    beta?: number;
  };
}
