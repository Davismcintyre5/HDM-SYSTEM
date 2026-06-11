// src/layouts/public/PublicHeader.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import api from '../../api/axios';
import ThemeToggle from '../../components/ui/ThemeToggle';

const PublicHeader = () => {
  const { user } = useAuthContext();
  const [schoolName, setSchoolName] = useState('');

  useEffect(() => {
    api.get('/school/settings').then(res => setSchoolName(res.data?.schoolName || '')).catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.svg" alt={schoolName} className="w-8 h-8" />
          <span className="text-xl font-bold text-primary-600 dark:text-primary-400">{schoolName || 'School'}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <a href="/#about" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">About</a>
          <a href="/#courses" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Courses</a>
          <a href="/#contact" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Contact</a>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <Link to={user?.role === 'admin' || user?.role === 'staff' ? '/admin/dashboard' : '/portal/dashboard'} className="btn btn-primary text-sm">Dashboard</Link>
          ) : (
            <Link to="/login" className="btn btn-primary text-sm">Portal</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;