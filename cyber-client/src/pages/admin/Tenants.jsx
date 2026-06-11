// src/pages/admin/Tenants.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/shared/EmptyState';

const Tenants = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  const fetchTenants = async () => {
    try {
      const res = await api.get('/cyber/admin/tenants');
      setTenants(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTenants(); }, []);

  const handleAction = async (id, action) => {
    setActionLoading(id);
    try {
      await api.put(`/cyber/admin/tenants/${id}/${action}`);
      fetchTenants();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this tenant permanently? This cannot be undone.')) return;
    setActionLoading(id);
    try {
      await api.delete(`/cyber/admin/tenants/${id}`);
      fetchTenants();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading('');
    }
  };

  const statusVariant = (status) => {
    if (status === 'active') return 'success';
    if (status === 'pending') return 'warning';
    if (status === 'expired') return 'danger';
    if (status === 'suspended') return 'danger';
    if (status === 'cancelled') return 'neutral';
    return 'neutral';
  };

  if (loading) return <Spinner className="py-12" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Tenants</h1>
        <p className="text-sm text-[var(--text-secondary)]">{tenants.length} total</p>
      </div>

      <Card padding={false}>
        {tenants.length === 0 ? (
          <EmptyState icon="👥" title="No tenants yet" description="Tenants will appear here when they register." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-left">
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Business</th>
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase hidden md:table-cell">Owner</th>
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase hidden sm:table-cell">Plan</th>
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Status</th>
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase hidden lg:table-cell">Date</th>
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400 flex-shrink-0">
                          {t.businessName?.charAt(0) || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--text-primary)] truncate">{t.businessName}</p>
                          <p className="text-xs text-[var(--text-secondary)] truncate">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-[var(--text-secondary)] hidden md:table-cell">{t.ownerName}</td>
                    <td className="p-3 hidden sm:table-cell"><Badge variant="info">{t.plan}</Badge></td>
                    <td className="p-3"><Badge variant={statusVariant(t.status)}>{t.status}</Badge></td>
                    <td className="p-3 text-sm text-[var(--text-secondary)] hidden lg:table-cell">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/tenants/${t._id}`)} title="View details">👁</Button>
                        {t.status === 'pending' && (
                          <>
                            <Button size="sm" variant="primary" onClick={() => handleAction(t._id, 'approve')} disabled={actionLoading === t._id} title="Approve">✓</Button>
                            <Button size="sm" variant="danger" onClick={() => handleAction(t._id, 'reject')} disabled={actionLoading === t._id} title="Reject">✕</Button>
                          </>
                        )}
                        {t.status === 'active' && (
                          <Button size="sm" variant="warning" onClick={() => handleAction(t._id, 'suspend')} disabled={actionLoading === t._id} title="Suspend">⏸</Button>
                        )}
                        {t.status === 'suspended' && (
                          <Button size="sm" variant="success" onClick={() => handleAction(t._id, 'activate')} disabled={actionLoading === t._id} title="Activate">▶</Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(t._id)} disabled={actionLoading === t._id} title="Delete">🗑</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Tenants;