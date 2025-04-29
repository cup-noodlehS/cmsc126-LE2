import axios from 'axios';
import { destroyCookie, setCookie } from 'nookies';
import { create } from 'zustand';

import { UserInterface, UserWriteInterface } from '@/lib/types/auth';
import api, { GenericApi, setAuthToken } from '@/lib/utils/api';

interface AuthStore {
    user: UserInterface | null;
    setUser: (user: UserInterface | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    setUser: (user: UserInterface | null) => set({ user }),
}));

export const login = async (username: string, password: string) => {
    const invalidCredentials = 'Invalid email or password';
    const requiredFields = 'Email and password are required';
    const serverError = 'Internal server error. Please try again later or refresh tab.';
    const ssoUserError =
        'This account is linked to a social login. Please use Google or Apple to sign in.';

    if (!username || !password) {
        throw new Error(requiredFields);
    }

    // Clear any stale cookies that might interfere with login
    destroyCookie(null, 'directus_session_token');
    destroyCookie(null, 'access_token');

    try {
        interface LoginResponse {
            access: string;
            refresh: string;
            user: UserInterface;
        }
        const response = await api.post('/auth/login/', { username, password });
        const loginData: LoginResponse = response.data;

        const { access, refresh } = loginData;
        if (!access || !refresh) {
            throw new Error(invalidCredentials);
        }

        setAuthToken(access);
        setCookie(null, 'refresh_token', refresh, {
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
        });

        useAuthStore.getState().setUser(loginData.user);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 400) {
                throw new Error(invalidCredentials);
            } else if (error.response?.status === 403) {
                throw new Error(ssoUserError);
            } else if (error.response?.status === 500) {
                throw new Error(serverError);
            }
        }
        throw new Error(serverError);
    }
};

export const logout = async () => {
    destroyCookie(null, 'refresh_token');
    setAuthToken(null);
    useAuthStore.getState().setUser(null);

    await api.post('/auth/logout/');
};

export const register = async (user: UserWriteInterface) => {
    const response = await api.post('/auth/register/', user);
    return response.data;
};

export const getUser = async () => {
    try {
        const response = await api.get('/auth/me/');
        useAuthStore.getState().setUser(response.data);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const UserApi = new GenericApi<UserInterface, UserWriteInterface>('/auth/users/');
