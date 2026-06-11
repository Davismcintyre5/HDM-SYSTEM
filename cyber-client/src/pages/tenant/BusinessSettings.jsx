// src/pages/tenant/BusinessSettings.jsx

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';

const BusinessSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/cyber/tenant/settings');
        setSettings(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/cyber/tenant/settings', settings);
      alert('Settings saved');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner className="py-12" />;

  return (
    <Card className="max-w-xl">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Business Settings</h3>
      <div className="space-y-4">
        <Input label="Business Name" value={settings?.businessName || ''} onChange={(e) => handleChange('businessName', e.target.value)} />
        <Input label="Address" value={settings?.address || ''} onChange={(e) => handleChange('address', e.target.value)} />
        <Input label="Phone" value={settings?.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} />
        <Input label="Email" value={settings?.email || ''} onChange={(e) => handleChange('email', e.target.value)} />
        <Input label="Currency" value={settings?.currency || 'KES'} onChange={(e) => handleChange('currency', e.target.value)} />
        <Input label="Timezone" value={settings?.timezone || 'Africa/Nairobi'} onChange={(e) => handleChange('timezone', e.target.value)} />
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Receipt Footer</label>
          <textarea value={settings?.receiptFooter || ''} onChange={(e) => handleChange('receiptFooter', e.target.value)} rows={2} className="input" placeholder="Thank you for your business!" />
        </div>
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</Button>
      </div>
    </Card>
  );
};

export default BusinessSettings;