// src/pages/tenant/Profile.jsx

import { useState } from 'react';
import api from '../../api/axios';
import { useAuthContext } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Profile = () => {
  const { user, logout } = useAuthContext();
  const [profile, setProfile] = useState({ name: user?.ownerName || '', phone: user?.phone || '', address: user?.address || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/cyber/tenant/auth/profile', profile);
      setMessage('Profile updated');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPass(true);
    try {
      await api.put('/cyber/tenant/auth/change-password', passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setMessage('Password changed');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Profile</h1>

      {message && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 text-sm">{message}</div>
      )}

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
        <Card>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Account Info</h3>
          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Business</span><span className="font-medium text-[var(--text-primary)]">{user?.businessName}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Email</span><span className="font-medium text-[var(--text-primary)]">{user?.email}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Plan</span><span className="font-medium text-[var(--text-primary)]">{user?.plan}</span></div>
          </div>
          <div className="space-y-4">
            <Input label="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            <Input label="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            <Input label="Address" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
            <Button onClick={handleSaveProfile} disabled={saving}>{saving ? 'Saving...' : 'Update Profile'}</Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input label="Current Password" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
            <Input label="New Password" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required />
            <Button type="submit" variant="secondary" disabled={changingPass}>{changingPass ? 'Changing...' : 'Change Password'}</Button>
          </form>
          <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
            <Button variant="danger" onClick={logout} className="w-full">Logout</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;