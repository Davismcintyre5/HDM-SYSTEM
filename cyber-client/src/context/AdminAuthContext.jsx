// src/context/AdminAuthContext.jsx

import { createContext, useContext } from 'react';
import { useAdminAccess } from '../hooks/useAdminAccess';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const admin = useAdminAccess();
  return <AdminAuthContext.Provider value={admin}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => useContext(AdminAuthContext);