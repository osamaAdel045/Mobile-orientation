import axios from 'axios';
import { useAuthStore } from './auth';

const api = axios.create({ baseURL: '/api/v1' });

api.interceptors.request.use((config) => {
    const auth = useAuthStore();
    if (auth.token) {
        config.headers.Authorization = `Bearer ${auth.token}`;
    }
    return config;
});

api.interceptors.response.use(
    (r) => r,
    (error) => {
        if (error.response?.status === 401) {
            const auth = useAuthStore();
            auth.logout();
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

export default api;
