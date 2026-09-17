import api from './axios';

export interface SavingPlanResponse {
  id: string;
  name?: string;
  amount: number;
  month: number;
  year: number;
  userId: string;
}

export interface SavingProgressResponse {
  planId?: string;
  name?: string;
  plan: number | null;
  saved: number;
  remaining: number;
  percentage: number;
}

export async function getPlan(month: number, year: number) {
  const { data } = await api.get<SavingPlanResponse | SavingPlanResponse[] | null>(`/plans?month=${month}&year=${year}`);
  return data;
}

export async function createPlan(amount: number, month: number, year: number, name: string) {
  const { data } = await api.post<SavingPlanResponse>('/plans', { amount, month, year, name });
  return data;
}

export async function updatePlan(planId: string, amount: number, month: number, year: number, name: string) {
  const { data } = await api.put<SavingPlanResponse>('/plans', { planId, amount, month, year, name });
  return data;
}

export async function deletePlan(month: number, year: number, planId?: string) {
  await api.delete(`/plans?month=${month}&year=${year}${planId ? `&planId=${encodeURIComponent(planId)}` : ''}`);
}

export async function getProgress(month: number, year: number, planId?: string) {
  const query = planId ? `&planId=${encodeURIComponent(planId)}` : '';
  const { data } = await api.get<SavingProgressResponse>(`/plans/progress?month=${month}&year=${year}${query}`);
  return data;
}
