import api from './axios';

export interface ReviewCategory {
  category: string;
  spent: number;
  limit: number | null;
  overspent: number;
  fixed: number;
  variable: number;
  share: number;
  expenses: { name: string; amount: number; date: string; status: string }[];
}

export interface FixedCandidate {
  name: string;
  category: string;
  occurrences: number;
  count: number;
  avgAmount: number;
  isFixed: boolean;
  reason: string;
}

export interface MonthReviewResponse {
  month: number;
  year: number;
  totalSpent: number;
  budgeted: number;
  remaining: number;
  totalFixed: number;
  totalVariable: number;
  fixedShare: number;
  categories: ReviewCategory[];
  fixedCandidates: FixedCandidate[];
  alerts: string[];
  summary: string[];
}

export async function getMonthReview(month: number, year: number) {
  const { data } = await api.get<MonthReviewResponse>(`/review/month?month=${month}&year=${year}`);
  return data;
}