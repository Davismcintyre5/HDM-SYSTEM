// src/pages/tenant/Settings.jsx

import { NavLink, Outlet, useLocation } from 'react-router-dom';

const tabs = [
  { to: '/settings/business', label: '🏢 Business' },
  { to: '/settings/billing', label: '💵 Billing' },
  { to: '/settings/backups', label: '🗄️ Backups' },
  { to: '/settings/profile', label: '👤 Profile' },
];

const Settings = () => {
  const location = useLocation();

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Settings</h1>

      <div className="flex gap-1 mb-6 border-b border-[var(--border-color)] overflow-x-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end
            className={({ isActive }) =>
              `px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
};

export default Settings;