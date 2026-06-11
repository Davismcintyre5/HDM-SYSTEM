// src/pages/admin/Settings.jsx — add Branding tab

import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';

const tabs = [
  { to: '/admin/settings/school', label: '🏫 School' },
  { to: '/admin/settings/branding', label: '🎨 Branding' },
  { to: '/admin/settings/courses', label: '📚 Courses' },
  { to: '/admin/settings/profile', label: '👤 Profile' },
];

const SettingsLayout = () => {
  const location = useLocation();
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Settings</h1>
      <div className="flex gap-1 mb-6 border-b border-[var(--border-color)] overflow-x-auto">
        {tabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end className={({ isActive }) => `px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${isActive ? 'border-primary-600 text-primary-600' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>{tab.label}</NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  );
};

// ==================== SCHOOL TAB ====================
const SchoolSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/school/settings').then(res => setSettings(res.data)).finally(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => setSettings({ ...settings, [field]: value });

  const handleSave = async () => { setSaving(true); try { await api.put('/school/settings', settings); alert('Saved'); } catch (err) { } finally { setSaving(false); } };

  if (loading) return <Spinner className="py-8" />;

  return (
    <Card className="max-w-xl">
      <h3 className="text-lg font-semibold mb-4">School Information</h3>
      <div className="space-y-4">
        <Input label="School Name" value={settings?.schoolName || ''} onChange={(e) => handleChange('schoolName', e.target.value)} />
        <Input label="Motto" value={settings?.motto || ''} onChange={(e) => handleChange('motto', e.target.value)} />
        <Input label="Address" value={settings?.address || ''} onChange={(e) => handleChange('address', e.target.value)} />
        <Input label="Phone" value={settings?.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} />
        <Input label="Email" value={settings?.email || ''} onChange={(e) => handleChange('email', e.target.value)} />
        <div>
          <label className="block text-sm font-medium mb-1">About Text</label>
          <textarea value={settings?.landing?.aboutText || ''} onChange={(e) => handleChange('landing', { ...settings?.landing, aboutText: e.target.value })} rows={3} className="input" />
        </div>
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
      </div>
    </Card>
  );
};

// ==================== BRANDING TAB ====================
const BrandingSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/school/settings').then(res => setSettings(res.data)).finally(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => setSettings({ ...settings, [field]: value });
  const handleLandingChange = (field, value) => setSettings({ ...settings, landing: { ...settings?.landing, [field]: value } });

  const handleSave = async () => { setSaving(true); try { await api.put('/school/settings', settings); alert('Branding saved'); } catch (err) { } finally { setSaving(false); } };

  if (loading) return <Spinner className="py-8" />;

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <h3 className="text-lg font-semibold mb-4">Logo</h3>
        <div className="space-y-4">
          <Input label="Logo URL" value={settings?.logo || ''} onChange={(e) => handleChange('logo', e.target.value)} placeholder="https://example.com/logo.png" />
          {settings?.logo && (
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-[var(--text-secondary)] mb-2">Preview:</p>
              <img src={settings.logo} alt="Logo" className="max-h-20 object-contain" onError={(e) => e.target.style.display = 'none'} />
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Official Stamp</h3>
        <div className="space-y-4">
          <Input label="Stamp Image URL" value={settings?.stampImage || ''} onChange={(e) => handleChange('stampImage', e.target.value)} placeholder="https://example.com/stamp.png" />
          {settings?.stampImage && (
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-[var(--text-secondary)] mb-2">Preview:</p>
              <img src={settings.stampImage} alt="Stamp" className="max-h-24 object-contain" onError={(e) => e.target.style.display = 'none'} />
            </div>
          )}
          <p className="text-xs text-[var(--text-secondary)]">This stamp appears on certificates, receipts, and official documents.</p>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Hero & Gallery</h3>
        <div className="space-y-4">
          <Input label="Hero Image URL" value={settings?.landing?.heroImage || ''} onChange={(e) => handleLandingChange('heroImage', e.target.value)} placeholder="https://example.com/hero.jpg" />
          {settings?.landing?.heroImage && (
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-[var(--text-secondary)] mb-2">Preview:</p>
              <img src={settings.landing.heroImage} alt="Hero" className="max-h-32 object-cover rounded" onError={(e) => e.target.style.display = 'none'} />
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Receipt Footer</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Footer Text</label>
            <textarea value={settings?.receiptFooterText || ''} onChange={(e) => handleChange('receiptFooterText', e.target.value)} rows={2} className="input" placeholder="Thank you for your patronage. Visit again!" />
          </div>
        </div>
      </Card>

      <Button onClick={handleSave} disabled={saving} size="lg">{saving ? 'Saving...' : 'Save Branding'}</Button>
    </div>
  );
};

// ==================== COURSES TAB ====================
const CoursesSettings = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', durationMonths: 3, totalFee: 0, requirements: '' });

  useEffect(() => {
    api.get('/school/settings').then(res => setCourses(res.data?.courses || [])).finally(() => setLoading(false));
  }, []);

  const openAdd = () => { setEditingIndex(null); setForm({ name: '', description: '', durationMonths: 3, totalFee: 0, requirements: '' }); setShowForm(true); };
  const openEdit = (i) => { setEditingIndex(i); setForm(courses[i]); setShowForm(true); };

  const handleSaveCourse = async () => {
    const updated = [...courses];
    if (editingIndex !== null) updated[editingIndex] = form;
    else updated.push(form);
    setCourses(updated);
    setShowForm(false);
    setEditingIndex(null);
    try { const res = await api.get('/school/settings'); const s = res.data; s.courses = updated; await api.put('/school/settings', s); } catch (err) { }
  };

  const handleDelete = async (i) => {
    if (!confirm('Delete?')) return;
    const updated = courses.filter((_, idx) => idx !== i);
    setCourses(updated);
    try { const res = await api.get('/school/settings'); const s = res.data; s.courses = updated; await api.put('/school/settings', s); } catch (err) { }
  };

  if (loading) return <Spinner className="py-8" />;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">Courses ({courses.length})</h3>{!showForm && <Button size="sm" onClick={openAdd}>+ Add Course</Button>}</div>
      {showForm && (
        <Card className="mb-4">
          <h4 className="font-semibold mb-3">{editingIndex !== null ? 'Edit Course' : 'New Course'}</h4>
          <div className="space-y-3">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Course name" />
            <div><label className="block text-xs font-medium mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="input text-sm" /></div>
            <div className="grid grid-cols-2 gap-3"><Input label="Duration (months)" type="number" value={form.durationMonths} onChange={(e) => setForm({ ...form, durationMonths: parseInt(e.target.value) || 0 })} /><Input label="Total Fee (KES)" type="number" value={form.totalFee} onChange={(e) => setForm({ ...form, totalFee: parseInt(e.target.value) || 0 })} /></div>
            <div><label className="block text-xs font-medium mb-1">Requirements</label><textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={2} className="input text-sm" /></div>
            <div className="flex gap-2"><Button size="sm" onClick={handleSaveCourse}>{editingIndex !== null ? 'Update' : 'Save'}</Button><Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button></div>
          </div>
        </Card>
      )}
      {courses.length === 0 && !showForm ? <div className="text-center py-8 text-[var(--text-secondary)]"><p className="text-4xl mb-2">📚</p><p>No courses yet.</p></div> : (
        <div className="space-y-3">{courses.map((c, i) => (<Card key={i} className="flex items-start justify-between"><div><h4 className="font-semibold">{c.name}</h4>{c.description && <p className="text-sm text-[var(--text-secondary)] mt-1">{c.description}</p>}<div className="flex gap-4 mt-2 text-xs text-[var(--text-secondary)]"><span>📅 {c.durationMonths} months</span><span>💰 KES {c.totalFee?.toLocaleString()}</span>{c.requirements && <span>📋 {c.requirements}</span>}</div></div><div className="flex gap-1 flex-shrink-0 ml-4"><Button size="sm" variant="ghost" onClick={() => openEdit(i)}>✏️</Button><Button size="sm" variant="ghost" onClick={() => handleDelete(i)}>🗑</Button></div></Card>))}</div>
      )}
    </div>
  );
};

// ==================== PROFILE TAB ====================
const ProfileSettings = () => {
  const { user, logout } = useAuthContext();
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handlePassword = async (e) => { e.preventDefault(); setSaving(true); setMessage(''); try { await api.put('/school/auth/change-password', pwForm); setPwForm({ oldPassword: '', newPassword: '' }); setMessage('Password changed'); } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); } };

  return (
    <div className="max-w-xl space-y-6">
      <Card><h3 className="text-lg font-semibold mb-4">Admin Profile</h3><div className="space-y-2 text-sm"><div className="flex justify-between py-2 border-b border-[var(--border-color)]"><span className="text-[var(--text-secondary)]">Name</span><span className="font-medium">{user?.name}</span></div><div className="flex justify-between py-2 border-b border-[var(--border-color)]"><span className="text-[var(--text-secondary)]">Email</span><span className="font-medium">{user?.email}</span></div><div className="flex justify-between py-2"><span className="text-[var(--text-secondary)]">Role</span><span className="font-medium capitalize">{user?.role}</span></div></div></Card>
      <Card><h3 className="text-lg font-semibold mb-4">Change Password</h3>{message && <p className={`text-sm mb-4 ${message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}<form onSubmit={handlePassword} className="space-y-4"><Input label="Current Password" type="password" value={pwForm.oldPassword} onChange={(e) => setPwForm({ ...pwForm, oldPassword: e.target.value })} required /><Input label="New Password" type="password" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} required /><Button type="submit" variant="secondary" disabled={saving}>{saving ? 'Changing...' : 'Change Password'}</Button></form></Card>
      <Button variant="danger" onClick={logout} className="w-full">🚪 Logout</Button>
    </div>
  );
};

export { SettingsLayout as default, SchoolSettings, BrandingSettings, CoursesSettings, ProfileSettings };