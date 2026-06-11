// src/layouts/admin/AdminSidebar.jsx

import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/tenants', label: 'Tenants', icon: '👥' },
  { to: '/admin/plans', label: 'Plans', icon: '📋' },
  { to: '/admin/transactions', label: 'Transactions', icon: '💳' },
  { to: '/admin/support', label: 'Support', icon: '🎫' },
  { to: '/admin/backups', label: 'Backups', icon: '🗄️' },
  { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
  { to: '/admin/legal', label: 'Legal Pages', icon: '📄' },
  { to: '/admin/health', label: 'System Health', icon: '❤️' },
];

const AdminSidebar = ({ open, onClose }) => {
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} />}
      <aside className={`sidebar fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Admin" className="w-8 h-8" />
              <span className="text-lg font-bold text-red-600 dark:text-red-400">Admin Panel</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Super Admin Access</p>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
            <p>&copy; {new Date().getFullYear()} HDM Cyber Admin</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;