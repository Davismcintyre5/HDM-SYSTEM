// src/layouts/public/PublicMobileNav.jsx

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';

const PublicMobileNav = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuthContext();
  const { admin } = useAdminAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed bottom-4 right-4 z-50 p-3 rounded-full bg-primary-600 text-white shadow-lg"
      >
        {open ? '✕' : '☰'}
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-[var(--bg-primary)] rounded-t-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <nav className="flex flex-col gap-4">
              <a href="/#about" className={`py-2 text-lg font-medium ${isActive('/') ? 'text-primary-600' : 'text-[var(--text-primary)]'}`} onClick={() => setOpen(false)}>About</a>
              <Link to="/pricing" className={`py-2 text-lg font-medium ${isActive('/pricing') ? 'text-primary-600' : 'text-[var(--text-primary)]'}`} onClick={() => setOpen(false)}>Pricing</Link>
              <Link to="/support" className={`py-2 text-lg font-medium ${isActive('/support') ? 'text-primary-600' : 'text-[var(--text-primary)]'}`} onClick={() => setOpen(false)}>Contact</Link>
              <div className="border-t border-[var(--border-color)] pt-4">
                {user || admin ? (
                  <Link to="/dashboard" className="btn btn-primary w-full text-center" onClick={() => setOpen(false)}>Dashboard</Link>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link to="/login" className="btn btn-secondary w-full text-center" onClick={() => setOpen(false)}>Login</Link>
                    <Link to="/register" className="btn btn-primary w-full text-center" onClick={() => setOpen(false)}>Get Started</Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default PublicMobileNav;