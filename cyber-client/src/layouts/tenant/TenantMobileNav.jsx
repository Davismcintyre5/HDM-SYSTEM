// src/layouts/tenant/TenantMobileNav.jsx

import { NavLink } from 'react-router-dom';

const mobileNavItems = [
  { to: '/dashboard', label: 'Home', icon: '📊' },
  { to: '/services', label: 'Services', icon: '💻' },
  { to: '/accounts', label: 'Money', icon: '💰' },
  { to: '/transactions', label: 'Txns', icon: '💳' },
  { to: '/settings/business', label: 'More', icon: '⚙️' },
];

const TenantMobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-primary)] border-t border-[var(--border-color)] lg:hidden">
      <div className="flex items-center justify-around h-14">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs px-2 py-1 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-[var(--text-secondary)]'}`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default TenantMobileNav;