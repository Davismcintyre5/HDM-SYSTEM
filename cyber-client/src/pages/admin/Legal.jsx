// src/pages/admin/Legal.jsx

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const Legal = () => {
  const [pages, setPages] = useState({ terms: '', privacy: '', refund: '' });
  const [active, setActive] = useState('terms');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/cyber/admin/legal');
        setPages(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/cyber/admin/legal', pages);
      alert('Legal pages saved');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: 'terms', label: 'Terms & Conditions' },
    { key: 'privacy', label: 'Privacy Policy' },
    { key: 'refund', label: 'Refund Policy' },
  ];

  if (loading) return <Spinner className="py-12" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Legal Pages</h1>

      <Card>
        <div className="flex gap-4 mb-4 border-b border-[var(--border-color)]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                active === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            {tabs.find(t => t.key === active)?.label} Content (HTML)
          </label>
          <textarea
            value={pages[active] || ''}
            onChange={(e) => setPages({ ...pages, [active]: e.target.value })}
            rows={15}
            className="input font-mono text-sm"
            placeholder="Enter HTML content..."
          />
        </div>

        <div className="mt-4">
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Legal Pages'}</Button>
        </div>
      </Card>
    </div>
  );
};

export default Legal;