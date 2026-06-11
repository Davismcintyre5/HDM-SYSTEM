// src/pages/public/Support.jsx

import { useState } from 'react';
import api from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const Support = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', course: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await api.post('/school/applications', form); setSent(true); } catch (err) { } finally { setLoading(false); }
  };

  if (sent) return <div className="max-w-xl mx-auto px-4 py-20 text-center"><Card><p className="text-5xl mb-4">✅</p><h2 className="text-xl font-bold">Application Submitted!</h2><p className="text-gray-500 mt-2">We'll get back to you soon.</p></Card></div>;

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-8"><h1 className="text-3xl font-bold">Apply Now</h1><p className="text-gray-500 mt-2">Submit your application to join us.</p></div>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4"><Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /><Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <div><label className="block text-sm font-medium mb-1">Course</label><select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="input" required><option value="">Select course</option><option value="Computer Basics">Computer Basics</option><option value="Web Development">Web Development</option><option value="Graphic Design">Graphic Design</option><option value="Networking">Networking</option><option value="Cyber Security">Cyber Security</option><option value="Python Programming">Python Programming</option></select></div>
          <div><label className="block text-sm font-medium mb-1">Message</label><textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} className="input" /></div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Submitting...' : 'Submit Application'}</Button>
        </form>
      </Card>
    </div>
  );
};

export default Support;