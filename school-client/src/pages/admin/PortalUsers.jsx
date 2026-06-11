// src/pages/admin/PortalUsers.jsx

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/shared/EmptyState';

const PortalUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => { try { const res = await api.get('/school/portal/users'); setUsers(res.data); } catch (err) { } finally { setLoading(false); } };
  useEffect(() => { fetch(); }, []);

  const handleToggle = async (id) => { try { await api.put(`/school/portal/users/${id}/toggle`); fetch(); } catch (err) { } };
  const handleReset = async (id) => { try { await api.put(`/school/portal/users/${id}/reset-password`, { newPassword: 'password123' }); alert('Password reset to: password123'); } catch (err) { } };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/school/portal/users/${id}`); fetch(); } catch (err) { } };

  if (loading) return <Spinner className="py-12" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Portal Users</h1>
      <Card padding={false}>
        {users.length === 0 ? <EmptyState icon="👥" title="No portal users" /> : (
          <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-[var(--border-color)]"><th className="p-3 text-xs uppercase">Name</th><th className="p-3 text-xs uppercase">Email</th><th className="p-3 text-xs uppercase">Reg No</th><th className="p-3 text-xs uppercase">Role</th><th className="p-3 text-xs uppercase">Active</th><th className="p-3">Actions</th></tr></thead><tbody>{users.map(u => (<tr key={u._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]"><td className="p-3 text-sm font-medium">{u.name}</td><td className="p-3 text-sm">{u.email}</td><td className="p-3 text-sm font-mono">{u.regNumber}</td><td className="p-3"><Badge variant={u.role === 'student' ? 'info' : 'neutral'}>{u.role}</Badge></td><td className="p-3"><Badge variant={u.active ? 'success' : 'danger'}>{u.active ? 'Yes' : 'No'}</Badge></td><td className="p-3"><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => handleToggle(u._id)}>{u.active ? '🚫' : '✅'}</Button><Button size="sm" variant="ghost" onClick={() => handleReset(u._id)}>🔑</Button><Button size="sm" variant="ghost" onClick={() => handleDelete(u._id)}>🗑</Button></div></td></tr>))}</tbody></table></div>
        )}
      </Card>
    </div>
  );
};

export default PortalUsers;