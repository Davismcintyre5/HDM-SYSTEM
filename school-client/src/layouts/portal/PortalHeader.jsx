// src/layouts/portal/PortalHeader.jsx

import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import ThemeToggle from '../../components/ui/ThemeToggle';

const PortalHeader = () => {
  const { user, logout } = useAuthContext();
  return (
    <header className="sticky top-0 z-20 bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        <Link to="/portal/dashboard" className="flex items-center gap-3"><img src="/logo.svg" alt="School" className="w-8 h-8" /><span className="text-lg font-bold text-primary-600">Student Portal</span></Link>
        <nav className="flex items-center gap-6">
          <Link to="/portal/dashboard" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Dashboard</Link>
          <Link to="/portal/profile" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Profile</Link>
          {user?.role === 'student' && <Link to="/portal/payments" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Payments</Link>}
        </nav>
        <div className="flex items-center gap-3"><ThemeToggle /><span className="text-sm text-[var(--text-secondary)]">👤 {user?.name}</span><button onClick={logout} className="text-sm text-red-500 hover:text-red-700">Logout</button></div>
      </div>
    </header>
  );
};

export default PortalHeader;