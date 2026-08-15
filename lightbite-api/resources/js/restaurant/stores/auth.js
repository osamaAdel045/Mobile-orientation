import { defineStore } from 'pinia';
import api from './api';

export const useRestaurantAuthStore = defineStore('restaurant-auth', {
  state: () => ({
    token: localStorage.getItem('restaurant_token') || '',
    user: JSON.parse(localStorage.getItem('restaurant_user') || 'null'),
    restaurant: JSON.parse(localStorage.getItem('restaurant_data') || 'null'),
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(email, password) {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.data.user.role !== 'restaurant') {
        throw new Error('This account is not a restaurant owner.');
      }
      this.token = data.data.access_token;
      this.user = data.data.user;
      localStorage.setItem('restaurant_token', this.token);
      localStorage.setItem('restaurant_user', JSON.stringify(this.user));
      // Fetch restaurant data
      try {
        const r = await api.get('/restaurants/dashboard');
        this.restaurant = r.data.data;
        localStorage.setItem('restaurant_data', JSON.stringify(this.restaurant));
      } catch (e) { /* dashboard will load on mount */ }
    },
    async fetchDashboard() {
      const r = await api.get('/restaurants/dashboard');
      this.restaurant = r.data.data;
      localStorage.setItem('restaurant_data', JSON.stringify(this.restaurant));
    },
    logout() {
      this.token = '';
      this.user = null;
      this.restaurant = null;
      localStorage.removeItem('restaurant_token');
      localStorage.removeItem('restaurant_user');
      localStorage.removeItem('restaurant_data');
    },
  },
});
