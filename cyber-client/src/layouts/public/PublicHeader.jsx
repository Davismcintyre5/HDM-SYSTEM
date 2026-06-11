// src/layouts/public/PublicHeader.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import api from '../../api/axios';
import ThemeToggle from '../../components/ui/ThemeToggle';

const PublicHeader = () => {
  const { user } = useAuthContext();
  const { isAdmin } = useAdminAuth();
  const [siteName, setSiteName] = useState('HDM Cyber');
  const isLoggedIn = user || isAdmin;

  useEffect(() => {
    api.get('/cyber/public-settings').then(res => {
      setSiteName(res.data?.siteName || 'HDM Cyber');
    }).catch(() => setSiteName('HDM Cyber'));
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-primary)] border-b border-[var(--border-color)] backdrop-blur-sm bg-opacity-90">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.svg" alt={siteName} className="w-7 h-7 sm:w-8 sm:h-8" />
            <span className="text-base sm:text-xl font-bold text-primary-600 dark:text-primary-400 truncate max-w-[120px] sm:max-w-none">{siteName}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <a href="/#features" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Features</a>
            <Link to="/pricing" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Pricing</Link>
            <Link to="/support" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-1 sm:gap-3">
            <ThemeToggle />
            {isLoggedIn ? (
              <Link to={isAdmin ? '/admin/dashboard' : '/dashboard'} className="btn btn-primary text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Login</Link>
                <Link to="/pricing" className="btn btn-primary text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;