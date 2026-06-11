// src/pages/admin/Dashboard.jsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { FeeStructureModal } from '../../components/school/FeeStructureModal';
import { BrochureModal } from '../../components/school/BrochureModal';
import { AdmissionFormModal } from '../../components/school/AdmissionFormModal';
import { CertificateModal } from '../../components/school/CertificateModal';
import { useSettings } from '../../hooks/useSettings';
import { useAdminAuth } from '../../hooks/useAuth';

const Dashboard = () => {
  const [stats, setStats] = useState({ students: 0, employees: 0, inventoryValue: 0, feesCollected: 0, applications: 0, pendingApplications: 0 });
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [brochureModalOpen, setBrochureModalOpen] = useState(false);
  const [admissionFormModalOpen, setAdmissionFormModalOpen] = useState(false);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const { settings } = useSettings();
  const { user } = useAdminAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, e, i, f, a, t] = await Promise.all([
          api.get('/school/students'),
          api.get('/school/employees'),
          api.get('/school/inventory'),
          api.get('/school/fees'),
          api.get('/school/applications'),
          api.get('/school/accounts/transactions'),
        ]);
        const students = s.data; const employees = e.data; const inventory = i.data;
        const fees = f.data; const applications = a.data; const transactions = t.data;
        setStats({
          students: students.length, employees: employees.length,
          inventoryValue: inventory.reduce((sum, it) => sum + (it.value || 0), 0),
          feesCollected: fees.reduce((sum, f) => sum + f.amount, 0),
          applications: applications.length,
          pendingApplications: applications.filter(ap => ap.status === 'pending').length,
        });
        setRecentApplications(applications.slice(0, 5));
        setRecentTransactions(transactions.slice(0, 5));
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-10 text-[var(--text-secondary)]">Loading dashboard...</div>;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setBrochureModalOpen(true)}>📖 Brochure</Button>
          <Button variant="secondary" onClick={() => setFeeModalOpen(true)}>💰 Fee Structure</Button>
        </div>
      </div>

      {/* Welcome */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950 dark:to-gray-900">
        <div className="flex flex-wrap justify-between items-center">
          <div><h2 className="text-xl font-semibold text-primary-600">Welcome back, {user?.name}!</h2><p className="text-[var(--text-secondary)] mt-1">{settings?.motto || 'Technology for Tomorrow'}</p></div>
          <div className="text-right"><p className="text-sm text-[var(--text-secondary)]">{new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Link to="/admin/students" className="card text-center hover:shadow-lg transition"><p className="text-sm text-[var(--text-secondary)]">Students</p><p className="text-2xl font-bold text-primary-600">{stats.students}</p><span className="text-xs text-blue-500">View all</span></Link>
        <Link to="/admin/employees" className="card text-center hover:shadow-lg transition"><p className="text-sm text-[var(--text-secondary)]">Employees</p><p className="text-2xl font-bold text-primary-600">{stats.employees}</p><span className="text-xs text-blue-500">View all</span></Link>
        <Link to="/admin/inventory" className="card text-center hover:shadow-lg transition"><p className="text-sm text-[var(--text-secondary)]">Inventory Value</p><p className="text-xl font-bold text-green-600">{formatCurrency(stats.inventoryValue)}</p><span className="text-xs text-blue-500">Manage</span></Link>
        <Link to="/admin/fees" className="card text-center hover:shadow-lg transition"><p className="text-sm text-[var(--text-secondary)]">Fees Collected</p><p className="text-xl font-bold text-green-600">{formatCurrency(stats.feesCollected)}</p><span className="text-xs text-blue-500">View</span></Link>
        <Link to="/admin/applications" className="card text-center hover:shadow-lg transition"><p className="text-sm text-[var(--text-secondary)]">Applications</p><p className="text-2xl font-bold text-primary-600">{stats.applications}</p><span className="text-xs text-blue-500">Manage</span></Link>
        <Link to="/admin/applications" className="card text-center hover:shadow-lg transition"><p className="text-sm text-[var(--text-secondary)]">Pending</p><p className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</p><span className="text-xs text-blue-500">Review</span></Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-3">
            <Link to="/admin/students" className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 text-center hover:bg-blue-100 dark:hover:bg-blue-900 transition"><span className="text-xl block">👨‍🎓</span><span className="text-xs">Enroll</span></Link>
            <Link to="/admin/employees" className="p-3 rounded-lg bg-green-50 dark:bg-green-950 text-center hover:bg-green-100 dark:hover:bg-green-900 transition"><span className="text-xl block">👔</span><span className="text-xs">Employee</span></Link>
            <Link to="/admin/fees" className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 text-center hover:bg-yellow-100 dark:hover:bg-yellow-900 transition"><span className="text-xl block">💰</span><span className="text-xs">Payment</span></Link>
            <Link to="/admin/accounts" className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950 text-center hover:bg-purple-100 dark:hover:bg-purple-900 transition"><span className="text-xl block">💸</span><span className="text-xs">Expense</span></Link>
            <Link to="/admin/inventory" className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-center hover:bg-indigo-100 dark:hover:bg-indigo-900 transition"><span className="text-xl block">📦</span><span className="text-xs">Asset</span></Link>
            <Link to="/admin/reports" className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-center hover:bg-gray-200 dark:hover:bg-gray-700 transition"><span className="text-xl block">📈</span><span className="text-xs">Reports</span></Link>
            <button onClick={() => setFeeModalOpen(true)} className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950 text-center hover:bg-teal-100 dark:hover:bg-teal-900 transition"><span className="text-xl block">📋</span><span className="text-xs">Fees</span></button>
            <button onClick={() => setAdmissionFormModalOpen(true)} className="p-3 rounded-lg bg-pink-50 dark:bg-pink-950 text-center hover:bg-pink-100 dark:hover:bg-pink-900 transition"><span className="text-xl block">📝</span><span className="text-xs">Admission</span></button>
            <button onClick={() => setCertificateModalOpen(true)} className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950 text-center hover:bg-teal-100 dark:hover:bg-teal-900 transition"><span className="text-xl block">📜</span><span className="text-xs">Certificate</span></button>
          </div>
        </Card>

        {/* Recent Applications */}
        <Card>
          <div className="flex justify-between items-center mb-3"><h3 className="text-lg font-semibold">Recent Applications</h3><Link to="/admin/applications" className="text-xs text-primary-600 hover:underline">View all</Link></div>
          {recentApplications.length === 0 ? <p className="text-center py-4 text-[var(--text-secondary)]">No applications yet.</p> : (
            <div className="space-y-2">
              {recentApplications.map(app => (
                <div key={app._id} className="flex justify-between items-center p-2 border-b border-[var(--border-color)]">
                  <div><p className="font-medium text-sm">{app.name}</p><p className="text-xs text-[var(--text-secondary)]">{app.course}</p></div>
                  <Badge variant={app.status === 'pending' ? 'warning' : app.status === 'accepted' ? 'success' : 'danger'}>{app.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <div className="flex justify-between items-center mb-3"><h3 className="text-lg font-semibold">Recent Transactions</h3><Link to="/admin/accounts" className="text-xs text-primary-600 hover:underline">View all</Link></div>
        {recentTransactions.length === 0 ? <p className="text-center py-4 text-[var(--text-secondary)]">No transactions yet.</p> : (
          <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-[var(--border-color)]"><th className="p-2 text-left text-xs uppercase">Date</th><th className="p-2 text-left text-xs uppercase">Description</th><th className="p-2 text-left text-xs uppercase">Type</th><th className="p-2 text-left text-xs uppercase">Amount</th></tr></thead><tbody>{recentTransactions.map(tx => (<tr key={tx._id} className="border-t border-[var(--border-color)]"><td className="p-2 text-sm">{new Date(tx.date).toLocaleDateString()}</td><td className="p-2 text-sm">{tx.description}</td><td className="p-2"><Badge variant={tx.type==='in'?'success':'danger'}>{tx.type==='in'?'Income':'Expense'}</Badge></td><td className={`p-2 text-sm font-semibold ${tx.type==='in'?'text-green-600':'text-red-600'}`}>{tx.type==='in'?'+':'-'}{formatCurrency(tx.amount)}</td></tr>))}</tbody></table></div>
        )}
      </Card>

      <FeeStructureModal isOpen={feeModalOpen} onClose={() => setFeeModalOpen(false)} />
      <BrochureModal isOpen={brochureModalOpen} onClose={() => setBrochureModalOpen(false)} />
      <AdmissionFormModal isOpen={admissionFormModalOpen} onClose={() => setAdmissionFormModalOpen(false)} />
      <CertificateModal isOpen={certificateModalOpen} onClose={() => setCertificateModalOpen(false)} />
    </div>
  );
};

export default Dashboard;