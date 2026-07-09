import api from './axios';

export interface TemplateItem {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  dayOfMonth: number | null;
  comment: string | null;
  status: string;
  partialAmount: number | null;
  templateId: string;
  category: { id: string; name: string; color: string | null };
}

export interface TemplateGroup {
  id: string;
  name: string;
  items: TemplateItem[];
  createdAt: string;
}

export async function listTemplates() {
  const { data } = await api.get<TemplateGroup[]>('/templates');
  return data;
}

export async function createTemplate(data: { name: string }) {
  const { data: res } = await api.post<TemplateGroup>('/templates', data);
  return res;
}

export async function updateTemplate(id: string, data: { name?: string }) {
  const { data: res } = await api.put<TemplateGroup>(`/templates/${id}`, data);
  return res;
}

export async function deleteTemplate(id: string) {
  await api.delete(`/templates/${id}`);
}

export async function addItem(templateId: string, data: { name: string; amount: number; categoryId: string; dayOfMonth?: number }) {
  const { data: res } = await api.post<TemplateItem>(`/templates/${templateId}/items`, data);
  return res;
}

export async function updateItem(templateId: string, itemId: string, data: {
  name?: string;
  amount?: number;
  categoryId?: string;
  dayOfMonth?: number | null;
  comment?: string | null;
  status?: string;
  partialAmount?: number | null;
}) {
  const { data: res } = await api.put<TemplateItem>(`/templates/${templateId}/items/${itemId}`, data);
  return res;
}

export async function deleteItem(templateId: string, itemId: string) {
  await api.delete(`/templates/${templateId}/items/${itemId}`);
}

export async function applyTemplate(templateId: string, month?: number, year?: number) {
  const params = new URLSearchParams();
  if (month) params.set('month', String(month));
  if (year) params.set('year', String(year));
  const { data } = await api.post(`/templates/${templateId}/apply?${params}`);
  return data;
}
