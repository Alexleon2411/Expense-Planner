import {useState} from 'react';
import api from './axios';
import { UpdateProfileData } from '../types/user';

export function useProfile() {
    const [loading, setLoading] = useState(false);

    const editProfile = async (data: UpdateProfileData): Promise<User> => {
        setLoading(true);
        try {
        const updatedUser = await api.updateProfile(data);
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        return updatedUser;
        } finally {
        setLoading(false);
        }      
    }     
}