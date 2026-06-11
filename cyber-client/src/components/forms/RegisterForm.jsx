// src/components/forms/RegisterForm.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';

const RegisterForm = ({ onSubmit, loading, error, trial = true }) => {
  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Business Name" name="businessName" value={form.businessName} onChange={handleChange} placeholder="My Cyber Business" required />
      <Input label="Your Name" name="ownerName" value={form.ownerName} onChange={handleChange} placeholder="John Doe" required />
      <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
      <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" required />
      <Input label="Phone (optional)" name="phone" value={form.phone} onChange={handleChange} placeholder="0712345678" />
      <Input label="Address (optional)" name="address" value={form.address} onChange={handleChange} placeholder="Nairobi, Kenya" />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating account...' : trial ? 'Start Free Trial' : 'Register'}
      </Button>
      <p className="text-center text-sm text-[var(--text-secondary)]">
        Already have an account? <Link to="/login" className="text-primary-600 hover:underline">Login</Link>
      </p>
    </form>
  );
};

export default RegisterForm;