// src/pages/tenant/Accounts.jsx

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/shared/EmptyState';
import { printDocument, receiptHeader, receiptFooter } from '../../utils/print';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('invoices');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('income');
  const [saving, setSaving] = useState(false);
  const [payModal, setPayModal] = useState(null);
  const [payAmount, setPayAmount] = useState('');

  // Invoice form
  const [invoiceForm, setInvoiceForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    items: [{ serviceId: '', quantity: '1' }],
    paymentMethod: 'cash',
    amountPaid: '0',
    notes: '',
  });

  // Account form
  const [accountForm, setAccountForm] = useState({ amount: '', description: '', category: '' });

  const fetchData = async () => {
    try {
      const [accRes, invRes, svcRes, setRes] = await Promise.all([
        api.get('/cyber/tenant/accounts'),
        api.get('/cyber/tenant/invoices'),
        api.get('/cyber/tenant/services'),
        api.get('/cyber/tenant/settings'),
      ]);
      setAccounts(accRes.data.accounts || []);
      setInvoices(invRes.data);
      setServices(svcRes.data);
      setSettings(setRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Invoice helpers
  const addInvoiceItem = () => setInvoiceForm({ ...invoiceForm, items: [...invoiceForm.items, { serviceId: '', quantity: '1' }] });
  const removeInvoiceItem = (i) => {
    if (invoiceForm.items.length === 1) return;
    setInvoiceForm({ ...invoiceForm, items: invoiceForm.items.filter((_, idx) => idx !== i) });
  };
  const updateInvoiceItem = (i, field, value) => {
    const items = [...invoiceForm.items];
    items[i][field] = value;
    setInvoiceForm({ ...invoiceForm, items });
  };

  const invoiceTotal = invoiceForm.items.reduce((sum, item) => {
    const svc = services.find(s => s._id === item.serviceId);
    return sum + (svc?.price || 0) * (parseInt(item.quantity) || 1);
  }, 0);
  const invoiceBalance = invoiceTotal - (parseFloat(invoiceForm.amountPaid) || 0);

  const resetInvoiceForm = () => {
    setInvoiceForm({
      customerName: '', customerEmail: '', customerPhone: '',
      items: [{ serviceId: '', quantity: '1' }],
      paymentMethod: 'cash', amountPaid: '0', notes: '',
    });
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceForm.customerName || invoiceForm.items.some(i => !i.serviceId)) return;
    setSaving(true);
    try {
      await api.post('/cyber/tenant/invoices', {
        customerName: invoiceForm.customerName,
        customerEmail: invoiceForm.customerEmail,
        customerPhone: invoiceForm.customerPhone,
        items: invoiceForm.items.map(i => {
          const svc = services.find(s => s._id === i.serviceId);
          return { serviceId: svc?._id, name: svc?.name, price: svc?.price || 0, quantity: parseInt(i.quantity) || 1 };
        }),
        total: invoiceTotal,
        amountPaid: parseFloat(invoiceForm.amountPaid) || 0,
        paymentMethod: invoiceForm.paymentMethod,
        notes: invoiceForm.notes,
      });
      setModalOpen(false);
      resetInvoiceForm();
      fetchData();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const handleSendInvoice = async (id) => {
    try {
      await api.post(`/cyber/tenant/invoices/${id}/send`);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Failed to send'); }
  };

  const handlePayInvoice = async () => {
    if (!payModal || !payAmount) return;
    try {
      await api.put(`/cyber/tenant/invoices/${payModal._id}/pay`, { amount: parseFloat(payAmount) });
      setPayModal(null);
      setPayAmount('');
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDeleteInvoice = async (id) => {
    if (!confirm('Delete this invoice?')) return;
    try { await api.delete(`/cyber/tenant/invoices/${id}`); fetchData(); } catch (err) { console.error(err); }
  };

  // Account helpers
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const endpoint = modalType === 'income' ? '/cyber/tenant/accounts/income' : '/cyber/tenant/accounts/expense';
      await api.post(endpoint, { ...accountForm, amount: parseFloat(accountForm.amount) });
      setModalOpen(false);
      setAccountForm({ amount: '', description: '', category: '' });
      fetchData();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const handleDeleteAccount = async (id) => {
    if (!confirm('Delete this record?')) return;
    try { await api.delete(`/cyber/tenant/accounts/${id}`); fetchData(); } catch (err) { console.error(err); }
  };

  // Print helpers
  const handlePrintInvoice = (inv) => {
    printDocument({
      title: `Invoice ${inv.invoiceNumber}`,
      headHTML: receiptHeader({ businessName: settings?.businessName || 'My Business', address: settings?.address, phone: settings?.phone, email: settings?.email }),
      content: `
        <div style="font-size:13px;">
          <h3 style="text-align:center;">INVOICE</h3>
          <p><strong>#:</strong> ${inv.invoiceNumber}</p>
          <p><strong>Date:</strong> ${new Date(inv.date).toLocaleDateString()}</p>
          <p><strong>Customer:</strong> ${inv.customerName}</p>
          ${inv.customerEmail ? `<p><strong>Email:</strong> ${inv.customerEmail}</p>` : ''}
          <table style="width:100%;border-collapse:collapse;margin:10px 0;"><tr style="background:#f0f4ff;"><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
            ${inv.items.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>KES ${i.price?.toLocaleString()}</td><td>KES ${(i.price * i.quantity).toLocaleString()}</td></tr>`).join('')}
          </table>
          <div style="border-top:2px solid #333;padding-top:8px;"><p><strong>Total:</strong> KES ${inv.total?.toLocaleString()}</p><p><strong>Paid:</strong> KES ${inv.amountPaid?.toLocaleString()}</p><p style="color:${inv.balance > 0 ? '#dc2626' : '#059669'};"><strong>Balance:</strong> KES ${inv.balance?.toLocaleString()}</p></div>
        </div>
      `,
      footerHTML: receiptFooter(settings?.receiptFooter || 'Thank you!'),
    });
  };

 // In src/pages/tenant/Accounts.jsx — update handlePrintAccount

const handlePrintAccount = (acc) => {
  printDocument({
    title: acc.type === 'in' ? 'Income Receipt' : 'Expense Voucher',
    headHTML: receiptHeader({
      businessName: settings?.businessName || 'My Business',
      address: settings?.address,
      phone: settings?.phone,
      email: settings?.email,
    }),
    content: `
      <div style="font-size:13px;">
        <h3 style="text-align:center;color:${acc.type === 'in' ? '#059669' : '#dc2626'};">${acc.type === 'in' ? 'INCOME RECEIPT' : 'EXPENSE VOUCHER'}</h3>
        <div style="border-top:1px dashed #ccc;margin:10px 0;"></div>
        <table style="width:100%;">
          <tr><td style="color:#666;padding:4px;">Description</td><td style="text-align:right;font-weight:bold;padding:4px;">${acc.description}</td></tr>
          <tr><td style="color:#666;padding:4px;">Amount</td><td style="text-align:right;font-weight:bold;font-size:16px;color:${acc.type === 'in' ? '#059669' : '#dc2626'};padding:4px;">KES ${acc.amount?.toLocaleString()}</td></tr>
          <tr><td style="color:#666;padding:4px;">Type</td><td style="text-align:right;padding:4px;">${acc.type === 'in' ? 'Income' : 'Expense'}</td></tr>
          <tr><td style="color:#666;padding:4px;">Category</td><td style="text-align:right;padding:4px;">${acc.category || '—'}</td></tr>
          <tr><td style="color:#666;padding:4px;">Date</td><td style="text-align:right;padding:4px;">${new Date(acc.date).toLocaleString()}</td></tr>
          ${acc.reference ? `<tr><td style="color:#666;padding:4px;">Reference</td><td style="text-align:right;padding:4px;">${acc.reference}</td></tr>` : ''}
        </table>
        <div style="border-top:2px solid #333;margin-top:10px;padding-top:8px;"></div>
      </div>
    `,
    footerHTML: receiptFooter(settings?.receiptFooter || 'Thank you!'),
  });
};

  if (loading) return <Spinner className="py-12" />;

  const totalIncome = accounts.filter(a => a.type === 'in').reduce((s, a) => s + a.amount, 0);
  const totalExpense = accounts.filter(a => a.type === 'out').reduce((s, a) => s + a.amount, 0);
  const invoicePaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Accounts</h1>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => { setModalType('invoice'); resetInvoiceForm(); setModalOpen(true); }}>+ Invoice</Button>
          <Button variant="success" onClick={() => { setModalType('income'); setAccountForm({ amount: '', description: '', category: '' }); setModalOpen(true); }}>+ Income</Button>
          <Button variant="danger" onClick={() => { setModalType('expense'); setAccountForm({ amount: '', description: '', category: '' }); setModalOpen(true); }}>+ Expense</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card><p className="text-sm text-[var(--text-secondary)]">Income</p><p className="text-xl font-bold text-green-600">KES {totalIncome.toLocaleString()}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Expenses</p><p className="text-xl font-bold text-red-600">KES {totalExpense.toLocaleString()}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Balance</p><p className={`text-xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-primary-600' : 'text-red-600'}`}>KES {(totalIncome - totalExpense).toLocaleString()}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Invoiced</p><p className="text-xl font-bold text-purple-600">KES {invoicePaid.toLocaleString()}</p></Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-[var(--border-color)]">
        {[{ key: 'invoices', label: '📋 Invoices' }, { key: 'income', label: '💰 Income' }, { key: 'expenses', label: '💸 Expenses' }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            {tab.label} {tab.key === 'invoices' ? `(${invoices.length})` : ''}
          </button>
        ))}
      </div>

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <Card padding={false}>
          {invoices.length === 0 ? (
            <EmptyState icon="📋" title="No invoices" description="Create your first invoice." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-[var(--border-color)] text-left"><th className="p-3 text-xs uppercase">Invoice</th><th className="p-3 text-xs uppercase">Customer</th><th className="p-3 text-xs uppercase">Total</th><th className="p-3 text-xs uppercase">Balance</th><th className="p-3 text-xs uppercase">Status</th><th className="p-3 text-xs uppercase hidden md:table-cell">Date</th><th className="p-3">Actions</th></tr></thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]">
                      <td className="p-3"><p className="font-medium text-sm">{inv.invoiceNumber}</p></td>
                      <td className="p-3 text-sm">{inv.customerName}</td>
                      <td className="p-3 text-sm font-semibold">KES {inv.total?.toLocaleString()}</td>
                      <td className="p-3 text-sm" style={{ color: inv.balance > 0 ? '#dc2626' : '#059669' }}>KES {inv.balance?.toLocaleString()}</td>
                      <td className="p-3"><Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'sent' ? 'info' : inv.status === 'draft' ? 'warning' : 'neutral'}>{inv.status}</Badge></td>
                      <td className="p-3 text-sm text-[var(--text-secondary)] hidden md:table-cell">{new Date(inv.date).toLocaleDateString()}</td>
                      <td className="p-3">
                        <div className="flex gap-1 flex-wrap">
                          <Button size="sm" variant="ghost" onClick={() => handlePrintInvoice(inv)}>🖨️</Button>
                          {(inv.status === 'draft' || inv.status === 'sent') && inv.balance > 0 && (
                            <Button size="sm" variant="success" onClick={() => { setPayModal(inv); setPayAmount(inv.balance.toString()); }}>💵</Button>
                          )}
                          {(inv.status === 'draft' || inv.status === 'sent') && inv.customerEmail && (
                            <Button size="sm" variant="info" onClick={() => handleSendInvoice(inv._id)}>📧</Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteInvoice(inv._id)}>🗑</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Income Tab */}
      {activeTab === 'income' && (
        <Card padding={false}>
          {accounts.filter(a => a.type === 'in').length === 0 ? (
            <EmptyState icon="💰" title="No income" description="Add income records." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-[var(--border-color)]"><th className="p-3 text-xs uppercase">Description</th><th className="p-3 text-xs uppercase">Category</th><th className="p-3 text-xs uppercase">Amount</th><th className="p-3 text-xs uppercase hidden md:table-cell">Date</th><th className="p-3">Actions</th></tr></thead>
                <tbody>
                  {accounts.filter(a => a.type === 'in').map(a => (
                    <tr key={a._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]">
                      <td className="p-3 text-sm">{a.description}</td>
                      <td className="p-3 text-sm">{a.category || '—'}</td>
                      <td className="p-3 font-semibold text-green-600">KES {a.amount?.toLocaleString()}</td>
                      <td className="p-3 text-sm text-[var(--text-secondary)] hidden md:table-cell">{new Date(a.date).toLocaleDateString()}</td>
                      <td className="p-3"><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => handlePrintAccount(a)}>🖨️</Button><Button size="sm" variant="ghost" onClick={() => handleDeleteAccount(a._id)}>🗑</Button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <Card padding={false}>
          {accounts.filter(a => a.type === 'out').length === 0 ? (
            <EmptyState icon="💸" title="No expenses" description="Add expense records." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-[var(--border-color)]"><th className="p-3 text-xs uppercase">Description</th><th className="p-3 text-xs uppercase">Category</th><th className="p-3 text-xs uppercase">Amount</th><th className="p-3 text-xs uppercase hidden md:table-cell">Date</th><th className="p-3">Actions</th></tr></thead>
                <tbody>
                  {accounts.filter(a => a.type === 'out').map(a => (
                    <tr key={a._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]">
                      <td className="p-3 text-sm">{a.description}</td>
                      <td className="p-3 text-sm">{a.category || '—'}</td>
                      <td className="p-3 font-semibold text-red-600">KES {a.amount?.toLocaleString()}</td>
                      <td className="p-3 text-sm text-[var(--text-secondary)] hidden md:table-cell">{new Date(a.date).toLocaleDateString()}</td>
                      <td className="p-3"><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => handlePrintAccount(a)}>🖨️</Button><Button size="sm" variant="ghost" onClick={() => handleDeleteAccount(a._id)}>🗑</Button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Invoice Modal */}
      <Modal isOpen={modalOpen && modalType === 'invoice'} onClose={() => setModalOpen(false)} title="New Invoice" size="lg">
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Customer Name *" value={invoiceForm.customerName} onChange={(e) => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })} required />
            <Input label="Customer Email" type="email" value={invoiceForm.customerEmail} onChange={(e) => setInvoiceForm({ ...invoiceForm, customerEmail: e.target.value })} />
          </div>
          <Input label="Customer Phone" value={invoiceForm.customerPhone} onChange={(e) => setInvoiceForm({ ...invoiceForm, customerPhone: e.target.value })} />

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Items *</label>
              <Button type="button" size="sm" variant="ghost" onClick={addInvoiceItem}>+ Add</Button>
            </div>
            {invoiceForm.items.map((item, i) => (
              <div key={i} className="flex gap-2 mb-2 items-end">
                <select value={item.serviceId} onChange={(e) => updateInvoiceItem(i, 'serviceId', e.target.value)} className="input flex-1" required>
                  <option value="">Select service</option>
                  {services.map(s => <option key={s._id} value={s._id}>{s.name} — KES {s.price?.toLocaleString()}</option>)}
                </select>
                <input type="number" value={item.quantity} onChange={(e) => updateInvoiceItem(i, 'quantity', e.target.value)} min="1" className="input w-20" />
                {invoiceForm.items.length > 1 && <button type="button" onClick={() => removeInvoiceItem(i)} className="text-red-500 p-2">✕</button>}
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 text-center"><p className="text-sm">Total: <strong className="text-lg">KES {invoiceTotal.toLocaleString()}</strong></p></div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Amount Paid" type="number" value={invoiceForm.amountPaid} onChange={(e) => setInvoiceForm({ ...invoiceForm, amountPaid: e.target.value })} />
            <div><label className="block text-sm font-medium mb-1">Method</label>
              <select value={invoiceForm.paymentMethod} onChange={(e) => setInvoiceForm({ ...invoiceForm, paymentMethod: e.target.value })} className="input">
                <option value="cash">Cash</option><option value="mpesa">M-Pesa</option><option value="bank">Bank</option><option value="other">Other</option>
              </select>
            </div>
          </div>
          {parseFloat(invoiceForm.amountPaid) > 0 && (
            <div className={`p-2 rounded-lg text-sm text-center font-medium ${invoiceBalance <= 0 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
              {invoiceBalance <= 0 ? '✅ Fully Paid' : `⚠️ Balance: KES ${invoiceBalance.toLocaleString()}`}
            </div>
          )}
          <div><label className="block text-sm font-medium mb-1">Notes</label><textarea value={invoiceForm.notes} onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })} rows={2} className="input" /></div>
          <Button type="submit" className="w-full" disabled={saving}>{saving ? 'Creating...' : 'Create Invoice'}</Button>
        </form>
      </Modal>

      {/* Account Modal */}
      <Modal isOpen={modalOpen && (modalType === 'income' || modalType === 'expense')} onClose={() => setModalOpen(false)} title={modalType === 'income' ? 'Add Income' : 'Add Expense'}>
        <form onSubmit={handleCreateAccount} className="space-y-4">
          <Input label="Amount (KES)" type="number" value={accountForm.amount} onChange={(e) => setAccountForm({ ...accountForm, amount: e.target.value })} required />
          <Input label="Description" value={accountForm.description} onChange={(e) => setAccountForm({ ...accountForm, description: e.target.value })} required />
          <Input label="Category" value={accountForm.category} onChange={(e) => setAccountForm({ ...accountForm, category: e.target.value })} />
          <Button type="submit" className="w-full" disabled={saving} variant={modalType === 'income' ? 'success' : 'danger'}>{saving ? 'Saving...' : modalType === 'income' ? 'Add Income' : 'Add Expense'}</Button>
        </form>
      </Modal>

      {/* Pay Invoice Modal */}
      <Modal isOpen={!!payModal} onClose={() => setPayModal(null)} title="Record Payment">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">Invoice: <strong>{payModal?.invoiceNumber}</strong></p>
          <p className="text-sm text-[var(--text-secondary)]">Balance Due: <strong className="text-red-600">KES {payModal?.balance?.toLocaleString()}</strong></p>
          <Input label="Amount Received (KES)" type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
          <Button onClick={handlePayInvoice} className="w-full" disabled={!payAmount}>Record Payment</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Accounts;