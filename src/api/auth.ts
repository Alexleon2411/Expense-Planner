import api from './axios';
import { User } from '../types/user';

export interface AuthResponse {
  user: User;
  token: string;
}

export async function register(email: string, password: string, name: string) {
  const { data } = await api.post<AuthResponse>('/auth/register', { email, password, name });
  return data;
}

export async function login(email: string, password: string) {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

export async function getProfile() {
  const { data } = await api.get<User>('/auth/me');
  return data;
}

export async function UpdatePassword(currentPassword: string, newPassword: string) {
  console.log('llamando la API');
  const { data } = await api.put('/auth/password', { currentPassword, newPassword });
  return data;
}
