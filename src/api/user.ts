import { UpdateProfileData, User } from '../types/user';
import api from './axios';

// export interface UserProfile {
//   id: string;
//   email: string;
//   name: string;
//   salary: number | null;
//   createdAt: string;
// }

export async function getProfile() {
  const { data } = await api.get<User>('/user/profile');
  return data;
}

export async function updateProfile(data: UpdateProfileData) {
  console.log('update profile data', data);
  const payload = {
    ...data,
    salary: data.salary !== undefined ? Number(data.salary) : undefined,
  };
  const { data: res } = await api.put<User>('/user/profile', payload);
  console.log('updated profile data', res);
  return res;
}

export async function updateProfileInformation(data: UpdateProfileData) {
  const payload = {
    ...data,
    salary: data.salary !== undefined ? Number(data.salary) : undefined,
  };
  const { data: res } = await api.put<UpdateProfileData>(`/profiles/${data.id}`, payload);
  return res;
}
