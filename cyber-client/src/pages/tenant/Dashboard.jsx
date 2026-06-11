// src/pages/tenant/Dashboard.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StatCard from '../../components/ui/StatCard';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [txRes, invRes, accRes, svcRes, invRes2] = await Promise.all([
          api.get('/cyber/tenant/transactions'),
          api.get('/cyber/tenant/inventory'),
          api.get('/cyber/tenant/accounts'),
          api.get('/cyber/tenant/services'),
          api.get('/cyber/tenant/invoices'),
        ]);
        const accounts = accRes.data.accounts || [];
        const txns = txRes.data || [];
        setStats({
          services: svcRes.data.length,
          inventory: invRes.data.length,
          inventoryValue: invRes.data.reduce((s, i) => s + (i.value || 0) * (i.quantity || 1), 0),
          income: accounts.filter(a => a.type === 'in').reduce((s, a) => s + a.amount, 0),
          expenses: accounts.filter(a => a.type === 'out').reduce((s, a) => s + a.amount, 0),
          completedTxns: txns.filter(t => t.status === 'completed').reduce((s, t) => s + t.amount, 0),
          pendingTxns: txns.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0),
          recentTxns: txns.slice(0, 5),
          invoices: invRes2.data || [],
          pendingInvoices: invRes2.data?.filter(i => i.status !== 'paid').length || 0,
        });
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <Spinner className="py-12" />;

  const balance = (stats?.income || 0) - (stats?.expenses || 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <Link to="/transactions"><Button size="sm">+ New Transaction</Button></Link>
      </div>

      {/* Stats Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard title="Services" value={stats.services} icon="💻" color="primary" link="/services" linkText="Manage" />
        <StatCard title="Inventory Items" value={stats.inventory} icon="📦" color="purple" link="/inventory" linkText="View" />
        <StatCard title="Inventory Value" value={`KES ${stats.inventoryValue?.toLocaleString()}`} icon="💎" color="primary" />
        <StatCard title="Total Income" value={`KES ${stats.income?.toLocaleString()}`} icon="💰" color="green" />
      </div>

      {/* Stats Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Expenses" value={`KES ${stats.expenses?.toLocaleString()}`} icon="💸" color="red" />
        <StatCard title="Balance" value={`KES ${balance.toLocaleString()}`} icon="🏦" color={balance >= 0 ? 'green' : 'red'} />
        <StatCard title="Completed Sales" value={`KES ${stats.completedTxns?.toLocaleString()}`} icon="✅" color="green" />
        <StatCard title="Pending" value={`KES ${stats.pendingTxns?.toLocaleString()}`} icon="⏳" color="yellow" link="/transactions" linkText="View" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/transactions" className="p-3 rounded-lg bg-green-50 dark:bg-green-950 text-center hover:bg-green-100 dark:hover:bg-green-900 transition-colors">
              <span className="text-xl block mb-1">💳</span><span className="text-xs text-green-700 dark:text-green-300">New Sale</span>
            </Link>
            <Link to="/accounts" className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 text-center hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
              <span className="text-xl block mb-1">📋</span><span className="text-xs text-blue-700 dark:text-blue-300">New Invoice</span>
            </Link>
            <Link to="/services" className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950 text-center hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors">
              <span className="text-xl block mb-1">💻</span><span className="text-xs text-purple-700 dark:text-purple-300">Add Service</span>
            </Link>
            <Link to="/inventory" className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 text-center hover:bg-yellow-100 dark:hover:bg-yellow-900 transition-colors">
              <span className="text-xl block mb-1">📦</span><span className="text-xs text-yellow-700 dark:text-yellow-300">Add Item</span>
            </Link>
            <Link to="/accounts" className="p-3 rounded-lg bg-red-50 dark:bg-red-950 text-center hover:bg-red-100 dark:hover:bg-red-900 transition-colors">
              <span className="text-xl block mb-1">💸</span><span className="text-xs text-red-700 dark:text-red-300">Add Expense</span>
            </Link>
            <Link to="/reports" className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <span className="text-xl block mb-1">📈</span><span className="text-xs text-gray-700 dark:text-gray-300">Reports</span>
            </Link>
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent Sales</h3>
            <Link to="/transactions" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {stats.recentTxns?.length === 0 ? (
            <p className="text-center py-4 text-[var(--text-secondary)] text-sm">No transactions yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.recentTxns.map(tx => (
                <div key={tx._id} className="flex items-center justify-between p-2 border-b border-[var(--border-color)] text-sm">
                  <div>
                    <p className="font-medium text-[var(--text-primary)] truncate max-w-[150px]">{tx.description}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">KES {tx.amount?.toLocaleString()}</p>
                    <Badge variant={tx.status === 'completed' ? 'success' : 'warning'}>{tx.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Invoices Summary */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Invoices</h3>
            <Link to="/accounts" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 text-center">
              <p className="text-xs text-green-700 dark:text-green-300">Paid</p>
              <p className="text-lg font-bold text-green-700 dark:text-green-300">{stats.invoices?.filter(i => i.status === 'paid').length || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 text-center">
              <p className="text-xs text-yellow-700 dark:text-yellow-300">Pending</p>
              <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">{stats.pendingInvoices || 0}</p>
            </div>
          </div>
          {stats.invoices?.length === 0 ? (
            <p className="text-center py-2 text-[var(--text-secondary)] text-sm">No invoices yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.invoices.slice(0, 3).map(inv => (
                <div key={inv._id} className="flex justify-between text-sm border-b border-[var(--border-color)] pb-2">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{inv.invoiceNumber}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{inv.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">KES {inv.total?.toLocaleString()}</p>
                    <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'sent' ? 'info' : 'warning'}>{inv.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;