// src/pages/admin/Backups.jsx

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/shared/EmptyState';

const Backups = () => {
  const [backups, setBackups] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [emailing, setEmailing] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const fetchBackups = async () => {
    try {
      const [backupsRes, configRes] = await Promise.all([
        api.get('/cyber/admin/backups'),
        api.get('/cyber/admin/backups/config'),
      ]);
      setBackups(backupsRes.data);
      setConfig(configRes.data);
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
      await api.post('/cyber/admin/backups');
      fetchBackups();
    } catch (err) {
      console.error(err);
      alert('Backup failed');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this backup?')) return;
    try {
      await api.delete(`/cyber/admin/backups/${id}`);
      fetchBackups();
    } catch (err) {
      console.error(err);
    }
  };

 const handleDownload = (id) => {
  const token = localStorage.getItem('cyber_admin_token');
  window.open(`/api/cyber/admin/backups/${id}/download?token=${token}`, '_blank');
};

  const handleEmail = async (id) => {
    setEmailing(id);
    try {
      await api.post(`/cyber/admin/backups/${id}/email`);
      alert('Backup emailed');
      fetchBackups();
    } catch (err) {
      console.error(err);
      alert('Failed to email');
    } finally {
      setEmailing('');
    }
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      const res = await api.put('/cyber/admin/backups/config', config);
      setConfig(res.data.config);
      alert('Backup config saved');
    } catch (err) {
      console.error(err);
    } finally {
      setSavingConfig(false);
    }
  };

  const statusVariant = (status) => {
    if (status === 'completed') return 'success';
    if (status === 'failed') return 'danger';
    return 'warning';
  };

  if (loading) return <Spinner className="py-12" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Backups</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowConfig(!showConfig)}>
            ⚙️ {showConfig ? 'Hide Config' : 'Config'}
          </Button>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? 'Creating...' : '+ Create Backup'}
          </Button>
        </div>
      </div>

      {/* Backup Config Panel */}
      {showConfig && config && (
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Backup Configuration</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-[var(--text-primary)]">Auto Backup</label>
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  className="w-4 h-4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Frequency</label>
                <select
                  value={config.frequency}
                  onChange={(e) => setConfig({ ...config, frequency: e.target.value })}
                  className="input"
                  disabled={!config.enabled}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="manual">Manual Only</option>
                </select>
              </div>

              <Input
                label="Time (24h, e.g. 02:00)"
                value={config.time}
                onChange={(e) => setConfig({ ...config, time: e.target.value })}
                disabled={!config.enabled}
              />

              {config.frequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Day of Week</label>
                  <select
                    value={config.dayOfWeek}
                    onChange={(e) => setConfig({ ...config, dayOfWeek: parseInt(e.target.value) })}
                    className="input"
                    disabled={!config.enabled}
                  >
                    <option value={0}>Sunday</option>
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                  </select>
                </div>
              )}

              {config.frequency === 'monthly' && (
                <Input
                  label="Day of Month (1-28)"
                  type="number"
                  min="1"
                  max="28"
                  value={config.dayOfMonth}
                  onChange={(e) => setConfig({ ...config, dayOfMonth: parseInt(e.target.value) })}
                  disabled={!config.enabled}
                />
              )}

              <Input
                label="Retention (days)"
                type="number"
                value={config.retentionDays}
                onChange={(e) => setConfig({ ...config, retentionDays: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-[var(--text-primary)]">Auto Email Backup</label>
                <input
                  type="checkbox"
                  checked={config.emailEnabled}
                  onChange={(e) => setConfig({ ...config, emailEnabled: e.target.checked })}
                  className="w-4 h-4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Email Recipients (comma separated)
                </label>
                <textarea
                  value={config.emailRecipients?.join(', ') || ''}
                  onChange={(e) => setConfig({ ...config, emailRecipients: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  rows={3}
                  className="input"
                  placeholder="admin@example.com, backup@example.com"
                  disabled={!config.emailEnabled}
                />
              </div>

              {config.lastRunAt && (
                <p className="text-xs text-[var(--text-secondary)]">
                  Last run: {new Date(config.lastRunAt).toLocaleString()}
                </p>
              )}
              {config.nextRunAt && (
                <p className="text-xs text-[var(--text-secondary)]">
                  Next run: {new Date(config.nextRunAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={handleSaveConfig} disabled={savingConfig}>
              {savingConfig ? 'Saving...' : 'Save Config'}
            </Button>
          </div>
        </Card>
      )}

      {/* Backups List */}
      <Card padding={false}>
        {backups.length === 0 ? (
          <EmptyState icon="🗄️" title="No backups yet" description="Create a backup to secure your data." actionLabel="Create Backup" onAction={handleCreate} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-left">
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase">File</th>
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase hidden md:table-cell">Size</th>
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase hidden sm:table-cell">Records</th>
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Status</th>
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase hidden lg:table-cell">Date</th>
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((backup) => {
                  const totalRecords = Object.values(backup.recordCounts || {}).reduce((s, c) => s + c, 0);
                  return (
                    <tr key={backup._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]">
                      <td className="p-3">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[200px]">{backup.filename}</p>
                        {backup.emailSent && <span className="text-xs text-green-600">📧 Emailed</span>}
                      </td>
                      <td className="p-3 text-sm text-[var(--text-secondary)] hidden md:table-cell">
                        {backup.size ? `${(backup.size / 1024).toFixed(1)} KB` : '—'}
                      </td>
                      <td className="p-3 text-sm text-[var(--text-secondary)] hidden sm:table-cell">{totalRecords || '—'}</td>
                      <td className="p-3">
                        <Badge variant={statusVariant(backup.status)}>{backup.status}</Badge>
                      </td>
                      <td className="p-3 text-sm text-[var(--text-secondary)] hidden lg:table-cell">
                        {new Date(backup.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {backup.status === 'completed' && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => handleDownload(backup._id)} title="Download">⬇</Button>
                              <Button size="sm" variant="ghost" onClick={() => handleEmail(backup._id)} disabled={emailing === backup._id} title="Email">
                                {emailing === backup._id ? '⏳' : '📧'}
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(backup._id)} title="Delete">🗑</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Backups;