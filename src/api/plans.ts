import api from './axios';

export interface SavingPlanResponse {
  id: string;
  amount: number;
  month: number;
  year: number;
  userId: string;
}

export interface SavingProgressResponse {
  plan: number | null;
  saved: number;
  remaining: number;
  percentage: number;
}

export async function getPlan(month: number, year: number) {
  const { data } = await api.get<SavingPlanResponse | null>(`/plans?month=${month}&year=${year}`);
  return data;
}

export async function setPlan(amount: number, month: number, year: number) {
  const { data } = await api.put<SavingPlanResponse>('/plans', { amount, month, year });
  return data;
}

export async function deletePlan(month: number, year: number) {
  await api.delete(`/plans?month=${month}&year=${year}`);
}

export async function getProgress(month: number, year: number) {
  const { data } = await api.get<SavingProgressResponse>(`/plans/progress?month=${month}&year=${year}`);
  return data;
}