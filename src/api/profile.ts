import { useState } from 'react';
import api from './axios';
import { UpdateProfileData, User } from '../types/user';

export function useProfile() {
    const [loading, setLoading] = useState(false);

    const editProfile = async (data: UpdateProfileData): Promise<User> => {
        setLoading(true);
        try {
            const { data: updatedUser } = await api.post<User>('/profile', data);
            localStorage.setItem('auth_user', JSON.stringify(updatedUser));
            return updatedUser;
        } finally {
            setLoading(false);
        }
    };

    return { loading, editProfile };
}
