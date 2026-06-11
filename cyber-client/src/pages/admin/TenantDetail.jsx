// src/pages/admin/TenantDetail.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import StatCard from '../../components/ui/StatCard';

const TenantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTenant = async () => {
    try {
      const res = await api.get(`/cyber/admin/tenants/${id}`);
      setTenant(res.data);
    } catch {
      navigate('/admin/tenants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTenant(); }, [id]);

  const handleAction = async (action) => {
    setActionLoading(true);
    try {
      await api.put(`/cyber/admin/tenants/${id}/${action}`);
      fetchTenant();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const statusVariant = (s) => {
    if (s === 'active') return 'success';
    if (s === 'pending') return 'warning';
    if (s === 'expired') return 'danger';
    if (s === 'suspended') return 'danger';
    return 'neutral';
  };

  if (loading) return <Spinner className="py-12" />;
  if (!tenant) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={() => navigate('/admin/tenants')}>← Back</Button>
        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-lg font-bold text-primary-600 dark:text-primary-400">
          {tenant.businessName?.charAt(0) || '?'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{tenant.businessName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={statusVariant(tenant.status)}>{tenant.status}</Badge>
            <Badge variant="info">{tenant.plan}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Status" value={tenant.status} icon="📊" color={tenant.status === 'active' ? 'green' : 'yellow'} />
        <StatCard title="Plan" value={tenant.plan} icon="💳" color="primary" />
        <StatCard title="Created" value={new Date(tenant.createdAt).toLocaleDateString()} icon="📅" color="primary" />
        <StatCard title="Last Login" value={tenant.lastLogin ? new Date(tenant.lastLogin).toLocaleDateString() : 'Never'} icon="🕐" color="purple" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">👤 Business Info</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm py-2 border-b border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Business Name</span>
              <span className="font-medium text-[var(--text-primary)]">{tenant.businessName}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Owner</span>
              <span className="font-medium text-[var(--text-primary)]">{tenant.ownerName}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Email</span>
              <span className="font-medium text-[var(--text-primary)]">{tenant.email}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Phone</span>
              <span className="font-medium text-[var(--text-primary)]">{tenant.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-[var(--text-secondary)]">Address</span>
              <span className="font-medium text-[var(--text-primary)]">{tenant.address || 'N/A'}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">📋 Subscription</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm py-2 border-b border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Plan</span>
              <Badge variant="info">{tenant.plan}</Badge>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-[var(--border-color)]">
              <span className="text-[var(--text-secondary)]">Status</span>
              <Badge variant={statusVariant(tenant.status)}>{tenant.status}</Badge>
            </div>
            {tenant.trialStartDate && (
              <div className="flex justify-between text-sm py-2 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-secondary)]">Trial Start</span>
                <span className="font-medium text-[var(--text-primary)]">{new Date(tenant.trialStartDate).toLocaleDateString()}</span>
              </div>
            )}
            {tenant.trialEndDate && (
              <div className="flex justify-between text-sm py-2 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-secondary)]">Trial End</span>
                <span className="font-medium text-[var(--text-primary)]">{new Date(tenant.trialEndDate).toLocaleDateString()}</span>
              </div>
            )}
            {tenant.subscriptionStartDate && (
              <div className="flex justify-between text-sm py-2 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-secondary)]">Sub Start</span>
                <span className="font-medium text-[var(--text-primary)]">{new Date(tenant.subscriptionStartDate).toLocaleDateString()}</span>
              </div>
            )}
            {tenant.subscriptionEndDate && (
              <div className="flex justify-between text-sm py-2 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-secondary)]">Sub End</span>
                <span className="font-medium text-[var(--text-primary)]">{new Date(tenant.subscriptionEndDate).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm py-2">
              <span className="text-[var(--text-secondary)]">Auto Renew</span>
              <span className="font-medium text-[var(--text-primary)]">{tenant.autoRenew ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-2 mt-6">
        {tenant.status === 'pending' && (
          <>
            <Button variant="primary" onClick={() => handleAction('approve')} disabled={actionLoading}>✓ Approve</Button>
            <Button variant="danger" onClick={() => handleAction('reject')} disabled={actionLoading}>✕ Reject</Button>
          </>
        )}
        {tenant.status === 'active' && (
          <Button variant="warning" onClick={() => handleAction('suspend')} disabled={actionLoading}>⏸ Suspend</Button>
        )}
        {tenant.status === 'suspended' && (
          <Button variant="success" onClick={() => handleAction('activate')} disabled={actionLoading}>▶ Activate</Button>
        )}
      </div>
    </div>
  );
};

export default TenantDetail;