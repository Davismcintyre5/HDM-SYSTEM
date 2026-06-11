// src/components/shared/BackupList.jsx

import { useState } from 'react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';

const BackupList = ({ backups, loading, onCreate, onDelete, onDownload, onEmail }) => {
  if (loading) return <Spinner className="py-8" />;

  const statusVariant = (status) => {
    if (status === 'completed') return 'success';
    if (status === 'failed') return 'danger';
    return 'warning';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Backups</h3>
        <Button onClick={onCreate} size="sm">+ Create Backup</Button>
      </div>

      {backups.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-secondary)]">
          <p className="text-4xl mb-2">🗄️</p>
          <p>No backups yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {backups.map((backup) => (
            <div key={backup._id} className="flex items-center justify-between p-3 border border-[var(--border-color)] rounded-lg">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl">📦</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{backup.filename}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[var(--text-secondary)]">{backup.size ? `${(backup.size / 1024).toFixed(1)} KB` : ''}</span>
                    <span className="text-xs text-[var(--text-secondary)]">{new Date(backup.createdAt).toLocaleDateString()}</span>
                    <Badge variant={statusVariant(backup.status)}>{backup.status}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {backup.status === 'completed' && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => onDownload(backup._id)}>⬇</Button>
                    <Button variant="ghost" size="sm" onClick={() => onEmail(backup._id)}>📧</Button>
                  </>
                )}
                <Button variant="ghost" size="sm" onClick={() => onDelete(backup._id)}>🗑</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BackupList;