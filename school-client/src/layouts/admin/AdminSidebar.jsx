// src/layouts/admin/AdminSidebar.jsx

import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../../api/axios';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/students', label: 'Students', icon: '👨‍🎓' },
  { to: '/admin/employees', label: 'Employees', icon: '👔' },
  { to: '/admin/fees', label: 'Fees', icon: '💰' },
  { to: '/admin/accounts', label: 'Accounts', icon: '💵' },
  { to: '/admin/inventory', label: 'Inventory', icon: '📦' },
  { to: '/admin/reports', label: 'Reports', icon: '📈' },
  { to: '/admin/settings/school', label: 'Settings', icon: '⚙️' },
  { to: '/admin/portal-users', label: 'Portal Users', icon: '👥' },
  { to: '/admin/applications', label: 'Applications', icon: '📋' },
];

const AdminSidebar = ({ open, onClose }) => {
  const [schoolName, setSchoolName] = useState('');

  useEffect(() => {
    api.get('/school/settings').then(res => {
      setSchoolName(res.data?.schoolName || '');
    }).catch(() => setSchoolName(''));
  }, []);

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} />}
      <aside className={`sidebar fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-3 mb-2">
              <img src="/logo.svg" alt="School" className="w-8 h-8" />
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400 truncate">{schoolName || 'School'}</span>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/admin/dashboard'} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <span>{item.icon}</span><span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
            <p>&copy; {new Date().getFullYear()} {schoolName || 'School'}</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;