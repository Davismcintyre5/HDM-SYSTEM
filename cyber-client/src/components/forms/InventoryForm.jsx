// src/components/forms/InventoryForm.jsx

import { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const InventoryForm = ({ initial, onSubmit, loading }) => {
  const [form, setForm] = useState({ name: '', type: '', quantity: '1', value: '', serialNumber: '', notes: '' });

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        type: initial.type || '',
        quantity: initial.quantity?.toString() || '1',
        value: initial.value?.toString() || '',
        serialNumber: initial.serialNumber || '',
        notes: initial.notes || '',
      });
    }
  }, [initial]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, quantity: parseInt(form.quantity) || 1, value: parseFloat(form.value) || 0 });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Item Name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. HP Laptop" required />
      <Input label="Type" name="type" value={form.type} onChange={handleChange} placeholder="e.g. Computer, Printer" required />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Quantity" name="quantity" type="number" value={form.quantity} onChange={handleChange} placeholder="1" />
        <Input label="Value (KES)" name="value" type="number" value={form.value} onChange={handleChange} placeholder="0" />
      </div>
      <Input label="Serial Number (optional)" name="serialNumber" value={form.serialNumber} onChange={handleChange} placeholder="SN-12345" />
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="input" placeholder="Optional notes..." />
      </div>
      <Button type="submit" disabled={loading}>{loading ? 'Saving...' : initial ? 'Update Item' : 'Add Item'}</Button>
    </form>
  );
};

export default InventoryForm;