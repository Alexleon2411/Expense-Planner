import api from './axios';

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  userId: string;
  isDefault: boolean;
}

export async function listCategories() {
  const { data } = await api.get<Category[]>('/categories');
  return data;
}

export async function createCategory(data: { name: string; icon?: string; color?: string }) {
  const { data: res } = await api.post<Category>('/categories', data);
  return res;
}

export async function updateCategory(id: string, data: { name?: string; icon?: string; color?: string }) {
  const { data: res } = await api.put<Category>(`/categories/${id}`, data);
  return res;
}

export async function deleteCategory(id: string) {
  await api.delete(`/categories/${id}`);
}
