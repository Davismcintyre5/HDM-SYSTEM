// src/pages/admin/Inventory.jsx

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/shared/EmptyState';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', type: '', value: '', status: 'Available', serialNumber: '' });
  const [saving, setSaving] = useState(false);
  const [rangeModal, setRangeModal] = useState(false);
  const [rangeForm, setRangeForm] = useState({ prefix: 'PC-', start: '1', end: '10', value: '0' });
  const [addingRange, setAddingRange] = useState(false);

  const fetch = async () => { try { const res = await api.get('/school/inventory'); setItems(res.data); } catch (err) { } finally { setLoading(false); } };
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', type: '', value: '', status: 'Available', serialNumber: '' }); setModalOpen(true); };
  const openEdit = (i) => { setEditing(i); setForm({ name: i.name, type: i.type, value: i.value?.toString() || '', status: i.status, serialNumber: i.serialNumber || '' }); setModalOpen(true); };

  const handleSave = async (e) => { e.preventDefault(); setSaving(true); try { const data = { ...form, value: parseFloat(form.value) || 0 }; if (editing) await api.put(`/school/inventory/${editing._id}`, data); else await api.post('/school/inventory', data); setModalOpen(false); fetch(); } catch (err) { } finally { setSaving(false); } };

  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/school/inventory/${id}`); fetch(); } catch (err) { } };

  const handleAddRange = async () => {
    setAddingRange(true);
    const start = parseInt(rangeForm.start);
    const end = parseInt(rangeForm.end);
    try {
      for (let i = start; i <= end; i++) {
        const name = `${rangeForm.prefix}${String(i).padStart(2, '0')}`;
        await api.post('/school/inventory', { name, type: 'Computer', value: parseFloat(rangeForm.value) || 0, status: 'Available' });
      }
      setRangeModal(false);
      fetch();
    } catch (err) { console.error(err); } finally { setAddingRange(false); }
  };

  if (loading) return <Spinner className="py-12" />;

  const total = items.reduce((s, i) => s + (i.value || 0), 0);

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setRangeModal(true)}>+ Add Range</Button>
          <Button onClick={openCreate}>+ Add Item</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card><p className="text-sm text-[var(--text-secondary)]">Total Items</p><p className="text-xl font-bold">{items.length}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Total Value</p><p className="text-xl font-bold text-green-600">KES {total.toLocaleString()}</p></Card>
      </div>

      <Card padding={false}>
        {items.length === 0 ? <EmptyState icon="📦" title="No items" actionLabel="Add Item" onAction={openCreate} /> : (
          <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-[var(--border-color)]"><th className="p-3 text-xs uppercase">Name</th><th className="p-3 text-xs uppercase">Type</th><th className="p-3 text-xs uppercase">Value</th><th className="p-3 text-xs uppercase">Status</th><th className="p-3">Actions</th></tr></thead><tbody>{items.map(i => (<tr key={i._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]"><td className="p-3 text-sm font-medium">{i.name}</td><td className="p-3 text-sm">{i.type}</td><td className="p-3 text-sm font-semibold text-green-600">KES {i.value?.toLocaleString()}</td><td className="p-3"><Badge variant={i.status === 'Available' ? 'success' : 'warning'}>{i.status}</Badge></td><td className="p-3"><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => openEdit(i)}>✏️</Button><Button size="sm" variant="ghost" onClick={() => handleDelete(i._id)}>🗑</Button></div></td></tr>))}</tbody></table></div>
        )}
      </Card>

      {/* Single Item Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Item' : 'Add Item'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3"><Input label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required /><Input label="Value (KES)" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
          <Input label="Serial Number" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} />
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Add'}</Button>
        </form>
      </Modal>

      {/* Add Range Modal */}
      <Modal isOpen={rangeModal} onClose={() => setRangeModal(false)} title="Add Computer Range">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">Generate multiple computers at once.</p>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Prefix" value={rangeForm.prefix} onChange={(e) => setRangeForm({ ...rangeForm, prefix: e.target.value })} placeholder="PC-" />
            <Input label="Value (KES)" type="number" value={rangeForm.value} onChange={(e) => setRangeForm({ ...rangeForm, value: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start #" type="number" value={rangeForm.start} onChange={(e) => setRangeForm({ ...rangeForm, start: e.target.value })} />
            <Input label="End #" type="number" value={rangeForm.end} onChange={(e) => setRangeForm({ ...rangeForm, end: e.target.value })} />
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Will create: {rangeForm.prefix}{String(parseInt(rangeForm.start) || 1).padStart(2, '0')} to {rangeForm.prefix}{String(parseInt(rangeForm.end) || 1).padStart(2, '0')} ({(parseInt(rangeForm.end) || 1) - (parseInt(rangeForm.start) || 1) + 1} items)
          </p>
          <Button onClick={handleAddRange} disabled={addingRange} className="w-full">{addingRange ? 'Creating...' : 'Create Range'}</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;