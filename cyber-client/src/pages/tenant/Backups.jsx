// src/pages/tenant/Backups.jsx

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/shared/EmptyState';

const Backups = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchBackups = async () => {
    try {
      const res = await api.get('/cyber/tenant/backups');
      setBackups(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBackups(); }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await api.post('/cyber/tenant/backups');
      fetchBackups();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this backup?')) return;
    try {
      await api.delete(`/cyber/tenant/backups/${id}`);
      fetchBackups();
    } catch (err) {
      console.error(err);
    }
  };

const handleDownload = (id) => {
  const token = localStorage.getItem('cyber_token');
  window.open(`/api/cyber/tenant/backups/${id}/download?token=${token}`, '_blank');
};

  if (loading) return <Spinner className="py-12" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Backups</h1>
        <Button onClick={handleCreate} disabled={creating}>{creating ? 'Creating...' : '+ Create Backup'}</Button>
      </div>

      <Card padding={false}>
        {backups.length === 0 ? (
          <EmptyState icon="🗄️" title="No backups" description="Create a backup to secure your data." actionLabel="Create Backup" onAction={handleCreate} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-left">
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase">File</th>
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase hidden md:table-cell">Size</th>
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase hidden sm:table-cell">Status</th>
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase hidden lg:table-cell">Date</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b) => (
                  <tr key={b._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]">
                    <td className="p-3 text-sm font-medium text-[var(--text-primary)] truncate max-w-[200px]">{b.filename}</td>
                    <td className="p-3 text-sm text-[var(--text-secondary)] hidden md:table-cell">{b.size ? `${(b.size / 1024).toFixed(1)} KB` : '—'}</td>
                    <td className="p-3 hidden sm:table-cell">
                      <span className={`text-xs px-2 py-1 rounded-full ${b.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{b.status}</span>
                    </td>
                    <td className="p-3 text-sm text-[var(--text-secondary)] hidden lg:table-cell">{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleDownload(b._id)}>⬇</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(b._id)}>🗑</Button>
                      </div>
                    </td>
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

export default Backups;