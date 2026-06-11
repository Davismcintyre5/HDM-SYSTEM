// src/pages/public/Support.jsx

import { useState } from 'react';
import api from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const Support = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/cyber/support', form);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <p className="text-5xl mb-4">✅</p>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Message Sent!</h2>
          <p className="text-[var(--text-secondary)] mt-2">We'll get back to you soon.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Contact Us</h1>
        <p className="text-[var(--text-secondary)] mt-2">Have questions? We're here to help.</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
            <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <Input label="Subject" name="subject" value={form.subject} onChange={handleChange} required />
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Message</label>
            <textarea name="message" value={form.message} onChange={handleChange} rows={5} className="input" required />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Message'}</Button>
        </form>
      </Card>
    </div>
  );
};

export default Support;