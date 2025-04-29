/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { destroyCookie, parseCookies, setCookie } from 'nookies';

const API_URL = process.env.NEXT_PUBLIC_BGW_API || 'http://localhost:8000';

const api = axios.create({
    baseURL: `${API_URL}/api/v1`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (config.url && config.url.includes('/auth/login')) {
        return config;
    }
    const cookies = parseCookies();
    const token = cookies.access_token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401) {
            if (originalRequest.url.endsWith('token/refresh/')) {
                setAuthToken(null);
                // Clear cookies when refresh token fails
                destroyCookie(null, 'access_token', { path: '/' });
                destroyCookie(null, 'refresh_token', { path: '/' });

                // Only redirect if in browser context
                if (
                    typeof window !== 'undefined' &&
                    !originalRequest.url.includes('/auth/profile')
                ) {
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }

            if (!originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    const cookies = parseCookies();
                    const refreshToken = cookies.refresh_token;
                    if (refreshToken) {
                        const response = await api.post('/auth/token/refresh/', {
                            refresh: refreshToken,
                        });
                        const { access } = response.data;
                        setAuthToken(access);
                        originalRequest.headers['Authorization'] = `Bearer ${access}`;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    setAuthToken(null);
                    destroyCookie(null, 'refresh_token', { path: '/' });

                    // Only redirect if in browser context and not a silent profile check
                    if (
                        typeof window !== 'undefined' &&
                        !originalRequest.url.includes('/auth/profile')
                    ) {
                        window.location.href = '/login';
                    }
                    return Promise.reject(refreshError);
                }
            }
        }
        return Promise.reject(error);
    }
);

export const setAuthToken = (token: string | null, ctx: any = null) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setCookie(ctx, 'access_token', token, {
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: false, // Client-side JS needs access
        });
    } else {
        delete api.defaults.headers.common['Authorization'];
        destroyCookie(ctx, 'access_token');
    }
};

export class GenericApi<ReadType, WriteType> {
    private endpoint: string;
    constructor(endpoint: string) {
        if (!endpoint) {
            throw new Error('Endpoint is required for GenericApi');
        }
        this.endpoint = endpoint;
    }

    async get(id: number) {
        try {
            const response = await api.get(`${this.endpoint}/${id}/`);
            return response.data as ReadType;
        } catch (error) {
            console.error(`Error in ${this.endpoint}-get:`, error);
            throw error;
        }
    }

    async filter(filters?: any) {
        interface FilterResponse {
            objects: ReadType[];
            total_count: number;
            num_pages: number;
            current_page: number;
        }
        try {
            const response = await api.get(`${this.endpoint}/`, {
                params: filters,
            });
            return response.data as FilterResponse;
        } catch (error) {
            console.error(`Error in ${this.endpoint}-filter:`, error);
            throw error;
        }
    }

    async create(data: WriteType) {
        try {
            const response = await api.post(`${this.endpoint}/`, data);
            return response.data as ReadType;
        } catch (error) {
            console.error(`Error in ${this.endpoint}-create:`, error);
            throw error;
        }
    }

    async update(id: number, data: Partial<WriteType>) {
        try {
            const response = await api.put(`${this.endpoint}/${id}/`, data);
            return response.data as ReadType;
        } catch (error) {
            console.error(`Error in ${this.endpoint}-update:`, error);
            throw error;
        }
    }

    async delete(id: number) {
        try {
            const response = await api.delete(`${this.endpoint}/${id}/`);
            return response.data;
        } catch (error) {
            console.error(`Error in ${this.endpoint}-delete:`, error);
            throw error;
        }
    }
}

export default api;
