// src/hooks/useAdminAccess.js

import { useState, useCallback } from 'react';
import api from '../api/axios';

export const useAdminAccess = () => {
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return !!localStorage.getItem('cyber_admin');
    } catch {
      return false;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  const verifyHash = useCallback(async (hash) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/cyber/admin/auth/verify-access', { hash });
      setShowLogin(true);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid access key');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const hash = sessionStorage.getItem('admin_access_hash');
      const res = await api.post('/cyber/admin/auth/verify-access', { hash, email, password });
      const { accessToken, refreshToken, admin } = res.data;
      localStorage.setItem('cyber_admin_token', accessToken);
      localStorage.setItem('cyber_admin_refresh', refreshToken);
      localStorage.setItem('cyber_admin', JSON.stringify(admin));
      setIsAdmin(true);
      setShowLogin(false);
      sessionStorage.removeItem('admin_access_hash');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cyber_admin_token');
    localStorage.removeItem('cyber_admin_refresh');
    localStorage.removeItem('cyber_admin');
    setIsAdmin(false);
    setShowLogin(false);
    setError('');
  }, []);

  const clearError = useCallback(() => setError(''), []);

  return { isAdmin, loading, error, showLogin, verifyHash, login, logout, clearError, setShowLogin };
};