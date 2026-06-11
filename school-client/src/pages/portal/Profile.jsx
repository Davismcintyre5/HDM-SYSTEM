// src/pages/portal/Profile.jsx

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuthContext } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Profile = () => {
  const { user, logout } = useAuthContext();
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/school/portal/profile')
      .then(res => {
        setData(res.data);
        setForm({ name: res.data.portalUser?.name || '', email: res.data.portalUser?.email || '' });
      })
      .catch(err => console.error(err));
  }, []);

  const handleSave = async () => { setSaving(true); setMsg(''); try { await api.put('/school/portal/profile', form); setMsg('Profile updated'); } catch (err) { setMsg(err.response?.data?.message || 'Failed'); } finally { setSaving(false); } };
  const handlePassword = async (e) => { e.preventDefault(); setSaving(true); setMsg(''); try { await api.put('/school/portal/change-password', pwForm); setPwForm({ currentPassword: '', newPassword: '' }); setMsg('Password changed'); } catch (err) { setMsg(err.response?.data?.message || 'Failed'); } finally { setSaving(false); } };

  if (!data) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Profile</h1>
      <Card>
        <h3 className="font-semibold mb-3">Account Info</h3>
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between py-1 border-b border-[var(--border-color)]"><span className="text-[var(--text-secondary)]">Reg Number</span><span className="font-medium">{data?.portalUser?.regNumber}</span></div>
          <div className="flex justify-between py-1 border-b border-[var(--border-color)]"><span className="text-[var(--text-secondary)]">Course</span><span className="font-medium">{data?.userData?.course}</span></div>
          <div className="flex justify-between py-1"><span className="text-[var(--text-secondary)]">Status</span><span className="font-medium capitalize">{data?.userData?.status}</span></div>
        </div>
        {msg && <p className={`text-sm mb-3 ${msg.includes('updated')||msg.includes('changed')?'text-green-600':'text-red-500'}`}>{msg}</p>}
        <div className="space-y-3"><Input label="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /><Input label="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /><Button onClick={handleSave} disabled={saving}>Update Profile</Button></div>
      </Card>
      <Card>
        <h3 className="font-semibold mb-3">Change Password</h3>
        <form onSubmit={handlePassword} className="space-y-3"><Input label="Current Password" type="password" value={pwForm.currentPassword} onChange={e=>setPwForm({...pwForm,currentPassword:e.target.value})} required /><Input label="New Password" type="password" value={pwForm.newPassword} onChange={e=>setPwForm({...pwForm,newPassword:e.target.value})} required /><Button type="submit" variant="secondary" disabled={saving}>Change Password</Button></form>
      </Card>
      <Button variant="danger" onClick={logout} className="w-full">🚪 Logout</Button>
    </div>
  );
};

export default Profile;