// src/components/forms/MpesaForm.jsx

import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const MpesaForm = ({ onSubmit, loading, amount }) => {
  const [phone, setPhone] = useState('');
  const [reference, setReference] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ phoneNumber: phone, amount, reference });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg text-center">
        <p className="text-sm text-green-700 dark:text-green-300">Amount to Pay</p>
        <p className="text-3xl font-bold text-green-700 dark:text-green-300">KES {amount?.toLocaleString()}</p>
      </div>
      <Input label="M-Pesa Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712345678" required />
      <Input label="Reference (optional)" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Payment reference" />
      <p className="text-xs text-[var(--text-secondary)]">You'll receive an STK push on your phone to complete payment.</p>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Sending...' : '💳 Pay with M-Pesa'}
      </Button>
    </form>
  );
};

export default MpesaForm;