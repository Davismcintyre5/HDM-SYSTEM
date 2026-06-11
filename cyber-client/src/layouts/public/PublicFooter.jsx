// src/layouts/public/PublicFooter.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const PublicFooter = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/cyber/public-settings').then(res => setSettings(res.data)).catch(() => {});
  }, []);

  const siteName = settings?.siteName || 'HDM Cyber';
  const address = settings?.address || '';
  const phone = settings?.contactPhone || '';
  const email = settings?.contactEmail || '';

  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.svg" alt={siteName} className="w-8 h-8" />
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{siteName}</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm">
              Manage your cyber business efficiently. Track services, accounts, inventory, and more — all in one place.
            </p>
            {address && <p className="text-xs text-[var(--text-secondary)] mt-2">📍 {address}</p>}
            {phone && <p className="text-xs text-[var(--text-secondary)]">📞 {phone}</p>}
            {email && <p className="text-xs text-[var(--text-secondary)]">✉️ {email}</p>}
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-[var(--text-primary)]">Product</h4>
            <div className="flex flex-col gap-2">
              <Link to="/pricing" className="text-sm text-[var(--text-secondary)] hover:text-primary-600 transition-colors">Pricing</Link>
              <Link to="/register" className="text-sm text-[var(--text-secondary)] hover:text-primary-600 transition-colors">Free Trial</Link>
              <a href="/#features" className="text-sm text-[var(--text-secondary)] hover:text-primary-600 transition-colors">Features</a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-[var(--text-primary)]">Legal</h4>
            <div className="flex flex-col gap-2">
              <Link to="/legal/terms" className="text-sm text-[var(--text-secondary)] hover:text-primary-600 transition-colors">Terms</Link>
              <Link to="/legal/privacy" className="text-sm text-[var(--text-secondary)] hover:text-primary-600 transition-colors">Privacy</Link>
              <Link to="/legal/refund" className="text-sm text-[var(--text-secondary)] hover:text-primary-600 transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border-color)] mt-8 pt-8 text-center text-sm text-[var(--text-secondary)]">
          <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;