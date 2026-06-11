// src/api/axios.js

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('school_token') || localStorage.getItem('school_portal_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isPublic = 
        error.config.url.includes('/auth/login') || 
        error.config.url.includes('/portal/login') || 
        error.config.url.includes('/portal/register') ||
        error.config.url.includes('/school/settings') ||
        error.config.url.includes('/school/applications') && error.config.method === 'post' ||
        error.config.url.includes('/school/portal/register');

      if (!isPublic) {
        localStorage.removeItem('school_token');
        localStorage.removeItem('school_portal_token');
        localStorage.removeItem('school_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;