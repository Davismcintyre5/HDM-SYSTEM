// src/pages/admin/Fees.jsx

import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import PrintButton from '../../components/PrintButton';
import { printContent } from '../../utils/print';
import { useSettings } from '../../hooks/useSettings';
import Spinner from '../../components/ui/Spinner';

const Fees = () => {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { settings } = useSettings();

  const fetchData = async () => {
    try {
      const [sRes, fRes] = await Promise.all([api.get('/school/students'), api.get('/school/fees')]);
      setStudents(sRes.data); setFees(fRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !amount || parseFloat(amount) <= 0) return alert('Select student and enter valid amount');
    setSaving(true);
    try { await api.post('/school/fees', { regNumber: selectedStudent.regNumber, amount: parseFloat(amount) }); setModalOpen(false); setSelectedStudent(null); setAmount(''); fetchData(); }
    catch (err) { alert(err.response?.data?.message); } finally { setSaving(false); }
  };

// src/pages/admin/Fees.jsx — update printReceipt

const printReceipt = (fee) => {
  const now = new Date();
  const html = `
    <div style="font-family:'Courier New',monospace;font-size:10px;width:100%;padding:5px;">
      <div style="text-align:center;border-bottom:1px dashed #000;padding-bottom:5px;margin-bottom:5px;">
        <h3 style="margin:0;font-size:12px;">${settings?.schoolName || 'School'}</h3>
        <p style="margin:1px 0;font-size:8px;">${settings?.address || ''}</p>
        <p style="margin:1px 0;font-size:8px;">📞 ${settings?.phone || ''}</p>
        <h4 style="margin:5px 0 0;font-size:11px;">FEE RECEIPT</h4>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:1px 0;font-size:9px;">No:</td><td style="text-align:right;font-weight:bold;font-size:9px;">#${fee._id?.slice(-6).toUpperCase()}</td></tr>
        <tr><td style="padding:1px 0;font-size:9px;">Date:</td><td style="text-align:right;font-size:9px;">${new Date(fee.date).toLocaleDateString()}</td></tr>
        <tr><td style="padding:1px 0;font-size:9px;">Student:</td><td style="text-align:right;font-weight:bold;font-size:9px;">${fee.studentName}</td></tr>
        <tr><td style="padding:1px 0;font-size:9px;">Reg:</td><td style="text-align:right;font-size:9px;">${fee.regNumber}</td></tr>
        <tr><td colspan="2"><hr style="border:none;border-top:1px dashed #000;margin:4px 0;"/></td></tr>
        <tr><td style="padding:1px 0;font-size:11px;font-weight:bold;">PAID</td><td style="text-align:right;font-weight:bold;font-size:13px;color:#059669;">KES ${fee.amount?.toLocaleString()}</td></tr>
        <tr><td style="padding:1px 0;font-size:8px;">Balance</td><td style="text-align:right;font-size:8px;">KES ${fee.balanceAfter?.toLocaleString()}</td></tr>
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
    <!DOCTYPE html><html><head><title>Receipt</title>
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

  const printReport = () => {
    const rows = students.map(s => { const totalFee = settings?.courses?.find(c => c.name === s.course)?.totalFee || 0; const balance = totalFee - (s.feesPaid||0); return `<tr><td style="padding:8px;border:1px solid #ddd">${s.regNumber}</td><td style="padding:8px;border:1px solid #ddd">${s.name}</td><td style="padding:8px;border:1px solid #ddd">${s.course}</td><td style="padding:8px;border:1px solid #ddd">${formatCurrency(s.feesPaid||0)}</td><td style="padding:8px;border:1px solid #ddd">${formatCurrency(balance)}</td><td style="padding:8px;border:1px solid #ddd">${balance<=0?'Paid':'Pending'}</td></tr>`; }).join('');
    printContent(`<h2>FEES REPORT</h2><p><strong>Total Students:</strong> ${students.length}</p><table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f2f2f2"><th style="padding:10px;border:1px solid #ddd">Reg No</th><th style="padding:10px;border:1px solid #ddd">Name</th><th style="padding:10px;border:1px solid #ddd">Course</th><th style="padding:10px;border:1px solid #ddd">Paid</th><th style="padding:10px;border:1px solid #ddd">Balance</th><th style="padding:10px;border:1px solid #ddd">Status</th></tr></thead><tbody>${rows}</tbody></table>`, 'Fees_Report', settings);
  };

  if (loading) return <Spinner className="py-12" />;

  const totalCollected = fees.reduce((s, f) => s + f.amount, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Fees</h1>
        <div className="flex gap-2">
          <Button onClick={() => setModalOpen(true)}>+ Record Payment</Button>
          <PrintButton onClick={printReport}>Print Report</PrintButton>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card"><p className="text-sm text-[var(--text-secondary)]">Total Collected</p><p className="text-xl font-bold text-green-600">{formatCurrency(totalCollected)}</p></div>
        <div className="card"><p className="text-sm text-[var(--text-secondary)]">Records</p><p className="text-xl font-bold">{fees.length}</p></div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {fees.length === 0 ? <p className="text-center py-8 text-[var(--text-secondary)]">No payments yet.</p> : (
          <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-[var(--border-color)]"><th className="p-3 text-xs uppercase">Date</th><th className="p-3 text-xs uppercase">Student</th><th className="p-3 text-xs uppercase">Reg No</th><th className="p-3 text-xs uppercase">Amount</th><th className="p-3 text-xs uppercase hidden md:table-cell">Balance After</th><th className="p-3">Actions</th></tr></thead><tbody>{fees.slice(0, 50).map(f => (<tr key={f._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]"><td className="p-3 text-sm">{formatDate(f.date)}</td><td className="p-3 text-sm">{f.studentName}</td><td className="p-3 text-sm font-mono">{f.regNumber}</td><td className="p-3 text-sm font-semibold text-green-600">{formatCurrency(f.amount)}</td><td className="p-3 text-sm hidden md:table-cell">{formatCurrency(f.balanceAfter)}</td><td className="p-3"><PrintButton onClick={() => printReceipt(f)}>Receipt</PrintButton></td></tr>))}</tbody></table></div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Record Fee Payment">
        <form onSubmit={handlePayment} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Select Student *</label><select className="input" value={selectedStudent?.regNumber||''} onChange={e => setSelectedStudent(students.find(s => s.regNumber === e.target.value))} required><option value="">Choose student...</option>{students.map(s => <option key={s._id} value={s.regNumber}>{s.regNumber} – {s.name} ({s.course})</option>)}</select></div>
          {selectedStudent && (
            <div className="p-3 rounded-lg bg-[var(--bg-secondary)] space-y-1 text-sm">
              <p><strong>Course:</strong> {selectedStudent.course}</p>
              <p><strong>Total Fee:</strong> {formatCurrency(settings?.courses?.find(c => c.name === selectedStudent.course)?.totalFee || 0)}</p>
              <p><strong>Paid:</strong> {formatCurrency(selectedStudent.feesPaid)}</p>
              <p><strong>Balance:</strong> {formatCurrency((settings?.courses?.find(c => c.name === selectedStudent.course)?.totalFee || 0) - selectedStudent.feesPaid)}</p>
            </div>
          )}
          <Input label="Amount (KES) *" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
          <Button type="submit" className="w-full" disabled={saving}>{saving ? 'Recording...' : 'Record Payment'}</Button>
        </form>
      </Modal>
    </div>
  );
};

export default Fees;