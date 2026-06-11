// src/pages/admin/Settings.jsx

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/cyber/admin/settings');
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

  const handleMpesaChange = (field, value) => {
    setSettings({ ...settings, mpesaDetails: { ...settings.mpesaDetails, [field]: value } });
  };

  const handlePaymentToggle = (method) => {
    setSettings({
      ...settings,
      paymentMethods: { ...settings.paymentMethods, [method]: !settings.paymentMethods[method] },
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/cyber/admin/settings', settings);
      alert('Settings saved');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner className="py-12" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Site Settings</h1>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">General</h3>
          <div className="space-y-4">
            <Input label="Site Name" value={settings.siteName || ''} onChange={(e) => handleChange('siteName', e.target.value)} />
            <Input label="Contact Email" value={settings.contactEmail || ''} onChange={(e) => handleChange('contactEmail', e.target.value)} />
            <Input label="Contact Phone" value={settings.contactPhone || ''} onChange={(e) => handleChange('contactPhone', e.target.value)} />
            <Input label="Address" value={settings.address || ''} onChange={(e) => handleChange('address', e.target.value)} />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Payment Methods</h3>
          <div className="space-y-3">
            {['stkPush', 'sendMoney', 'till', 'paybill'].map((method) => (
              <label key={method} className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                <input type="checkbox" checked={settings.paymentMethods?.[method] || false} onChange={() => handlePaymentToggle(method)} />
                {method === 'stkPush' ? 'STK Push' : method === 'sendMoney' ? 'Send Money' : method === 'till' ? 'Till Number' : 'Paybill'}
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">M-Pesa Details</h3>
          <div className="space-y-4">
            <Input label="Till Number" value={settings.mpesaDetails?.tillNumber || ''} onChange={(e) => handleMpesaChange('tillNumber', e.target.value)} />
            <Input label="Paybill Number" value={settings.mpesaDetails?.paybillNumber || ''} onChange={(e) => handleMpesaChange('paybillNumber', e.target.value)} />
            <Input label="Send Money Number" value={settings.mpesaDetails?.sendMoneyNumber || ''} onChange={(e) => handleMpesaChange('sendMoneyNumber', e.target.value)} />
          </div>
        </Card>

        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default Settings;