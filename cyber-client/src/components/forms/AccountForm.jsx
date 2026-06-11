// src/components/forms/AccountForm.jsx

import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const AccountForm = ({ type, onSubmit, loading }) => {
  const [form, setForm] = useState({ amount: '', description: '', category: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, amount: parseFloat(form.amount) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Amount (KES)" name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="0" required />
      <Input label="Description" name="description" value={form.description} onChange={handleChange} placeholder={type === 'in' ? 'e.g. Client payment' : 'e.g. Rent payment'} required />
      <Input label="Category (optional)" name="category" value={form.category} onChange={handleChange} placeholder="e.g. Sales, Rent" />
      <Button type="submit" disabled={loading} variant={type === 'in' ? 'primary' : 'danger'}>
        {loading ? 'Saving...' : type === 'in' ? '+ Add Income' : '- Add Expense'}
      </Button>
    </form>
  );
};

export default AccountForm;