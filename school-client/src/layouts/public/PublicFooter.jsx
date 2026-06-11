// src/layouts/public/PublicFooter.jsx

import { useState, useEffect } from 'react';
import api from '../../api/axios';

const PublicFooter = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/school/settings').then(res => setSettings(res.data)).catch(() => {});
  }, []);

  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-[var(--text-secondary)]">
        <p>&copy; {new Date().getFullYear()} {settings?.schoolName || 'School'}. All rights reserved.</p>
        <p className="mt-1">📍 {settings?.address || 'Nairobi, Kenya'} | 📞 {settings?.phone || '+254 700 123 456'} | ✉️ {settings?.email || 'info@school.com'}</p>
        <p className="mt-1 italic">{settings?.motto || 'Technology for Tomorrow'}</p>
      </div>
    </footer>
  );
};

export default PublicFooter;