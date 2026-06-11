// src/hooks/useAuth.js

import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cyber_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/cyber/tenant/auth/login', { email, password });
    const { accessToken, refreshToken, tenant } = res.data;
    localStorage.setItem('cyber_token', accessToken);
    localStorage.setItem('cyber_refresh', refreshToken);
    localStorage.setItem('cyber_user', JSON.stringify(tenant));
    setUser(tenant);
    return tenant;
  }, []);

  const register = useCallback(async (data) => {
    const res = await api.post('/cyber/tenant/auth/register', data);
    const { accessToken, refreshToken, tenant } = res.data;
    localStorage.setItem('cyber_token', accessToken);
    localStorage.setItem('cyber_refresh', refreshToken);
    localStorage.setItem('cyber_user', JSON.stringify(tenant));
    setUser(tenant);
    return tenant;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cyber_token');
    localStorage.removeItem('cyber_refresh');
    localStorage.removeItem('cyber_user');
    setUser(null);
  }, []);

  return { user, loading, login, register, logout };
};