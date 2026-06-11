// src/layouts/portal/PortalLayout.jsx

import { Outlet } from 'react-router-dom';
import PortalHeader from './PortalHeader';

const PortalLayout = () => (
  <div className="min-h-screen bg-[var(--bg-secondary)]">
    <PortalHeader />
    <main className="p-4 lg:p-6"><Outlet /></main>
  </div>
);

export default PortalLayout;