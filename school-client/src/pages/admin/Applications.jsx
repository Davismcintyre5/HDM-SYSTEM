// src/pages/admin/Applications.jsx

import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatDate } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import { AdmissionLetterModal } from '../../components/school/AdmissionLetterModal';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [letterModalOpen, setLetterModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingApp, setViewingApp] = useState(null);

  const fetchApplications = async () => {
    try { const res = await api.get('/school/applications'); setApplications(res.data); } catch (err) { } finally { setLoading(false); }
  };

  useEffect(() => { fetchApplications(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this application?')) return;
    try { await api.delete(`/school/applications/${id}`); fetchApplications(); } catch (err) { alert(err.response?.data?.message); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try { await api.put(`/school/applications/${id}`, { status: newStatus }); fetchApplications(); } catch (err) { alert(err.response?.data?.message); }
  };

  const statusVariant = (s) => s === 'pending' ? 'warning' : s === 'accepted' ? 'success' : 'danger';

  if (loading) return <Spinner className="py-12" />;

  const pending = applications.filter(a => a.status === 'pending').length;
  const accepted = applications.filter(a => a.status === 'accepted').length;
  const rejected = applications.filter(a => a.status === 'rejected').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Applications</h1>
        <p className="text-sm text-[var(--text-secondary)]">{applications.length} total</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="text-center"><p className="text-sm text-[var(--text-secondary)]">Pending</p><p className="text-2xl font-bold text-yellow-600">{pending}</p></Card>
        <Card className="text-center"><p className="text-sm text-[var(--text-secondary)]">Accepted</p><p className="text-2xl font-bold text-green-600">{accepted}</p></Card>
        <Card className="text-center"><p className="text-sm text-[var(--text-secondary)]">Rejected</p><p className="text-2xl font-bold text-red-600">{rejected}</p></Card>
      </div>

      <Card padding={false}>
        {applications.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-secondary)]"><p className="text-4xl mb-2">📋</p><p>No applications yet.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-[var(--border-color)]"><th className="p-3 text-xs uppercase">Date</th><th className="p-3 text-xs uppercase">Name</th><th className="p-3 text-xs uppercase hidden sm:table-cell">Email</th><th className="p-3 text-xs uppercase">Course</th><th className="p-3 text-xs uppercase">Status</th><th className="p-3 text-xs uppercase">Actions</th></tr></thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]">
                    <td className="p-3 text-sm">{formatDate(app.appliedDate || app.createdAt)}</td>
                    <td className="p-3 text-sm font-medium">{app.name}</td>
                    <td className="p-3 text-sm hidden sm:table-cell">{app.email}</td>
                    <td className="p-3 text-sm">{app.course}</td>
                    <td className="p-3">
                      <select value={app.status} onChange={(e) => handleStatusChange(app._id, e.target.value)} className="border border-[var(--border-color)] rounded px-2 py-1 text-xs bg-[var(--bg-primary)] text-[var(--text-primary)]">
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        <Button size="sm" variant="ghost" onClick={() => { setViewingApp(app); setViewModalOpen(true); }}>👁</Button>
                        {app.status === 'accepted' && (
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedApp(app); setLetterModalOpen(true); }}>📄</Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(app._id)}>🗑</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* View Modal */}
      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Application Details">
        {viewingApp && (
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Name</span><span className="font-medium">{viewingApp.name}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Email</span><span className="font-medium">{viewingApp.email}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Phone</span><span className="font-medium">{viewingApp.phone}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Course</span><span className="font-medium">{viewingApp.course}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Message</span><span className="font-medium">{viewingApp.message || '—'}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Date</span><span className="font-medium">{formatDate(viewingApp.appliedDate || viewingApp.createdAt)}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Status</span><Badge variant={statusVariant(viewingApp.status)}>{viewingApp.status}</Badge></div>
          </div>
        )}
      </Modal>

      {/* Admission Letter Modal */}
      <AdmissionLetterModal isOpen={letterModalOpen} onClose={() => { setLetterModalOpen(false); setSelectedApp(null); fetchApplications(); }} application={selectedApp} onLetterGenerated={fetchApplications} />
    </div>
  );
};

export default Applications;