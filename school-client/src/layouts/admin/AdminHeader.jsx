// src/layouts/admin/AdminHeader.jsx

import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import ThemeToggle from '../../components/ui/ThemeToggle';

const AdminHeader = ({ onMenuClick }) => {
  const { user, logout } = useAuthContext();
  const [time, setTime] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); setDropdownOpen(false); };

  const displayName = user?.name || 'Admin';
  const displayEmail = user?.email || '';

  return (
    <header className="sticky top-0 z-20 bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-[var(--bg-secondary)]">☰</button>
        <div className="hidden lg:block">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Admin Dashboard</h2>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="text-right">
            <p className="text-sm font-medium text-[var(--text-primary)]">{time.toLocaleTimeString()}</p>
            <p className="text-xs text-[var(--text-secondary)]">{time.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 pl-4 border-l border-[var(--border-color)] hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400">
                {displayName.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-[var(--text-primary)]">{displayName}</p>
                <p className="text-xs text-[var(--text-secondary)]">{displayEmail}</p>
              </div>
              <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-[var(--border-color)]">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{displayName}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{displayEmail}</p>
                  <p className="text-xs text-[var(--text-secondary)] capitalize">{user?.role}</p>
                </div>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors flex items-center gap-2">
                  <span>🚪</span> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;