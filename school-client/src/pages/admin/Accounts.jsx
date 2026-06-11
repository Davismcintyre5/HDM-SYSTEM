// src/pages/admin/Accounts.jsx

import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import PrintButton from '../../components/PrintButton';
import { printContent } from '../../utils/print';
import { useSettings } from '../../hooks/useSettings';
import { useAdminAuth } from '../../hooks/useAuth';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const Accounts = () => {
  const [balance, setBalance] = useState(0);
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [incomeModal, setIncomeModal] = useState(false);
  const [expenseModal, setExpenseModal] = useState(false);
  const [incomeForm, setIncomeForm] = useState({ description: '', amount: '' });
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '' });
  const [saving, setSaving] = useState(false);
  const { settings } = useSettings();
  const { user } = useAdminAuth();

  const fetchData = async () => {
    try {
      const { data } = await api.get('/school/accounts');
      setBalance(data.balance || 0);
      setTotalIn(data.totalIn || 0);
      setTotalOut(data.totalOut || 0);
      setTransactions(data.transactions || []);
    } catch (err) { } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const addIncome = async () => {
    if (!incomeForm.description || !incomeForm.amount || parseFloat(incomeForm.amount) <= 0) return alert('Fill all fields');
    setSaving(true);
    try { await api.post('/school/accounts/income', { amount: parseFloat(incomeForm.amount), description: incomeForm.description }); setIncomeModal(false); setIncomeForm({ description: '', amount: '' }); fetchData(); }
    catch (err) { alert(err.response?.data?.message); } finally { setSaving(false); }
  };

  const addExpense = async () => {
    if (!expenseForm.description || !expenseForm.amount || parseFloat(expenseForm.amount) <= 0) return alert('Fill all fields');
    setSaving(true);
    try { await api.post('/school/accounts/expense', { amount: parseFloat(expenseForm.amount), description: expenseForm.description }); setExpenseModal(false); setExpenseForm({ description: '', amount: '' }); fetchData(); }
    catch (err) { alert(err.response?.data?.message); } finally { setSaving(false); }
  };

// src/pages/admin/Accounts.jsx — update printTransaction

const printTransaction = (tx) => {
  const now = new Date();
  const html = `
    <div style="font-family:'Courier New',monospace;font-size:10px;width:100%;padding:5px;">
      <div style="text-align:center;border-bottom:1px dashed #000;padding-bottom:5px;margin-bottom:5px;">
        <h3 style="margin:0;font-size:12px;">${settings?.schoolName || 'School'}</h3>
        <p style="margin:1px 0;font-size:8px;">${settings?.address || ''}</p>
        <h4 style="margin:5px 0 0;font-size:11px;">${tx.type === 'in' ? 'INCOME VOUCHER' : 'EXPENSE VOUCHER'}</h4>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:1px 0;font-size:9px;">No:</td><td style="text-align:right;font-weight:bold;font-size:9px;">#${tx._id?.slice(-6).toUpperCase()}</td></tr>
        <tr><td style="padding:1px 0;font-size:9px;">Date:</td><td style="text-align:right;font-size:9px;">${new Date(tx.date).toLocaleDateString()}</td></tr>
        <tr><td style="padding:1px 0;font-size:9px;">Type:</td><td style="text-align:right;font-size:9px;">${tx.type === 'in' ? 'Income' : 'Expense'}</td></tr>
        <tr><td style="padding:1px 0;font-size:9px;">Desc:</td><td style="text-align:right;font-size:9px;">${tx.description}</td></tr>
        <tr><td colspan="2"><hr style="border:none;border-top:1px dashed #000;margin:4px 0;"/></td></tr>
        <tr><td style="padding:1px 0;font-size:11px;font-weight:bold;">AMOUNT</td><td style="text-align:right;font-weight:bold;font-size:13px;color:${tx.type==='in'?'#059669':'#dc2626'};">KES ${tx.amount?.toLocaleString()}</td></tr>
        <tr><td style="padding:1px 0;font-size:8px;">By</td><td style="text-align:right;font-size:8px;">${user?.name || 'Admin'}</td></tr>
        <tr><td colspan="2"><hr style="border:none;border-top:1px dashed #000;margin:4px 0;"/></td></tr>
      </table>
      <div style="text-align:center;font-size:8px;margin-top:4px;">
        <p style="margin:0;">${settings?.receiptFooterText || 'Thank you!'}</p>
        <p style="margin:0;">${now.toLocaleString()}</p>
      </div>
    </div>
  `;
  
  const w = window.open('', '_blank', 'width=300,height=400');
  w.document.write(`
    <!DOCTYPE html><html><head><title>Voucher</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      @page{size:80mm auto;margin:2mm}
      body{font-family:'Courier New',monospace;background:white;padding:5px;width:72mm}
      @media print{body{width:72mm;padding:2mm}}
    </style></head><body>${html}</body></html>
  `);
  w.document.close();
  w.print();
  w.onafterprint = () => w.close();
};

  if (loading) return <Spinner className="py-12" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Accounts</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="text-center"><p className="text-sm text-[var(--text-secondary)] uppercase">Balance</p><p className={`text-3xl font-bold ${balance>=0?'text-green-600':'text-red-600'}`}>{formatCurrency(balance)}</p></Card>
        <Card className="text-center"><p className="text-sm text-[var(--text-secondary)] uppercase">Income</p><p className="text-3xl font-bold text-primary-600">{formatCurrency(totalIn)}</p></Card>
        <Card className="text-center"><p className="text-sm text-[var(--text-secondary)] uppercase">Expenses</p><p className="text-3xl font-bold text-red-600">{formatCurrency(totalOut)}</p></Card>
      </div>

      <div className="flex gap-4 mb-6">
        <Button onClick={() => setIncomeModal(true)}>➕ Add Income</Button>
        <Button variant="secondary" onClick={() => setExpenseModal(true)}>💸 Add Expense</Button>
      </div>

      <Card padding={false}>
        <h2 className="text-xl font-semibold p-4 pb-0">Transaction History</h2>
        {transactions.length === 0 ? <p className="text-center py-8 text-[var(--text-secondary)]">No transactions yet.</p> : (
          <div className="space-y-2 p-4 max-h-96 overflow-y-auto">
            {transactions.map(tx => (
              <div key={tx._id} className={`flex justify-between items-center p-3 rounded-lg border-l-4 ${tx.type==='in'?'border-green-500 bg-green-50 dark:bg-green-950':'border-red-500 bg-red-50 dark:bg-red-950'}`}>
                <div className="flex-1"><p className="font-medium text-sm">{formatDate(tx.date)}</p><p className="text-sm text-[var(--text-secondary)]">{tx.description}</p></div>
                <div className="flex items-center gap-4">
                  <span className={`font-bold ${tx.type==='in'?'text-green-600':'text-red-600'}`}>{tx.type==='in'?'+':'-'}{formatCurrency(tx.amount)}</span>
                  <PrintButton onClick={() => printTransaction(tx)}>Print</PrintButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal isOpen={incomeModal} onClose={() => setIncomeModal(false)} title="Add Income">
        <div className="space-y-4"><Input label="Description *" value={incomeForm.description} onChange={e => setIncomeForm({...incomeForm, description: e.target.value})} placeholder="e.g. Student fees" /><Input label="Amount (KES) *" type="number" value={incomeForm.amount} onChange={e => setIncomeForm({...incomeForm, amount: e.target.value})} /><Button onClick={addIncome} className="w-full" disabled={saving}>{saving?'Recording...':'Record Income'}</Button></div>
      </Modal>

      <Modal isOpen={expenseModal} onClose={() => setExpenseModal(false)} title="Add Expense">
        <div className="space-y-4"><Input label="Description *" value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} placeholder="e.g. Electricity bill" /><Input label="Amount (KES) *" type="number" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} /><Button onClick={addExpense} className="w-full" variant="danger" disabled={saving}>{saving?'Recording...':'Record Expense'}</Button></div>
      </Modal>
    </div>
  );
};

export default Accounts;