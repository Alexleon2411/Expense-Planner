import api from './axios';

export interface ExpenseResponse {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  comment?: string;
  status?: string;
  partialAmount?: number;
  userId: string;
  budgetId?: string;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseListResponse {
  expenses: ExpenseResponse[];
  total: number;
  page: number;
  totalPages: number;
}

export async function listExpenses(params?: {
  month?: number;
  year?: number;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.month) searchParams.set('month', String(params.month));
  if (params?.year) searchParams.set('year', String(params.year));
  if (params?.category) searchParams.set('category', params.category);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  const { data } = await api.get<ExpenseListResponse>(`/expenses?${searchParams}`);
  return data;
}

export async function createExpense(expense: {
  name: string;
  amount: number;
  category: string;
  date: string;
  comment?: string;
  status?: string;
  partialAmount?: number;
}) {
  const { data } = await api.post<ExpenseResponse>('/expenses', expense);
  return data;
}

export async function updateExpense(id: string, expense: {
  name?: string;
  amount?: number;
  category?: string;
  date?: string;
  comment?: string;
  status?: string;
  partialAmount?: number;
}) {
  const { data } = await api.put<ExpenseResponse>(`/expenses/${id}`, expense);
  return data;
}

export async function deleteExpense(id: string) {
  await api.delete(`/expenses/${id}`);
}

export async function updateExpensePartialAmount(id: string, partialAmount: number) {
  const { data } = await api.put<ExpenseResponse>(`/expenses/${id}/partial-amount`, { partialAmount });
  console.log('Respuesta de la API al actualizar el monto parcial:', data);
  return data;
}

export async function createExpenseComment(id: string, comment: string) {
  const { data} = await api.post(`/expenses/${id}/comments`, {comment});
  return data;
}

export interface CommentResponse {
  id: string
  comment: string
  createdAt: string
  userId: string
  expenseId: string
}

export async function deleteExpenseComment(id: string, commentId: string) {
  const { data } = await api.delete(`/expenses/${id}/comments/${commentId}`);
  console.log('Respuesta de la API al eliminar un comentario:', data);
  return data;
}

export async function listExpenseComments(id: string): Promise<CommentResponse[]> {
  const { data } = await api.get(`/expenses/${id}/comments`);
  return data;
}