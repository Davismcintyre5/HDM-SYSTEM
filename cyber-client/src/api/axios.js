// src/api/axios.js

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  // Use admin token for admin routes, tenant token otherwise
  if (config.url.includes('/cyber/admin/')) {
    const adminToken = localStorage.getItem('cyber_admin_token');
    if (adminToken) config.headers.Authorization = `Bearer ${adminToken}`;
  } else {
    const token = localStorage.getItem('cyber_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRoute = error.config.url.includes('/auth/login') ||
                          error.config.url.includes('/auth/register') ||
                          error.config.url.includes('/verify-access');

      if (!isAuthRoute) {
        if (error.config.url.includes('/cyber/admin/')) {
          localStorage.removeItem('cyber_admin_token');
          localStorage.removeItem('cyber_admin_refresh');
          localStorage.removeItem('cyber_admin');
        } else {
          localStorage.removeItem('cyber_token');
          localStorage.removeItem('cyber_refresh');
          localStorage.removeItem('cyber_user');
        }
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;