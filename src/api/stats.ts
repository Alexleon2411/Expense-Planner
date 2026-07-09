import api from './axios';

export interface OverviewResponse {
  totalSpent: number;
  totalExpenses: number;
  budgeted: number;
  remaining: number;
  percentage: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
}

export interface MonthlyTrend {
  month: number;
  total: number;
  count: number;
}

export interface DailyData {
  day: number;
  total: number;
  count: number;
  categories: Record<string, number>;
  expenses: { name: string; amount: number; category: string }[];
}

export interface YearlyStats {
  year: number;
  total: number;
  count: number;
  categories: { category: string; total: number; count: number }[];
}

export async function getOverview(month?: number, year?: number) {
  const params = new URLSearchParams();
  if (month) params.set('month', String(month));
  if (year) params.set('year', String(year));
  const { data } = await api.get<OverviewResponse>(`/stats/overview?${params}`);
  return data;
}

export async function getCategoryBreakdown(month?: number, year?: number) {
  const params = new URLSearchParams();
  if (month) params.set('month', String(month));
  if (year) params.set('year', String(year));
  const { data } = await api.get<CategoryBreakdown[]>(`/stats/categories?${params}`);
  return data;
}

export async function getMonthlyTrend(year?: number) {
  const params = year ? `?year=${year}` : '';
  const { data } = await api.get<MonthlyTrend[]>(`/stats/monthly${params}`);
  return data;
}

export async function getTrends(months?: number) {
  const params = months ? `?months=${months}` : '';
  const { data } = await api.get<MonthlyTrend[]>(`/stats/trends${params}`);
  return data;
}

export async function getDailyStats(year: number, month: number) {
  const { data } = await api.get<DailyData[]>(`/stats/daily?year=${year}&month=${month}`);
  return data;
}

export async function getWeeklyStats(year: number) {
  const { data } = await api.get(`/stats/weekly?year=${year}`);
  return data;
}

export async function getYearlyStats(year: number) {
  const { data } = await api.get<YearlyStats>(`/stats/yearly?year=${year}`);
  return data;
}
