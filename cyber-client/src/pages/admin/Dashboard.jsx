// src/pages/admin/Dashboard.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StatCard from '../../components/ui/StatCard';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [recentTenants, setRecentTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [tenantRes, revenueRes, backupRes, tenantsRes] = await Promise.all([
          api.get('/cyber/admin/tenants/stats'),
          api.get('/cyber/admin/transactions/summary'),
          api.get('/cyber/admin/backups/stats'),
          api.get('/cyber/admin/tenants'),
        ]);
        setStats({ ...tenantRes.data, backups: backupRes.data });
        setRevenue(revenueRes.data);
        setRecentTenants(tenantsRes.data.slice(0, 5));
      } catch {
        setStats({ total: 0, byStatus: [], byPlan: [], backups: { total: 0 } });
        setRevenue({ totalRevenue: 0, totalTransactions: 0 });
        setRecentTenants([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Spinner className="py-12" />;

  const activeTenants = stats.byStatus?.find(s => s._id === 'active')?.count || 0;
  const pendingTenants = stats.byStatus?.find(s => s._id === 'pending')?.count || 0;
  const suspendedTenants = stats.byStatus?.find(s => s._id === 'suspended')?.count || 0;
  const trialTenants = stats.byPlan?.find(s => s._id === 'trial')?.count || 0;
  const paidTenants = (stats.byPlan?.find(s => s._id === 'monthly')?.count || 0) + (stats.byPlan?.find(s => s._id === 'yearly')?.count || 0);

  const statusVariant = (s) => {
    if (s === 'active') return 'success';
    if (s === 'pending') return 'warning';
    if (s === 'suspended' || s === 'expired') return 'danger';
    return 'neutral';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs font-bold rounded bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400">ADMIN</span>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Super Admin Dashboard</h1>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Tenants" value={stats.total} icon="👥" color="primary" link="/admin/tenants" linkText="Manage" />
        <StatCard title="Active" value={activeTenants} icon="✅" color="green" />
        <StatCard title="Pending Approval" value={pendingTenants} icon="⏳" color="yellow" link="/admin/tenants" linkText="Review" />
        <StatCard title="Total Revenue" value={`KES ${revenue.totalRevenue?.toLocaleString()}`} icon="💵" color="green" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Trial Users" value={trialTenants} icon="🆓" color="primary" />
        <StatCard title="Paid Users" value={paidTenants} icon="💳" color="purple" />
        <StatCard title="Suspended" value={suspendedTenants} icon="🚫" color="red" />
        <StatCard title="Transactions" value={revenue.totalTransactions} icon="📊" color="primary" link="/admin/transactions" linkText="View" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/admin/tenants" className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 text-center hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
              <span className="text-xl block mb-1">👥</span>
              <span className="text-xs text-blue-700 dark:text-blue-300">Manage Tenants</span>
            </Link>
            <Link to="/admin/plans" className="p-3 rounded-lg bg-green-50 dark:bg-green-950 text-center hover:bg-green-100 dark:hover:bg-green-900 transition-colors">
              <span className="text-xl block mb-1">📋</span>
              <span className="text-xs text-green-700 dark:text-green-300">Manage Plans</span>
            </Link>
            <Link to="/admin/support" className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 text-center hover:bg-yellow-100 dark:hover:bg-yellow-900 transition-colors">
              <span className="text-xl block mb-1">🎫</span>
              <span className="text-xs text-yellow-700 dark:text-yellow-300">Support Tickets</span>
            </Link>
            <Link to="/admin/settings" className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950 text-center hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors">
              <span className="text-xl block mb-1">⚙️</span>
              <span className="text-xs text-purple-700 dark:text-purple-300">Site Settings</span>
            </Link>
            <Link to="/admin/backups" className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <span className="text-xl block mb-1">🗄️</span>
              <span className="text-xs text-gray-700 dark:text-gray-300">Backups</span>
            </Link>
            <Link to="/admin/health" className="p-3 rounded-lg bg-red-50 dark:bg-red-950 text-center hover:bg-red-100 dark:hover:bg-red-900 transition-colors">
              <span className="text-xl block mb-1">❤️</span>
              <span className="text-xs text-red-700 dark:text-red-300">System Health</span>
            </Link>
          </div>
        </Card>

        {/* Recent Tenants */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent Tenants</h3>
            <Link to="/admin/tenants" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {recentTenants.length === 0 ? (
            <p className="text-center py-4 text-[var(--text-secondary)] text-sm">No tenants yet.</p>
          ) : (
            <div className="space-y-2">
              {recentTenants.map((t) => (
                <div key={t._id} className="flex items-center justify-between p-2 border-b border-[var(--border-color)] text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">
                      {t.businessName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{t.businessName}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{t.email}</p>
                    </div>
                  </div>
                  <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Breakdown */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Card>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">By Status</h3>
          <div className="flex gap-2 flex-wrap">
            {stats.byStatus?.map((s) => (
              <Badge key={s._id} variant={statusVariant(s._id)}>
                {s._id}: {s.count}
              </Badge>
            ))}
            {!stats.byStatus?.length && <p className="text-sm text-[var(--text-secondary)]">No data</p>}
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">By Plan</h3>
          <div className="flex gap-2 flex-wrap">
            {stats.byPlan?.map((p) => (
              <Badge key={p._id} variant="info">{p._id}: {p.count}</Badge>
            ))}
            {!stats.byPlan?.length && <p className="text-sm text-[var(--text-secondary)]">No data</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;