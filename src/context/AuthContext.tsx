import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authApi, userApi } from '../api';
import type { User, UpdateProfileData } from '../types/user';

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  editProfile: (data: UpdateProfileData) => Promise<void>;
  updateProfileInformation: (data: UpdateProfileData) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .getProfile()
      .then((profile) => {
        setUser(profile);
        localStorage.setItem('auth_user', JSON.stringify(profile));
      })
      .catch(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    localStorage.setItem('auth_token', result.token);
    localStorage.setItem('auth_user', JSON.stringify(result.user));
    setUser(result.user);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const result = await authApi.register(email, password, name);
    console.log('Registration successful:', result);
    localStorage.setItem('auth_token', result.token);
    localStorage.setItem('auth_user', JSON.stringify(result.user));
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
  }, []);

  const editProfile = useCallback(async (data: UpdateProfileData) => {
    
    const updated = await userApi.updateProfile(data);
    setUser(prev => {
      if (!prev) return null;
      const mapped: User = {
        ...prev,
        name: updated.name ?? prev.name,
        email: updated.email ?? prev.email,
        salary: updated.salary ?? prev.salary,
        city: updated.city ?? prev.city,
        country: updated.country ?? prev.country,
        street: updated.street ?? prev.street,
        houseNumber: updated.houseNumber ?? prev.houseNumber,
        language: updated.language ?? prev.language,
        phoneNumber: updated.phoneNumber ?? prev.phoneNumber,
      };
      localStorage.setItem('auth_user', JSON.stringify(mapped));
      return mapped;
    });
    // console.log('edit profile data', updated);
  }, []);

  const updateProfileInformation = useCallback(async (data: UpdateProfileData) => {
    const updated = await userApi.updateProfileInformation(data);
      setUser(prev => {
        if (!prev) return null;
        const mapped: User = {
          ...prev,
          name: updated.name ?? prev.name,
          email: updated.email ?? prev.email,
          salary: updated.salary ?? prev.salary,
        };
        localStorage.setItem('auth_user', JSON.stringify(mapped));
        return mapped;
      });
    }, []);

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    console.log(currentPassword, newPassword);
    await authApi.UpdatePassword(currentPassword, newPassword);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, editProfile, updateProfileInformation, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}
