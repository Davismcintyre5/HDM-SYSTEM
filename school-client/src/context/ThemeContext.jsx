// src/context/ThemeContext.jsx

import { createContext, useContext } from 'react';
import { useTheme } from '../hooks/useTheme';

const ThemeContext = createContext();
export const ThemeProvider = ({ children }) => <ThemeContext.Provider value={useTheme()}>{children}</ThemeContext.Provider>;
export const useThemeContext = () => useContext(ThemeContext);