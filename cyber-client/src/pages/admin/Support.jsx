// src/pages/admin/Support.jsx

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/shared/EmptyState';

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/cyber/admin/support');
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await api.put(`/cyber/admin/support/${replyModal._id}/reply`, { reply: replyText });
      setReplyModal(null);
      setReplyText('');
      fetchTickets();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/cyber/admin/support/${id}/status`, { status });
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const statusVariant = (s) => {
    if (s === 'open') return 'warning';
    if (s === 'in_progress') return 'info';
    if (s === 'resolved') return 'success';
    return 'neutral';
  };

  if (loading) return <Spinner className="py-12" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Support Tickets</h1>

      <div className="space-y-4">
        {tickets.length === 0 ? (
          <EmptyState icon="🎫" title="No tickets" description="Support tickets from users will appear here." />
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket._id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[var(--text-primary)]">{ticket.subject}</h3>
                    <Badge variant={statusVariant(ticket.status)}>{ticket.status}</Badge>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{ticket.message}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-secondary)]">
                    <span>{ticket.name}</span>
                    <span>{ticket.email}</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                  {ticket.adminReply && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
                      <p className="font-medium text-blue-700 dark:text-blue-300">Admin Reply:</p>
                      <p className="text-[var(--text-secondary)]">{ticket.adminReply}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button size="sm" variant="secondary" onClick={() => setReplyModal(ticket)}>Reply</Button>
                  {ticket.status !== 'resolved' && (
                    <Button size="sm" variant="success" onClick={() => handleStatus(ticket._id, 'resolved')}>Resolve</Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal isOpen={!!replyModal} onClose={() => setReplyModal(null)} title="Reply to Ticket">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]"><strong>From:</strong> {replyModal?.name} ({replyModal?.email})</p>
          <p className="text-sm text-[var(--text-secondary)]"><strong>Subject:</strong> {replyModal?.subject}</p>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Your Reply</label>
            <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4} className="input" placeholder="Type your reply..." />
          </div>
          <Button onClick={handleReply} disabled={sending}>{sending ? 'Sending...' : 'Send Reply'}</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Support;