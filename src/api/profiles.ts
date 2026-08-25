import api from './axios'

export type ProfileType = 'business' | 'family' | 'individual'

export interface Profile {
  id: string
  userId: string
  name: string
  profileType: ProfileType
  currency: string
  isActive: boolean
  createdAt: string
}

export async function listProfiles() {
  const { data } = await api.get<Profile[]>('/profiles')
  return data
}

export async function createProfile(data: { name: string; profileType: ProfileType; currency: string }) {
  const { data: profile } = await api.post<Profile>('/profiles', data)
  return profile
}

export async function updateProfile(userId: string, data: { currency?: string; name?: string; profileType?: ProfileType }) {
  const { data: profile } = await api.put<Profile>(`/profiles/${userId}`, data)
  return profile
}

export async function deleteProfile(userId: string) {
  await api.delete(`/profiles/${userId}`)
}
