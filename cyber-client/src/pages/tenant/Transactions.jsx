// src/pages/tenant/Transactions.jsx

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/shared/EmptyState';
import { printDocument, receiptHeader, receiptFooter } from '../../utils/print';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState('');

  const [form, setForm] = useState({
    items: [{ serviceId: '', quantity: '1', price: 0 }],
    customerName: '',
    customerPhone: '',
    paymentMethod: 'cash',
    amountPaid: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      const [txRes, svcRes, settingsRes] = await Promise.all([
        api.get('/cyber/tenant/transactions'),
        api.get('/cyber/tenant/services'),
        api.get('/cyber/tenant/settings'),
      ]);
      setTransactions(txRes.data);
      setServices(svcRes.data);
      setSettings(settingsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { serviceId: '', quantity: '1', price: 0 }] });
  };

  const removeItem = (index) => {
    if (form.items.length === 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  };

  const updateItem = (index, field, value) => {
    const updated = [...form.items];
    updated[index][field] = value;

    if (field === 'serviceId') {
      const service = services.find(s => s._id === value);
      updated[index].price = service ? service.price : 0;
      updated[index].quantity = '1';
    }

    setForm({ ...form, items: updated });
  };

  const totalAmount = form.items.reduce((sum, item) => {
    const qty = parseInt(item.quantity) || 1;
    return sum + (item.price * qty);
  }, 0);

  const balance = totalAmount - (parseFloat(form.amountPaid) || 0);
  const isFullyPaid = parseFloat(form.amountPaid) >= totalAmount;

  const getDescription = () => {
    return form.items
      .filter(item => item.serviceId)
      .map(item => {
        const service = services.find(s => s._id === item.serviceId);
        const name = service?.name || 'Unknown';
        const qty = parseInt(item.quantity) || 1;
        return `${name} x${qty}`;
      })
      .join(', ');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validItems = form.items.filter(item => item.serviceId);
    if (validItems.length === 0) return;

    setSaving(true);
    try {
      const desc = getDescription() + (form.customerName ? ` - ${form.customerName}` : '');

      await api.post('/cyber/tenant/transactions', {
        type: form.paymentMethod === 'mpesa' ? 'mpesa' : 'other',
        amount: totalAmount,
        description: desc,
        status: isFullyPaid ? 'completed' : 'pending',
        reference: form.customerPhone || undefined,
      });
      setModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async (id) => {
    setConfirming(id);
    try {
      await api.put(`/cyber/tenant/transactions/${id}/confirm`);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setConfirming('');
    }
  };

  const resetForm = () => {
    setForm({
      items: [{ serviceId: '', quantity: '1', price: 0 }],
      customerName: '',
      customerPhone: '',
      paymentMethod: 'cash',
      amountPaid: '',
      notes: '',
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/cyber/tenant/transactions/${id}`);
      setTransactions(transactions.filter(t => t._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

// src/pages/tenant/Transactions.jsx — update handlePrint function

const handlePrint = (tx) => {
  const items = tx.description?.split(', ')?.map(item => {
    const match = item.match(/(.+) x(\d+)/);
    return { name: match ? match[1] : item, qty: match ? parseInt(match[2]) : 1 };
  }) || [];
  const customerName = tx.description?.split(' - ')[1] || '';
  const unitPrice = items.length > 0 ? Math.round(tx.amount / items.reduce((s, i) => s + i.qty, 0)) : tx.amount;

  printDocument({
    title: 'Official Receipt',
    headHTML: `
      <div style="text-align:center;">
        <h2 style="color:#2563eb;margin:0;">${settings?.businessName || 'My Business'}</h2>
        ${settings?.address ? `<p style="margin:2px 0;font-size:12px;color:#666;">📍 ${settings?.address}</p>` : ''}
        ${settings?.phone ? `<p style="margin:2px 0;font-size:12px;color:#666;">📞 ${settings?.phone}</p>` : ''}
        ${settings?.email ? `<p style="margin:2px 0;font-size:12px;color:#666;">✉️ ${settings?.email}</p>` : ''}
        <div style="border-top:2px solid #2563eb;margin:10px 0;"></div>
        <h1 style="font-size:22px;letter-spacing:3px;color:#333;margin:8px 0;">OFFICIAL RECEIPT</h1>
        <div style="border-bottom:1px solid #ccc;margin:8px 0;"></div>
      </div>
    `,
    content: `
      <div style="font-size:13px;">
        <table style="width:100%;margin-bottom:10px;">
          <tr><td style="color:#666;width:100px;">Receipt #</td><td style="font-weight:bold;">#${tx._id?.slice(-8).toUpperCase()}</td></tr>
          <tr><td style="color:#666;">Date</td><td>${new Date(tx.date).toLocaleString()}</td></tr>
          ${customerName ? `<tr><td style="color:#666;">Customer</td><td style="font-weight:bold;">${customerName}</td></tr>` : ''}
          ${tx.reference ? `<tr><td style="color:#666;">Phone</td><td>${tx.reference}</td></tr>` : ''}
          <tr><td style="color:#666;">Payment</td><td>${tx.type === 'mpesa' ? '📱 M-Pesa' : '💵 Cash'}</td></tr>
          <tr><td style="color:#666;">Status</td><td style="color:${tx.status === 'completed' ? '#059669' : '#d97706'};font-weight:bold;">${tx.status.toUpperCase()}</td></tr>
        </table>
        <div style="border-top:1px dashed #ccc;margin:10px 0;"></div>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="background:#f0f4ff;"><th style="text-align:left;padding:6px;font-size:11px;">ITEM</th><th style="text-align:center;padding:6px;font-size:11px;">QTY</th><th style="text-align:right;padding:6px;font-size:11px;">PRICE</th><th style="text-align:right;padding:6px;font-size:11px;">TOTAL</th></tr>
          ${items.map(i => `
            <tr>
              <td style="padding:6px;">${i.name}</td>
              <td style="text-align:center;padding:6px;">${i.qty}</td>
              <td style="text-align:right;padding:6px;">${unitPrice.toLocaleString()}</td>
              <td style="text-align:right;padding:6px;font-weight:bold;">${(unitPrice * i.qty).toLocaleString()}</td>
            </tr>
          `).join('')}
        </table>
        <div style="border-top:1px dashed #ccc;margin:10px 0;"></div>
        <table style="width:100%;">
          <tr><td style="font-size:16px;font-weight:bold;padding:4px;">TOTAL</td><td style="text-align:right;font-size:18px;font-weight:bold;color:#2563eb;padding:4px;">KES ${tx.amount?.toLocaleString()}</td></tr>
          <tr><td style="color:#666;padding:2px;">Amount Paid</td><td style="text-align:right;padding:2px;color:${tx.status === 'completed' ? '#059669' : '#d97706'};">KES ${tx.status === 'completed' ? tx.amount?.toLocaleString() : '0'}</td></tr>
        </table>
        <div style="border-top:2px solid #333;margin-top:10px;padding-top:8px;text-align:center;">
          <p style="font-size:11px;color:#666;">${settings?.receiptFooter || 'Thank you for your business!'}</p>
          ${tx.status === 'completed' ? '<p style="color:#059669;font-weight:bold;font-size:12px;">✅ PAID</p>' : '<p style="color:#d97706;font-weight:bold;font-size:12px;">⚠️ PENDING</p>'}
        </div>
      </div>
    `,
    footerHTML: `
      <p style="font-size:10px;color:#999;">Printed: ${new Date().toLocaleString()}</p>
      <p style="font-size:10px;color:#999;">This is a computer-generated receipt</p>
    `,
  });
};

  if (loading) return <Spinner className="py-12" />;

  const completedTotal = transactions.filter(t => t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const pendingTotal = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Transactions</h1>
        <Button onClick={() => { resetForm(); setModalOpen(true); }}>+ New Transaction</Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card><p className="text-sm text-[var(--text-secondary)]">Completed</p><p className="text-xl font-bold text-green-600">KES {completedTotal.toLocaleString()}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Pending</p><p className="text-xl font-bold text-yellow-600">KES {pendingTotal.toLocaleString()}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Total</p><p className="text-xl font-bold text-primary-600">KES {(completedTotal + pendingTotal).toLocaleString()}</p></Card>
      </div>

      <Card padding={false}>
        {transactions.length === 0 ? (
          <EmptyState icon="💳" title="No transactions" description="Process customer transactions here." actionLabel="New Transaction" onAction={() => setModalOpen(true)} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-left">
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Description</th>
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Type</th>
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Amount</th>
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Status</th>
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase hidden md:table-cell">Date</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]">
                    <td className="p-3 text-sm text-[var(--text-primary)] max-w-[200px] truncate">{tx.description}</td>
                    <td className="p-3"><Badge variant="info">{tx.type}</Badge></td>
                    <td className="p-3 font-semibold text-green-600">KES {tx.amount?.toLocaleString()}</td>
                    <td className="p-3"><Badge variant={tx.status === 'completed' ? 'success' : tx.status === 'failed' ? 'danger' : 'warning'}>{tx.status}</Badge></td>
                    <td className="p-3 text-sm text-[var(--text-secondary)] hidden md:table-cell">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {tx.status === 'pending' && (
                          <Button size="sm" variant="success" onClick={() => handleConfirm(tx._id)} disabled={confirming === tx._id} title="Confirm">{confirming === tx._id ? '...' : '✅'}</Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handlePrint(tx)} title="Print">🖨️</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(tx._id)} title="Delete">🗑</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-[var(--bg-primary)] rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">New Transaction</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-[var(--bg-secondary)]">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Service Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Services *</label>
                  <Button type="button" size="sm" variant="ghost" onClick={addItem}>+ Add Item</Button>
                </div>
                <div className="space-y-3">
                  {form.items.map((item, index) => (
                    <div key={index} className="flex items-end gap-2 p-3 rounded-lg bg-[var(--bg-secondary)]">
                      <div className="flex-1">
                        <select value={item.serviceId} onChange={(e) => updateItem(index, 'serviceId', e.target.value)} className="input text-sm" required>
                          <option value="">Select service</option>
                          {services.filter(s => s.active !== false).map((s) => (
                            <option key={s._id} value={s._id}>{s.name} — KES {s.price?.toLocaleString()}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-20">
                        <input type="number" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} min="1" className="input text-sm" placeholder="Qty" />
                      </div>
                      <div className="w-24 text-right text-sm font-semibold text-green-600">
                        KES {(item.price * (parseInt(item.quantity) || 1)).toLocaleString()}
                      </div>
                      {form.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 p-1">✕</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input label="Customer Name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="Walk-in" />
                <Input label="Customer Phone" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} placeholder="0712345678" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setForm({ ...form, paymentMethod: 'cash' })}
                    className={`p-2 rounded-lg border-2 text-sm transition-colors ${form.paymentMethod === 'cash' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-[var(--border-color)]'}`}>💵 Cash</button>
                  <button type="button" onClick={() => setForm({ ...form, paymentMethod: 'mpesa' })}
                    className={`p-2 rounded-lg border-2 text-sm transition-colors ${form.paymentMethod === 'mpesa' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-[var(--border-color)]'}`}>📱 M-Pesa</button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 text-center">
                <p className="text-sm text-green-700 dark:text-green-300">Total Amount</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">KES {totalAmount.toLocaleString()}</p>
              </div>

              <Input label="Amount Paid (KES)" type="number" value={form.amountPaid} onChange={(e) => setForm({ ...form, amountPaid: e.target.value })} placeholder="0" />

              {parseFloat(form.amountPaid) > 0 && (
                <div className={`p-3 rounded-lg text-sm font-medium text-center ${balance <= 0 ? 'bg-green-50 dark:bg-green-950 text-green-700' : 'bg-yellow-50 dark:bg-yellow-950 text-yellow-700'}`}>
                  {balance <= 0 ? `✅ Fully Paid — Change: KES ${Math.abs(balance).toLocaleString()}` : `⚠️ Balance Due: KES ${balance.toLocaleString()} — Saved as Pending`}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="input" placeholder="Optional notes..." />
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Saving...' : isFullyPaid ? '💾 Save Transaction' : '⏳ Save as Pending'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;