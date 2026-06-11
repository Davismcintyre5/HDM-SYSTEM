// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import PublicLayout from './layouts/public/PublicLayout';
import PortalLayout from './layouts/portal/PortalLayout';
import AdminLayout from './layouts/admin/AdminLayout';
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Support from './pages/public/Support';
import AdminLogin from './pages/admin/AdminLogin';
import PortalDashboard from './pages/portal/Dashboard';
import PortalProfile from './pages/portal/Profile';
import PortalPayments from './pages/portal/Payments';
import AdminDashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import Employees from './pages/admin/Employees';
import Fees from './pages/admin/Fees';
import Accounts from './pages/admin/Accounts';
import Inventory from './pages/admin/Inventory';
import ReportsLayout, { StudentsReport, FeesReport, EmployeesReport, InventoryReport, GeneralReport } from './pages/admin/Reports';
import SettingsLayout, { SchoolSettings, BrandingSettings, CoursesSettings, ProfileSettings } from './pages/admin/Settings';
import PortalUsers from './pages/admin/PortalUsers';
import Applications from './pages/admin/Applications';

const AppRoutes = () => {
  const { user, loading } = useAuthContext();
  const isAdmin = user?.role === 'admin' || user?.role === 'staff';
  const isPortal = user?._type === 'portal';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#0f172a]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={!user ? <Landing /> : null} />
        <Route path="support" element={<Support />} />
      </Route>

      <Route path="login" element={!user ? <Login /> : <Navigate to={isAdmin ? '/admin' : '/portal'} replace />} />
      <Route path="register" element={!user ? <Register /> : <Navigate to="/portal" replace />} />
      <Route path="admin/login" element={!user ? <AdminLogin /> : <Navigate to="/admin" replace />} />

      {isPortal && (
        <Route path="/portal" element={<PortalLayout />}>
          <Route index element={<PortalDashboard />} />
          <Route path="profile" element={<PortalProfile />} />
          <Route path="payments" element={<PortalPayments />} />
        </Route>
      )}

      {isAdmin && (
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="employees" element={<Employees />} />
          <Route path="fees" element={<Fees />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="reports" element={<ReportsLayout />}>
            <Route index element={<Navigate to="students" replace />} />
            <Route path="students" element={<StudentsReport />} />
            <Route path="fees" element={<FeesReport />} />
            <Route path="employees" element={<EmployeesReport />} />
            <Route path="inventory" element={<InventoryReport />} />
            <Route path="general" element={<GeneralReport />} />
          </Route>
          <Route path="settings" element={<SettingsLayout />}>
            <Route index element={<Navigate to="school" replace />} />
            <Route path="school" element={<SchoolSettings />} />
            <Route path="branding" element={<BrandingSettings />} />
            <Route path="courses" element={<CoursesSettings />} />
            <Route path="profile" element={<ProfileSettings />} />
          </Route>
          <Route path="portal-users" element={<PortalUsers />} />
          <Route path="applications" element={<Applications />} />
        </Route>
      )}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;