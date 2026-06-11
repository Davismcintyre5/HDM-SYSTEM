// src/components/forms/ServiceForm.jsx

import { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const ServiceForm = ({ initial, onSubmit, loading }) => {
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '' });

  useEffect(() => {
    if (initial) setForm({ name: initial.name || '', description: initial.description || '', price: initial.price?.toString() || '', category: initial.category || '' });
  }, [initial]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, price: parseFloat(form.price) || 0 });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Service Name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Printing B/W" required />
      <Input label="Category" name="category" value={form.category} onChange={handleChange} placeholder="e.g. Printing" />
      <Input label="Price (KES)" name="price" type="number" value={form.price} onChange={handleChange} placeholder="0" />
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input" placeholder="Brief description..." />
      </div>
      <Button type="submit" disabled={loading}>{loading ? 'Saving...' : initial ? 'Update Service' : 'Add Service'}</Button>
    </form>
  );
};

export default ServiceForm;