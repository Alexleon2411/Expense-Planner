import api from './axios';

export interface SavingPlanResponse {
  id: string;
  name?: string;
  amount: number;
  savedAmount: number;
  month: number;
  year: number;
  startDate: string;
  endDate: string;
  userId: string;
}

export interface SavingContributionResponse {
  id: string;
  planId: string;
  name: string;
  amount: number;
  date: string;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
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

export async function getPlansForPeriod(startDate: string, endDate: string) {
  const params = new URLSearchParams({ startDate, endDate });
  const { data } = await api.get<SavingPlanResponse[]>(`/plans?${params.toString()}`);
  return data;
}

export async function createPlan(amount: number, month: number, year: number, name: string) {
  const { data } = await api.post<SavingPlanResponse>('/plans', { amount, month, year, name });
  return data;
}

export async function createPlanForPeriod(amount: number, startDate: string, endDate: string, name: string) {
  const { data } = await api.post<SavingPlanResponse>('/plans', { amount, startDate, endDate, name });
  return data;
}

export async function updatePlan(planId: string, amount: number, month: number, year: number, name: string) {
  const { data } = await api.put<SavingPlanResponse>('/plans', { id: planId, amount, month, year, name });
  return data;
}

export async function updatePlanForPeriod(planId: string, amount: number, startDate: string, endDate: string, name: string) {
  const { data } = await api.put<SavingPlanResponse>('/plans', { id: planId, amount, startDate, endDate, name });
  return data;
}

export async function deletePlan(month: number, year: number, planId?: string) {
  await api.delete(`/plans?month=${month}&year=${year}${planId ? `&planId=${encodeURIComponent(planId)}` : ''}`);
}

export async function deletePlanById(planId: string) {
  await api.delete(`/plans?planId=${encodeURIComponent(planId)}`);
}

export async function getProgress(month: number, year: number, planId?: string) {
  const query = planId ? `&planId=${encodeURIComponent(planId)}` : '';
  const { data } = await api.get<SavingProgressResponse>(`/plans/progress?month=${month}&year=${year}${query}`);
  return data;
}

export async function getProgressForPlan(planId: string) {
  const { data } = await api.get<SavingProgressResponse>(`/plans/progress?planId=${encodeURIComponent(planId)}`);
  return data;
}

export async function getContributions(planId: string) {
  const { data } = await api.get<SavingContributionResponse[]>(`/plans/${encodeURIComponent(planId)}/contributions`);
  return data;
}

export async function createContribution(planId: string, contribution: {
  name: string;
  amount: number;
  date: string;
  comment?: string;
}) {
  const { data } = await api.post<SavingContributionResponse>(
    `/plans/${encodeURIComponent(planId)}/contributions`,
    contribution,
  );
  return data;
}

export async function deleteContribution(planId: string, contributionId: string) {
  await api.delete(
    `/plans/${encodeURIComponent(planId)}/contributions/${encodeURIComponent(contributionId)}`,
  );
}
