import api from './axios';

export interface BudgetResponse {
  id: string;
  amount: number;
  month: number;
  year: number;
}

export async function getBudget(month?: number, year?: number) {
  const params = new URLSearchParams();
  if (month) params.set('month', String(month));
  if (year) params.set('year', String(year));
  const { data } = await api.get<BudgetResponse | null>(`/budget?${params}`);
  return data;
}

export async function upsertBudget(amount: number, month: number, year: number) {
  const { data } = await api.put<BudgetResponse>('/budget/upsert', { amount, month, year });
  return data;
}

export async function createBudget(amount: number, month: number, year: number) {
  const { data } = await api.post<BudgetResponse>('/budget', { amount, month, year });
  return data;
}

export async function updateBudget(id: string, amount: number) {
  const { data } = await api.put<BudgetResponse>(`/budget/${id}`, { amount });
  return data;
}
