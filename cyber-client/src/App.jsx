// src/App.jsx

import { useEffect } from 'react';
import { BrowserRouter, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import AdminLogin from './pages/public/AdminLogin';
import PublicLayout from './layouts/public/PublicLayout';
import TenantLayout from './layouts/tenant/TenantLayout';
import AdminLayout from './layouts/admin/AdminLayout';
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Pricing from './pages/public/Pricing';
import Legal from './pages/public/Legal';
import Support from './pages/public/Support';
import Checkout from './pages/public/Checkout';
import Dashboard from './pages/tenant/Dashboard';
import Services from './pages/tenant/Services';
import Accounts from './pages/tenant/Accounts';
import Inventory from './pages/tenant/Inventory';
import Transactions from './pages/tenant/Transactions';
import ReportsLayout, { TransactionsReport, InventoryReport, ProfitLossReport, GeneralReport } from './pages/tenant/Reports';
import Settings from './pages/tenant/Settings';
import BusinessSettings from './pages/tenant/BusinessSettings';
import Billing from './pages/tenant/Billing';
import Backups from './pages/tenant/Backups';
import Profile from './pages/tenant/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import Tenants from './pages/admin/Tenants';
import TenantDetail from './pages/admin/TenantDetail';
import Plans from './pages/admin/Plans';
import AdminTransactions from './pages/admin/Transactions';
import AdminSupport from './pages/admin/Support';
import AdminBackups from './pages/admin/Backups';
import AdminSettings from './pages/admin/Settings';
import AdminLegal from './pages/admin/Legal';
import Health from './pages/admin/Health';

const AppRoutes = () => {
  const { user, loading: authLoading } = useAuthContext();
  const { isAdmin, showLogin, verifyHash, login, error, clearError, setShowLogin } = useAdminAuth();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hash = params.get('access');
    if (hash && !isAdmin) { sessionStorage.setItem('admin_access_hash', hash); verifyHash(hash); }
  }, [location.search]);

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        const hash = prompt('Enter admin access key:');
        if (hash) { sessionStorage.setItem('admin_access_hash', hash); verifyHash(hash); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#0f172a]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      {showLogin && !isAdmin && (
        <AdminLogin onLogin={login} onClose={() => { setShowLogin(false); clearError(); }} error={error} />
      )}

 

<Routes>
  {/* Public */}
  <Route element={<PublicLayout />}>
    <Route index element={!isAdmin && !user ? <Landing /> : null} />
    <Route path="pricing" element={<Pricing />} />
    <Route path="legal/:page" element={<Legal />} />
    <Route path="support" element={<Support />} />
  </Route>
  <Route path="login" element={!isAdmin && !user ? <Login /> : <Navigate to="/dashboard" replace />} />
  <Route path="register" element={!isAdmin && !user ? <Register /> : <Navigate to="/dashboard" replace />} />
  <Route path="checkout" element={<Checkout />} />

  {/* Tenant */}
  {user && !isAdmin && (
    <Route element={<TenantLayout />}>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="services" element={<Services />} />
      <Route path="accounts" element={<Accounts />} />
      <Route path="inventory" element={<Inventory />} />
      <Route path="transactions" element={<Transactions />} />
      <Route path="reports" element={<ReportsLayout />}>
        <Route index element={<Navigate to="transactions" replace />} />
        <Route path="transactions" element={<TransactionsReport />} />
        <Route path="inventory" element={<InventoryReport />} />
        <Route path="profit-loss" element={<ProfitLossReport />} />
        <Route path="general" element={<GeneralReport />} />
      </Route>
      <Route path="settings" element={<Settings />}>
        <Route index element={<Navigate to="business" replace />} />
        <Route path="business" element={<BusinessSettings />} />
        <Route path="billing" element={<Billing />} />
        <Route path="backups" element={<Backups />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Route>
  )}

  {/* Admin */}
  {isAdmin && (
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="tenants" element={<Tenants />} />
      <Route path="tenants/:id" element={<TenantDetail />} />
      <Route path="plans" element={<Plans />} />
      <Route path="transactions" element={<AdminTransactions />} />
      <Route path="support" element={<AdminSupport />} />
      <Route path="backups" element={<AdminBackups />} />
      <Route path="settings" element={<AdminSettings />} />
      <Route path="legal" element={<AdminLegal />} />
      <Route path="health" element={<Health />} />
    </Route>
  )}

  {/* Catch redirect to appropriate dashboard */}
  <Route path="*" element={
    isAdmin ? <Navigate to="/admin/dashboard" replace /> :
    user ? <Navigate to="/dashboard" replace /> :
    <Navigate to="/" replace />
  } />
</Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <AppRoutes />
          </AdminAuthProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;