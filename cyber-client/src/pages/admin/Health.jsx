// src/pages/admin/Health.jsx

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';

const Health = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/health');
        setHealth(res.data);
      } catch {
        setHealth({ status: 'error', message: 'Server unreachable' });
      } finally {
        setLoading(false);
      }
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Spinner className="py-12" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">System Health</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Server Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Status</span>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                health?.status === 'ok' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${health?.status === 'ok' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                {health?.status === 'ok' ? 'Healthy' : 'Down'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Uptime</span>
              <span className="font-mono text-sm text-[var(--text-primary)]">
                {health?.uptime ? formatUptime(health.uptime) : 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Last Check</span>
              <span className="font-mono text-xs text-[var(--text-primary)]">
                {health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">API Base</span>
              <span className="font-mono text-sm text-[var(--text-primary)]">/api</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Memory Usage</h3>
          {health?.memory ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--text-secondary)]">Heap Used</span>
                  <span className="font-mono text-[var(--text-primary)]">{formatBytes(health.memory.heapUsed)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-primary-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((health.memory.heapUsed / health.memory.heapTotal) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">of {formatBytes(health.memory.heapTotal)} total</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 rounded-lg bg-[var(--bg-secondary)]">
                  <p className="text-xs text-[var(--text-secondary)]">RSS</p>
                  <p className="font-mono text-sm text-[var(--text-primary)]">{formatBytes(health.memory.rss)}</p>
                </div>
                <div className="p-3 rounded-lg bg-[var(--bg-secondary)]">
                  <p className="text-xs text-[var(--text-secondary)]">External</p>
                  <p className="font-mono text-sm text-[var(--text-primary)]">{formatBytes(health.memory.external)}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-[var(--text-secondary)] text-sm">Memory data unavailable</p>
          )}
        </Card>
      </div>

      <p className="text-center text-xs text-[var(--text-secondary)] mt-6">Auto-refreshes every 30 seconds</p>
    </div>
  );
};

const formatUptime = (seconds) => {
  if (!seconds) return 'N/A';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
};

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

export default Health;