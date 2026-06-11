// src/pages/admin/Employees.jsx

import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import PrintButton from '../../components/PrintButton';
import { printContent } from '../../utils/print';
import { useSettings } from '../../hooks/useSettings';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', duty: '', salary: '', gender: 'male', paymentMethod: 'bank', paymentOption: 'Monthly', bankAccount: '', bankBranch: '', mpesaNumber: '' });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const { settings } = useSettings();

  const fetchEmployees = async () => {
    try { const res = await api.get('/school/employees'); setEmployees(res.data); } catch (err) { } finally { setLoading(false); }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', email: '', phone: '', duty: '', salary: '', gender: 'male', paymentMethod: 'bank', paymentOption: 'Monthly', bankAccount: '', bankBranch: '', mpesaNumber: '' }); setModalOpen(true); };
  const openEdit = (emp) => { setEditing(emp); setForm({ name: emp.name, email: emp.email || '', phone: emp.phone || '', duty: emp.duty || '', salary: emp.salary?.toString() || '', gender: emp.gender || 'male', paymentMethod: emp.paymentMethod || 'bank', paymentOption: emp.paymentOption || 'Monthly', bankAccount: emp.bankAccount || '', bankBranch: emp.bankBranch || '', mpesaNumber: emp.mpesaNumber || '' }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, salary: parseFloat(form.salary) || 0 };
      if (editing) await api.put(`/school/employees/${editing._id}`, data);
      else await api.post('/school/employees', data);
      setModalOpen(false); setEditing(null); fetchEmployees();
    } catch (err) { alert(err.response?.data?.message || 'Error'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/school/employees/${id}`); fetchEmployees(); } catch (err) { } };
  const handlePaySalary = async (id) => { if (!confirm('Record salary payment?')) return; try { await api.post(`/school/employees/${id}/pay`); alert('Salary paid'); fetchEmployees(); } catch (err) { alert(err.response?.data?.message); } };

  const printList = () => {
    const rows = employees.map(e => `<tr><td style="padding:6px;border:1px solid #ddd">${e.empId}</td><td style="padding:6px;border:1px solid #ddd">${e.name}</td><td style="padding:6px;border:1px solid #ddd">${e.duty||'—'}</td><td style="padding:6px;border:1px solid #ddd">${formatCurrency(e.salary)}</td><td style="padding:6px;border:1px solid #ddd">${e.phone||'—'}</td><td style="padding:6px;border:1px solid #ddd">${e.status||'active'}</td></tr>`).join('');
    printContent(`<h2>EMPLOYEE LIST</h2><p>Total: ${employees.length}</p><table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f2f2f2"><th>ID</th><th>Name</th><th>Duty</th><th>Salary</th><th>Phone</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`, 'Employee_List', settings);
  };

  if (loading) return <Spinner className="py-12" />;

  const totalSalary = employees.reduce((s, e) => s + (e.salary || 0), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Employees ({employees.length})</h1>
        <div className="flex gap-2">
          <Button onClick={openCreate}>+ Add Employee</Button>
          <PrintButton onClick={printList}>Print List</PrintButton>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card><p className="text-sm text-[var(--text-secondary)]">Total</p><p className="text-xl font-bold text-primary-600">{employees.length}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Monthly Salary</p><p className="text-xl font-bold text-green-600">{formatCurrency(totalSalary)}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Active</p><p className="text-xl font-bold text-green-600">{employees.filter(e => e.status === 'active').length}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Inactive</p><p className="text-xl font-bold text-red-600">{employees.filter(e => e.status !== 'active').length}</p></Card>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-[var(--border-color)]"><th className="p-3 text-xs uppercase">ID</th><th className="p-3 text-xs uppercase">Name</th><th className="p-3 text-xs uppercase hidden sm:table-cell">Duty</th><th className="p-3 text-xs uppercase">Salary</th><th className="p-3 text-xs uppercase">Status</th><th className="p-3">Actions</th></tr></thead><tbody>{employees.map(e => (<tr key={e._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]"><td className="p-3 text-sm font-mono">{e.empId}</td><td className="p-3 text-sm font-medium">{e.name}</td><td className="p-3 text-sm hidden sm:table-cell">{e.duty || '—'}</td><td className="p-3 text-sm font-semibold text-green-600">{formatCurrency(e.salary)}</td><td className="p-3"><Badge variant={e.status === 'active' ? 'success' : 'warning'}>{e.status || 'active'}</Badge></td><td className="p-3"><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => openEdit(e)}>✏️</Button><Button size="sm" variant="ghost" onClick={() => handlePaySalary(e._id)}>💵</Button><Button size="sm" variant="ghost" onClick={() => handleDelete(e._id)}>🗑</Button></div></td></tr>))}</tbody></table></div>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Employee' : 'Add Employee'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editing && <p className="text-xs text-[var(--text-secondary)]">Employee ID will be auto-generated (EM-001, EM-002...)</p>}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Full Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <Input label="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            <div><label className="block text-sm font-medium mb-1">Gender</label><select className="input" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
            <Input label="Duty/Role *" value={form.duty} onChange={e => setForm({...form, duty: e.target.value})} required />
            <Input label="Salary (KES) *" type="number" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">Payment Method</label><select className="input" value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})}><option value="bank">Bank Transfer</option><option value="mpesa">M-Pesa</option><option value="cash">Cash</option></select></div>
            <div><label className="block text-sm font-medium mb-1">Payment Option</label><select className="input" value={form.paymentOption} onChange={e => setForm({...form, paymentOption: e.target.value})}><option value="Monthly">Monthly</option><option value="Weekly">Weekly</option><option value="Fortnightly">Fortnightly</option></select></div>
          </div>
          {form.paymentMethod === 'bank' && (<div className="grid grid-cols-2 gap-3"><Input label="Bank Account" value={form.bankAccount} onChange={e => setForm({...form, bankAccount: e.target.value})} /><Input label="Bank Branch" value={form.bankBranch} onChange={e => setForm({...form, bankBranch: e.target.value})} /></div>)}
          {form.paymentMethod === 'mpesa' && <Input label="M-Pesa Number" value={form.mpesaNumber} onChange={e => setForm({...form, mpesaNumber: e.target.value})} />}
          <Button type="submit" className="w-full" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Employee' : 'Add Employee'}</Button>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;