// src/pages/tenant/Inventory.jsx

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
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', type: '', quantity: '1', value: '', serialNumber: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await api.get('/cyber/tenant/inventory');
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', type: '', quantity: '1', value: '', serialNumber: '', notes: '' });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name, type: item.type, quantity: item.quantity?.toString() || '1',
      value: item.value?.toString() || '', serialNumber: item.serialNumber || '', notes: item.notes || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, quantity: parseInt(form.quantity) || 1, value: parseFloat(form.value) || 0 };
      if (editing) {
        await api.put(`/cyber/tenant/inventory/${editing._id}`, data);
      } else {
        await api.post('/cyber/tenant/inventory', data);
      }
      setModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await api.delete(`/cyber/tenant/inventory/${id}`);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const totalValue = items.reduce((s, i) => s + (i.value || 0) * (i.quantity || 1), 0);

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.type?.toLowerCase().includes(search.toLowerCase())
  );

  const statusVariant = (s) => {
    if (s === 'Available') return 'success';
    if (s === 'In Use') return 'warning';
    if (s === 'Maintenance') return 'info';
    return 'neutral';
  };

  if (loading) return <Spinner className="py-12" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Inventory</h1>
        <Button onClick={openCreate}>+ Add Item</Button>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <Input placeholder="Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <Card className="text-center min-w-[120px]">
          <p className="text-xs text-[var(--text-secondary)]">Total Value</p>
          <p className="text-lg font-bold text-primary-600">KES {totalValue.toLocaleString()}</p>
        </Card>
      </div>

      <Card padding={false}>
        {filtered.length === 0 ? (
          <EmptyState icon="📦" title="No items" description="Add items to your inventory." actionLabel="Add Item" onAction={openCreate} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-left">
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Item</th>
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase hidden sm:table-cell">Qty</th>
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Value</th>
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase hidden md:table-cell">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]">
                    <td className="p-3">
                      <p className="font-medium text-[var(--text-primary)]">{item.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{item.type}</p>
                    </td>
                    <td className="p-3 hidden sm:table-cell">{item.quantity || 1}</td>
                    <td className="p-3 font-semibold text-green-600">KES {((item.value || 0) * (item.quantity || 1)).toLocaleString()}</td>
                    <td className="p-3 hidden md:table-cell"><Badge variant={statusVariant(item.status)}>{item.status || 'Available'}</Badge></td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(item)}>✏️</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(item._id)}>🗑</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Item' : 'Add Item'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Item Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. HP Laptop" required />
          <Input label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="e.g. Computer, Printer" required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            <Input label="Value (KES)" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
          </div>
          <Input label="Serial Number" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} placeholder="Optional" />
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="input" />
          </div>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Add'}</Button>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;