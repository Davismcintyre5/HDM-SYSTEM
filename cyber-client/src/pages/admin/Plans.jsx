// src/pages/admin/Plans.jsx

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/shared/EmptyState';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'monthly', price: '', trialDays: '14', features: '', active: true });
  const [saving, setSaving] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/cyber/admin/plans/all');
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const openCreate = () => {
    setEditingPlan(null);
    setForm({ name: '', type: 'monthly', price: '', trialDays: '14', features: '', active: true });
    setModalOpen(true);
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);
    setForm({ name: plan.name, type: plan.type, price: plan.price.toString(), trialDays: plan.trialDays.toString(), features: plan.features?.join(', ') || '', active: plan.active });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { ...form, price: parseFloat(form.price), trialDays: parseInt(form.trialDays), features: form.features.split(',').map(f => f.trim()).filter(Boolean) };
      if (editingPlan) {
        await api.put(`/cyber/admin/plans/${editingPlan._id}`, data);
      } else {
        await api.post('/cyber/admin/plans', data);
      }
      setModalOpen(false);
      fetchPlans();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this plan?')) return;
    try {
      await api.delete(`/cyber/admin/plans/${id}`);
      fetchPlans();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Spinner className="py-12" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Plans</h1>
        <Button onClick={openCreate}>+ Add Plan</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {plans.length === 0 ? (
          <EmptyState icon="📋" title="No plans" description="Create subscription plans for tenants." />
        ) : (
          plans.map((plan) => (
            <Card key={plan._id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{plan.name}</h3>
                  <Badge variant="info">{plan.type}</Badge>
                  {!plan.active && <Badge variant="neutral" className="ml-1">Inactive</Badge>}
                </div>
                <p className="text-2xl font-bold text-primary-600">KES {plan.price?.toLocaleString()}</p>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-2">{plan.trialDays} days trial</p>
              <ul className="mt-3 space-y-1">
                {plan.features?.map((f, i) => (
                  <li key={i} className="text-sm text-[var(--text-secondary)] flex items-center gap-1">✓ {f}</li>
                ))}
              </ul>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="secondary" onClick={() => openEdit(plan)}>Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(plan._id)}>Delete</Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingPlan ? 'Edit Plan' : 'New Plan'}>
        <div className="space-y-4">
          <Input label="Plan Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <Input label="Price (KES)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <Input label="Trial Days" type="number" value={form.trialDays} onChange={(e) => setForm({ ...form, trialDays: e.target.value })} />
          <Input label="Features (comma separated)" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Active
          </label>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Plan'}</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Plans;