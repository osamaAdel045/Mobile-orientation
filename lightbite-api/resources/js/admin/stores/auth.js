import { defineStore } from 'pinia';
import api from './api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('admin_token') || '',
        user: JSON.parse(localStorage.getItem('admin_user') || 'null'),
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
    },
    actions: {
        async login(email, password) {
            const { data } = await api.post('/auth/login', { email, password });
            if (data.data.user.role !== 'admin') {
                throw new Error('This account is not an admin.');
            }
            this.token = data.data.access_token;
            this.user = data.data.user;
            localStorage.setItem('admin_token', this.token);
            localStorage.setItem('admin_user', JSON.stringify(this.user));
        },
        logout() {
            this.token = '';
            this.user = null;
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
        },
    },
});
