// src/pages/tenant/Services.jsx

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/shared/EmptyState';
import { printDocument } from '../../utils/print';

const Services = () => {
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState([{ name: '', description: '', price: '', category: '' }]);

  const fetchData = async () => {
    try {
      const [svcRes, setRes] = await Promise.all([
        api.get('/cyber/tenant/services'),
        api.get('/cyber/tenant/settings'),
      ]);
      setServices(svcRes.data);
      setSettings(setRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const addRow = () => setRows([...rows, { name: '', description: '', price: '', category: '' }]);
  const removeRow = (i) => { if (rows.length === 1) return; setRows(rows.filter((_, idx) => idx !== i)); };
  const updateRow = (i, field, value) => { const u = [...rows]; u[i][field] = value; setRows(u); };

  const handleSaveAll = async () => {
    const valid = rows.filter(r => r.name.trim());
    if (valid.length === 0) return;
    setSaving(true);
    try {
      await Promise.all(valid.map(r => api.post('/cyber/tenant/services', {
        name: r.name.trim(), description: r.description.trim(),
        price: parseFloat(r.price) || 0, category: r.category.trim(),
      })));
      setRows([{ name: '', description: '', price: '', category: '' }]);
      fetchData();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return;
    try { await api.delete(`/cyber/tenant/services/${id}`); fetchData(); } catch (err) { console.error(err); }
  };

  const handlePrintBrochure = () => {
    const categories = [...new Set(services.map(s => s.category || 'Uncategorized'))];

    printDocument({
      title: 'Services Brochure',
      headHTML: `
        <div style="text-align:center;">
          <div style="width:60px;height:60px;margin:0 auto 8px;background:#2563eb;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;">💻</div>
          <h1 style="color:#2563eb;margin:0;font-size:22px;letter-spacing:1px;">${settings?.businessName || 'Our Services'}</h1>
          ${settings?.address ? `<p style="margin:4px 0 0;font-size:11px;color:#666;">📍 ${settings?.address}${settings?.phone ? ' | 📞 ' + settings.phone : ''}${settings?.email ? ' | ✉️ ' + settings.email : ''}</p>` : ''}
          <div style="width:60px;height:3px;background:#2563eb;margin:12px auto;"></div>
          <h2 style="font-size:16px;color:#333;letter-spacing:4px;text-transform:uppercase;margin:6px 0;">Services Brochure</h2>
          <div style="width:40px;height:2px;background:#ccc;margin:8px auto;"></div>
        </div>
      `,
      content: `
        <div style="font-size:13px;">
          ${services.length === 0 ? '<p style="text-align:center;color:#999;padding:20px;">No services available.</p>' : ''}

          ${categories.map(cat => {
            const catServices = services.filter(s => (s.category || 'Uncategorized') === cat);
            return `
              <div style="margin:20px 0;">
                <h3 style="background:#f0f4ff;color:#2563eb;padding:8px 12px;margin:0;font-size:13px;border-radius:4px 4px 0 0;text-transform:uppercase;letter-spacing:1px;">${cat}</h3>
                <table style="border:1px solid #e5e7eb;border-top:none;">
                  <tr style="background:#fafafa;"><th style="width:45%;padding:8px;font-size:10px;">SERVICE</th><th style="width:30%;padding:8px;font-size:10px;">DESCRIPTION</th><th style="width:25%;text-align:right;padding:8px;font-size:10px;">PRICE</th></tr>
                  ${catServices.map(s => `
                    <tr>
                      <td style="padding:8px;font-weight:600;font-size:12px;">${s.name}</td>
                      <td style="padding:8px;font-size:11px;color:#666;">${s.description || '—'}</td>
                      <td style="text-align:right;padding:8px;font-weight:bold;color:#059669;font-size:13px;">KES ${s.price?.toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </table>
              </div>
            `;
          }).join('')}

          <div style="border-top:2px solid #2563eb;margin-top:16px;padding-top:10px;text-align:center;">
            <p style="font-size:10px;color:#999;">Prices are subject to change. Contact us for the latest offers.</p>
          </div>
        </div>
      `,
      footerHTML: `
        <p style="font-weight:bold;color:#2563eb;margin:0;">${settings?.businessName || 'Our Business'}</p>
        <p style="margin:4px 0 0;font-size:10px;color:#999;">Printed: ${new Date().toLocaleString()}</p>
      `,
    });
  };

  const filtered = services.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.category?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <Spinner className="py-12" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Services</h1>
        <div className="flex gap-2">
          {services.length > 0 && <Button variant="secondary" onClick={handlePrintBrochure}>📖 Brochure</Button>}
          <Button onClick={() => setRows([...rows])}>+ Add Service</Button>
        </div>
      </div>

      {/* Add Multiple Form */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[var(--text-primary)]">Add Services</h3>
          <Button type="button" size="sm" variant="ghost" onClick={addRow}>+ Add Row</Button>
        </div>
        <div className="space-y-3">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-4"><Input value={row.name} onChange={(e) => updateRow(i, 'name', e.target.value)} placeholder="Service name" /></div>
              <div className="col-span-3"><Input value={row.category} onChange={(e) => updateRow(i, 'category', e.target.value)} placeholder="Category" /></div>
              <div className="col-span-2"><Input type="number" value={row.price} onChange={(e) => updateRow(i, 'price', e.target.value)} placeholder="Price" /></div>
              <div className="col-span-2"><Input value={row.description} onChange={(e) => updateRow(i, 'description', e.target.value)} placeholder="Desc" /></div>
              <div className="col-span-1">{rows.length > 1 && <button onClick={() => removeRow(i)} className="text-red-500 p-2">✕</button>}</div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button onClick={handleSaveAll} disabled={saving}>{saving ? 'Saving...' : 'Save All'}</Button>
        </div>
      </Card>

      {/* Search & List */}
      <div className="mb-4"><Input placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>

      <Card padding={false}>
        {filtered.length === 0 ? (
          <EmptyState icon="💻" title="No services" description="Add your first service." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-[var(--border-color)] text-left"><th className="p-3 text-xs uppercase">Name</th><th className="p-3 text-xs uppercase hidden md:table-cell">Category</th><th className="p-3 text-xs uppercase">Price</th><th className="p-3">Actions</th></tr></thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]">
                    <td className="p-3"><p className="font-medium text-[var(--text-primary)]">{s.name}</p>{s.description && <p className="text-xs text-[var(--text-secondary)] truncate max-w-[200px]">{s.description}</p>}</td>
                    <td className="p-3 hidden md:table-cell">{s.category ? <Badge variant="info">{s.category}</Badge> : '—'}</td>
                    <td className="p-3 font-semibold text-green-600">KES {s.price?.toLocaleString()}</td>
                    <td className="p-3"><Button size="sm" variant="ghost" onClick={() => handleDelete(s._id)}>🗑</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Services;