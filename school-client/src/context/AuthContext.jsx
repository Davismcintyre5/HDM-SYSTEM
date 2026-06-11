// src/context/AuthContext.jsx

import { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';

const AuthContext = createContext();
export const AuthProvider = ({ children }) => <AuthContext.Provider value={useAuth()}>{children}</AuthContext.Provider>;
export const useAuthContext = () => useContext(AuthContext);