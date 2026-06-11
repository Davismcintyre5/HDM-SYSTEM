// src/pages/admin/Students.jsx

import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/formatters';
import { useSettings } from '../../hooks/useSettings';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import PrintButton from '../../components/PrintButton';
import { printContent } from '../../utils/print';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ 
    name: '', age: '', gender: '', phone: '', idNumber: '', 
    enrollmentDate: '', completionDate: '', computerAssigned: '', 
    feesPaid: 0, course: '' 
  });
  const [availableComputers, setAvailableComputers] = useState([]);
  const [editing, setEditing] = useState(null);
  const { settings } = useSettings();

  const fetchStudents = async () => {
    try { const res = await api.get('/school/students'); setStudents(res.data); } catch (err) { } finally { setLoading(false); }
  };

  const fetchAvailableComputers = async () => {
    try { const res = await api.get('/school/inventory/available-computers'); setAvailableComputers(res.data.available || []); } catch (err) { }
  };

  useEffect(() => { fetchStudents(); fetchAvailableComputers(); }, []);

  const addMonths = (dateStr, months) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  };

  const getCourseDuration = (courseName) => {
    const course = settings?.courses?.find(c => c.name === courseName);
    return course?.durationMonths || 3;
  };

  useEffect(() => {
    if (form.enrollmentDate && form.course) {
      const duration = getCourseDuration(form.course);
      const completion = addMonths(form.enrollmentDate, duration);
      setForm(prev => ({ ...prev, completionDate: completion }));
    }
  }, [form.enrollmentDate, form.course]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.age || !form.gender || !form.phone || !form.idNumber || !form.enrollmentDate || !form.course) {
      alert('Please fill all required fields');
      return;
    }
    try {
      if (editing) await api.put(`/school/students/${editing._id}`, form);
      else await api.post('/school/students', form);
      setModalOpen(false); setEditing(null);
      setForm({ name: '', age: '', gender: '', phone: '', idNumber: '', enrollmentDate: '', completionDate: '', computerAssigned: '', feesPaid: 0, course: '' });
      fetchStudents(); fetchAvailableComputers();
    } catch (err) { alert(err.response?.data?.message || 'Error saving student'); }
  };

  const handleDelete = async (id) => { if (!confirm('Delete this student?')) return; try { await api.delete(`/school/students/${id}`); fetchStudents(); fetchAvailableComputers(); } catch (err) { alert(err.response?.data?.message); } };

  const openEdit = (student) => {
    setEditing(student);
    setForm({
      name: student.name, age: student.age || '', gender: student.gender || '', phone: student.phone || '',
      idNumber: student.idNumber || '', enrollmentDate: student.enrollmentDate?.slice(0,10) || '',
      completionDate: student.completionDate?.slice(0,10) || '', computerAssigned: student.computerAssigned || '',
      feesPaid: student.feesPaid || 0, course: student.course || '',
    });
    setModalOpen(true);
  };

  const printList = () => {
    const rows = students.map(s => `<tr><td style="padding:8px;border:1px solid #ddd">${s.regNumber}</td><td style="padding:8px;border:1px solid #ddd">${s.name}</td><td style="padding:8px;border:1px solid #ddd">${s.course}</td><td style="padding:8px;border:1px solid #ddd">${formatCurrency(s.feesPaid)}</td><td style="padding:8px;border:1px solid #ddd">${s.computerAssigned||'-'}</td></tr>`).join('');
    printContent(`<h2>STUDENT LIST</h2><p><strong>Total:</strong> ${students.length}</p><table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f2f2f2"><th style="padding:8px;border:1px solid #ddd">Reg No</th><th style="padding:8px;border:1px solid #ddd">Name</th><th style="padding:8px;border:1px solid #ddd">Course</th><th style="padding:8px;border:1px solid #ddd">Fees Paid</th><th style="padding:8px;border:1px solid #ddd">Computer</th></tr></thead><tbody>${rows}</tbody></table>`, 'Student_List', settings);
  };

  if (loading) return <div className="text-center py-10 text-[var(--text-secondary)]">Loading students...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Students</h1>
        <div className="flex gap-2">
          <Button onClick={() => { setEditing(null); setForm({ name: '', age: '', gender: '', phone: '', idNumber: '', enrollmentDate: '', completionDate: '', computerAssigned: '', feesPaid: 0, course: '' }); setModalOpen(true); }}>+ Enroll Student</Button>
          <PrintButton onClick={printList}>Print List</PrintButton>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-[var(--border-color)]"><th className="p-3 text-xs uppercase">Reg No</th><th className="p-3 text-xs uppercase">Name</th><th className="p-3 text-xs uppercase hidden sm:table-cell">Course</th><th className="p-3 text-xs uppercase">Fees Paid</th><th className="p-3 text-xs uppercase hidden md:table-cell">Computer</th><th className="p-3">Actions</th></tr></thead><tbody>{students.map(s => (<tr key={s._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]"><td className="p-3 text-sm font-mono">{s.regNumber}</td><td className="p-3 text-sm font-medium">{s.name}</td><td className="p-3 text-sm hidden sm:table-cell">{s.course}</td><td className="p-3 text-sm font-semibold text-green-600">{formatCurrency(s.feesPaid)}</td><td className="p-3 text-sm hidden md:table-cell">{s.computerAssigned||'—'}</td><td className="p-3"><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => openEdit(s)}>✏️</Button><Button size="sm" variant="ghost" onClick={() => handleDelete(s._id)}>🗑</Button></div></td></tr>))}</tbody></table></div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Student' : 'Enroll Student'}>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div className="mb-2"><label className="block text-sm font-medium mb-1">Full Name *</label><input type="text" className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
            <div className="mb-2"><label className="block text-sm font-medium mb-1">Age *</label><input type="number" className="input" value={form.age} onChange={e => setForm({...form, age: e.target.value})} required /></div>
            <div className="mb-2"><label className="block text-sm font-medium mb-1">Gender *</label><select className="input" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} required><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
            <div className="mb-2"><label className="block text-sm font-medium mb-1">Phone *</label><input type="tel" className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required /></div>
            <div className="mb-2"><label className="block text-sm font-medium mb-1">ID Number *</label><input type="text" className="input" value={form.idNumber} onChange={e => setForm({...form, idNumber: e.target.value})} required /></div>
            <div className="mb-2"><label className="block text-sm font-medium mb-1">Enrollment Date *</label><input type="date" className="input" value={form.enrollmentDate} onChange={e => setForm({...form, enrollmentDate: e.target.value})} required /></div>
            <div className="mb-2"><label className="block text-sm font-medium mb-1">Course *</label><select className="input" value={form.course} onChange={e => setForm({...form, course: e.target.value})} required><option value="">Select course</option>{(settings?.courses||[]).map((c,i)=><option key={i} value={c.name}>{c.name} ({c.durationMonths} months - {formatCurrency(c.totalFee)})</option>)}</select></div>
            <div className="mb-2"><label className="block text-sm font-medium mb-1">Completion Date</label><input type="date" className="input bg-gray-100 dark:bg-gray-700" value={form.completionDate} readOnly /></div>
            <div className="mb-2"><label className="block text-sm font-medium mb-1">Computer</label><select className="input" value={form.computerAssigned} onChange={e => setForm({...form, computerAssigned: e.target.value})}><option value="">None</option>{availableComputers.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            <div className="mb-4 col-span-2"><label className="block text-sm font-medium mb-1">Fees Paid (KES)</label><input type="number" className="input" value={form.feesPaid} onChange={e => setForm({...form, feesPaid: parseFloat(e.target.value)||0})} /></div>
          </div>
          <Button type="submit" className="w-full">{editing ? 'Update Student' : 'Enroll Student'}</Button>
        </form>
      </Modal>
    </div>
  );
};

export default Students;