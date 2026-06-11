// src/layouts/admin/AdminLayout.jsx

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminMobileNav from './AdminMobileNav';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 lg:p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>
      <AdminMobileNav />
    </div>
  );
};

export default AdminLayout;