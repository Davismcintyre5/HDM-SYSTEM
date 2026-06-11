import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('school_user');
      if (stored) setUser(JSON.parse(stored));
    } catch { } finally { setLoading(false); }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/school/auth/login', { email, password });
    const { accessToken, refreshToken, user: u } = res.data;
    localStorage.setItem('school_token', accessToken);
    localStorage.setItem('school_refresh', refreshToken);
    localStorage.setItem('school_user', JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const portalLogin = useCallback(async (email, password) => {
    const res = await api.post('/school/portal/login', { email, password });
    const { accessToken, refreshToken, user: u } = res.data;
    localStorage.setItem('school_portal_token', accessToken);
    localStorage.setItem('school_portal_refresh', refreshToken);
    localStorage.setItem('school_user', JSON.stringify(u));
    setUser({ ...u, _type: 'portal' });
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('school_token');
    localStorage.removeItem('school_refresh');
    localStorage.removeItem('school_portal_token');
    localStorage.removeItem('school_portal_refresh');
    localStorage.removeItem('school_user');
    setUser(null);
  }, []);

  return { user, loading, login, portalLogin, logout };
};

export const useAdminAuth = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'staff';
  return { user, isAdmin };
};