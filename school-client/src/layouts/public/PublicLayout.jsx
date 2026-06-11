// src/layouts/public/PublicLayout.jsx

import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

const PublicLayout = () => (
  <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
    <PublicHeader />
    <main className="flex-1"><Outlet /></main>
    <PublicFooter />
  </div>
);

export default PublicLayout;