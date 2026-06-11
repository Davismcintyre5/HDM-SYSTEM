// src/layouts/tenant/TenantLayout.jsx

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TenantSidebar from './TenantSidebar';
import TenantHeader from './TenantHeader';
import TenantMobileNav from './TenantMobileNav';

const TenantLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <TenantSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <TenantHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 lg:p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>
      <TenantMobileNav />
    </div>
  );
};

export default TenantLayout;