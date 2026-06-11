// src/components/school/ApplicationFormModal.jsx

import { useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import api from '../../api/axios';

export const ApplicationFormModal = ({ isOpen, onClose }) => {
  const { settings } = useSettings();
  const [form, setForm] = useState({ name: '', email: '', phone: '', course: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try { await api.post('/school/applications', form); setSubmitted(true); setTimeout(() => { onClose(); setSubmitted(false); setForm({ name: '', email: '', phone: '', course: '', message: '' }); }, 2000); }
    catch (err) { alert(err.response?.data?.message || 'Submission failed'); } finally { setSubmitting(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply Now">
      {submitted ? (
        <div className="text-center py-8"><p className="text-green-600 text-lg font-bold">✅ Application submitted!</p><p className="text-[var(--text-secondary)]">We will contact you soon.</p></div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="block text-sm font-medium mb-1">Full Name *</label><input type="text" name="name" required className="input" value={form.name} onChange={handleChange} /></div>
          <div><label className="block text-sm font-medium mb-1">Email *</label><input type="email" name="email" required className="input" value={form.email} onChange={handleChange} /></div>
          <div><label className="block text-sm font-medium mb-1">Phone *</label><input type="tel" name="phone" required className="input" value={form.phone} onChange={handleChange} /></div>
          <div><label className="block text-sm font-medium mb-1">Select Course *</label><select name="course" required className="input" value={form.course} onChange={handleChange}><option value="">-- Select --</option>{(settings?.courses || []).map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">Message (optional)</label><textarea name="message" rows={3} className="input" value={form.message} onChange={handleChange} /></div>
          <Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Application'}</Button>
        </form>
      )}
    </Modal>
  );
};

export default ApplicationFormModal;