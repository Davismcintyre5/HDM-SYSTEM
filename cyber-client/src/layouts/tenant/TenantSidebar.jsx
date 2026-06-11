// src/layouts/tenant/TenantSidebar.jsx

import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import api from '../../api/axios';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/services', label: 'Services', icon: '💻' },
  { to: '/accounts', label: 'Accounts', icon: '💰' },
  { to: '/inventory', label: 'Inventory', icon: '📦' },
  { to: '/transactions', label: 'Transactions', icon: '💳' },
  { to: '/reports', label: 'Reports', icon: '📈' },
  { to: '/settings/business', label: 'Settings', icon: '⚙️' },
];

const TenantSidebar = ({ open, onClose }) => {
  const { user } = useAuthContext();
  const [businessName, setBusinessName] = useState('');
  const [siteName, setSiteName] = useState('HDM Cyber');

  useEffect(() => {
    api.get('/cyber/tenant/settings').then(res => {
      setBusinessName(res.data?.businessName || user?.businessName || 'My Business');
    }).catch(() => {
      setBusinessName(user?.businessName || 'My Business');
    });

    api.get('/cyber/public-settings').then(res => {
      setSiteName(res.data?.siteName || 'HDM Cyber');
    }).catch(() => {
      setSiteName('HDM Cyber');
    });
  }, []);

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} />}
      <aside className={`sidebar fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-3 mb-2">
              <img src="/logo.svg" alt={siteName} className="w-8 h-8" />
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{siteName}</span>
            </div>
            <p className="text-base font-bold text-green-600 dark:text-green-400 truncate">{businessName || 'My Business'}</p>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
            <p>&copy; {new Date().getFullYear()} {siteName}</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default TenantSidebar;