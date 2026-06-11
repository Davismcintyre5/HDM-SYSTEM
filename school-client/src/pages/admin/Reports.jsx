// src/pages/admin/Reports.jsx

import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useSettings } from '../../hooks/useSettings';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { printContent } from '../../utils/print';
import PrintButton from '../../components/PrintButton';

const tabs = [
  { to: '/admin/reports/students', label: '👨‍🎓 Students' },
  { to: '/admin/reports/fees', label: '💰 Fees' },
  { to: '/admin/reports/employees', label: '👔 Employees' },
  { to: '/admin/reports/inventory', label: '📦 Inventory' },
  { to: '/admin/reports/general', label: '📋 General' },
];

const ReportsLayout = () => {
  const location = useLocation();
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Reports</h1>
      <div className="flex gap-1 mb-6 border-b border-[var(--border-color)] overflow-x-auto">
        {tabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end className={({ isActive }) => `px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${isActive ? 'border-primary-600 text-primary-600' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>{tab.label}</NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  );
};

// ==================== STUDENTS REPORT ====================
const StudentsReport = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  useEffect(() => {
    api.get('/school/students').then(res => setStudents(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner className="py-8" />;

  const byCourse = {};
  const byGender = {};
  students.forEach(s => { byCourse[s.course] = (byCourse[s.course] || 0) + 1; byGender[s.gender] = (byGender[s.gender] || 0) + 1; });

  const handlePrint = () => {
    const rows = students.map(s => `<tr><td style="padding:6px;border:1px solid #ddd">${s.regNumber}</td><td style="padding:6px;border:1px solid #ddd">${s.name}</td><td style="padding:6px;border:1px solid #ddd">${s.course}</td><td style="padding:6px;border:1px solid #ddd">${s.gender||'—'}</td><td style="padding:6px;border:1px solid #ddd">${s.phone||'—'}</td><td style="padding:6px;border:1px solid #ddd">${formatCurrency(s.feesPaid)}</td><td style="padding:6px;border:1px solid #ddd">${s.computerAssigned||'—'}</td></tr>`).join('');
    printContent(`<h2>STUDENTS REPORT</h2><p>Total: ${students.length}</p><table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f2f2f2"><th>Reg No</th><th>Name</th><th>Course</th><th>Gender</th><th>Phone</th><th>Fees Paid</th><th>Computer</th></tr></thead><tbody>${rows}</tbody></table>`, 'Students_Report', settings);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold">Students Report</h3><PrintButton onClick={handlePrint}>Print</PrintButton></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card><p className="text-sm text-[var(--text-secondary)]">Total</p><p className="text-xl font-bold text-primary-600">{students.length}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Courses</p><p className="text-xl font-bold text-green-600">{Object.keys(byCourse).length}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Male</p><p className="text-xl font-bold text-blue-600">{byGender['Male']||0}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Female</p><p className="text-xl font-bold text-pink-600">{byGender['Female']||0}</p></Card>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card><h4 className="font-semibold mb-3">By Course</h4>{Object.entries(byCourse).map(([k,v]) => <div key={k} className="flex justify-between text-sm border-b border-[var(--border-color)] pb-2 mb-2"><span>{k}</span><span className="font-semibold">{v}</span></div>)}</Card>
        <Card><h4 className="font-semibold mb-3">By Gender</h4>{Object.entries(byGender).map(([k,v]) => <div key={k} className="flex justify-between text-sm border-b border-[var(--border-color)] pb-2 mb-2"><span>{k||'Unknown'}</span><span className="font-semibold">{v}</span></div>)}</Card>
      </div>
    </div>
  );
};

// ==================== FEES REPORT ====================
const FeesReport = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  useEffect(() => {
    api.get('/school/students').then(res => setStudents(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner className="py-8" />;

  const totalFees = students.reduce((s, st) => { const c = settings?.courses?.find(co => co.name === st.course); return s + (c?.totalFee || 0); }, 0);
  const totalPaid = students.reduce((s, st) => s + (st.feesPaid || 0), 0);
  const totalBalance = totalFees - totalPaid;
  const fullyPaid = students.filter(s => { const c = settings?.courses?.find(co => co.name === s.course); return (s.feesPaid||0) >= (c?.totalFee||0); }).length;

  const handlePrint = () => {
    const rows = students.map(s => { const tf = settings?.courses?.find(c => c.name === s.course)?.totalFee||0; const bal = tf - (s.feesPaid||0); return `<tr><td style="padding:6px;border:1px solid #ddd">${s.regNumber}</td><td style="padding:6px;border:1px solid #ddd">${s.name}</td><td style="padding:6px;border:1px solid #ddd">${s.course}</td><td style="padding:6px;border:1px solid #ddd">${formatCurrency(tf)}</td><td style="padding:6px;border:1px solid #ddd">${formatCurrency(s.feesPaid||0)}</td><td style="padding:6px;border:1px solid #ddd">${formatCurrency(bal)}</td><td style="padding:6px;border:1px solid #ddd">${bal<=0?'Paid':'Pending'}</td></tr>`; }).join('');
    printContent(`<h2>FEES REPORT</h2><p>Total Expected: ${formatCurrency(totalFees)} | Collected: ${formatCurrency(totalPaid)} | Balance: ${formatCurrency(totalBalance)}</p><table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f2f2f2"><th>Reg No</th><th>Name</th><th>Course</th><th>Total Fee</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`, 'Fees_Report', settings);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold">Fees Report</h3><PrintButton onClick={handlePrint}>Print</PrintButton></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card><p className="text-sm text-[var(--text-secondary)]">Expected</p><p className="text-xl font-bold text-primary-600">{formatCurrency(totalFees)}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Collected</p><p className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Balance</p><p className="text-xl font-bold text-red-600">{formatCurrency(totalBalance)}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Fully Paid</p><p className="text-xl font-bold text-green-600">{fullyPaid}/{students.length}</p></Card>
      </div>
    </div>
  );
};

// ==================== EMPLOYEES REPORT ====================
const EmployeesReport = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  useEffect(() => {
    api.get('/school/employees').then(res => setEmployees(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner className="py-8" />;

  const totalSalary = employees.reduce((s, e) => s + (e.salary || 0), 0);

  const handlePrint = () => {
    const rows = employees.map(e => `<tr><td style="padding:6px;border:1px solid #ddd">${e.empId}</td><td style="padding:6px;border:1px solid #ddd">${e.name}</td><td style="padding:6px;border:1px solid #ddd">${e.duty||'—'}</td><td style="padding:6px;border:1px solid #ddd">${formatCurrency(e.salary)}</td><td style="padding:6px;border:1px solid #ddd">${e.phone||'—'}</td><td style="padding:6px;border:1px solid #ddd">${e.status||'active'}</td></tr>`).join('');
    printContent(`<h2>EMPLOYEES REPORT</h2><p>Total: ${employees.length} | Monthly Salary: ${formatCurrency(totalSalary)}</p><table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f2f2f2"><th>Emp ID</th><th>Name</th><th>Duty</th><th>Salary</th><th>Phone</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`, 'Employees_Report', settings);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold">Employees Report</h3><PrintButton onClick={handlePrint}>Print</PrintButton></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card><p className="text-sm text-[var(--text-secondary)]">Total</p><p className="text-xl font-bold text-primary-600">{employees.length}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Total Salary</p><p className="text-xl font-bold text-green-600">{formatCurrency(totalSalary)}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Active</p><p className="text-xl font-bold text-green-600">{employees.filter(e=>e.status==='active').length}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Inactive</p><p className="text-xl font-bold text-red-600">{employees.filter(e=>e.status!=='active').length}</p></Card>
      </div>
    </div>
  );
};

// ==================== INVENTORY REPORT ====================
const InventoryReport = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  useEffect(() => {
    api.get('/school/inventory').then(res => setItems(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner className="py-8" />;

  const totalValue = items.reduce((s, i) => s + (i.value || 0), 0);
  const byType = {};
  items.forEach(i => { byType[i.type] = (byType[i.type] || 0) + 1; });

  const handlePrint = () => {
    const rows = items.map(i => `<tr><td style="padding:6px;border:1px solid #ddd">${i.name}</td><td style="padding:6px;border:1px solid #ddd">${i.type}</td><td style="padding:6px;border:1px solid #ddd">${formatCurrency(i.value)}</td><td style="padding:6px;border:1px solid #ddd">${i.status}</td><td style="padding:6px;border:1px solid #ddd">${i.serialNumber||'—'}</td></tr>`).join('');
    printContent(`<h2>INVENTORY REPORT</h2><p>Total Items: ${items.length} | Total Value: ${formatCurrency(totalValue)}</p><table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f2f2f2"><th>Name</th><th>Type</th><th>Value</th><th>Status</th><th>Serial</th></tr></thead><tbody>${rows}</tbody></table>`, 'Inventory_Report', settings);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold">Inventory Report</h3><PrintButton onClick={handlePrint}>Print</PrintButton></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card><p className="text-sm text-[var(--text-secondary)]">Total Items</p><p className="text-xl font-bold text-primary-600">{items.length}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Total Value</p><p className="text-xl font-bold text-green-600">{formatCurrency(totalValue)}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Available</p><p className="text-xl font-bold text-green-600">{items.filter(i=>i.status==='Available').length}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Assigned</p><p className="text-xl font-bold text-yellow-600">{items.filter(i=>i.status==='Assigned').length}</p></Card>
      </div>
      <Card><h4 className="font-semibold mb-3">By Type</h4><div className="flex gap-2 flex-wrap">{Object.entries(byType).map(([k,v])=><span key={k} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm">{k}: {v}</span>)}</div></Card>
    </div>
  );
};

// ==================== GENERAL REPORT ====================
const GeneralReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  useEffect(() => {
    Promise.all([
      api.get('/school/students'),
      api.get('/school/employees'),
      api.get('/school/inventory'),
      api.get('/school/accounts/summary'),
      api.get('/school/applications'),
    ]).then(([s, e, i, a, ap]) => setData({
      students: s.data.length,
      employees: e.data.length,
      inventory: i.data.length,
      inventoryValue: i.data.reduce((sum, it) => sum + (it.value||0), 0),
      balance: a.data.balance,
      income: a.data.totalIncome,
      expenses: a.data.totalExpense,
      applications: ap.data.length,
      pending: ap.data.filter(x => x.status === 'pending').length,
    })).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner className="py-8" />;

  const handlePrint = () => {
    printContent(`<h2>GENERAL REPORT</h2><p>Date: ${new Date().toLocaleDateString()}</p><table style="width:100%;border-collapse:collapse"><tr><td style="padding:8px;border:1px solid #ddd"><strong>Students</strong></td><td style="padding:8px;border:1px solid #ddd">${data.students}</td></tr><tr><td style="padding:8px;border:1px solid #ddd"><strong>Employees</strong></td><td style="padding:8px;border:1px solid #ddd">${data.employees}</td></tr><tr><td style="padding:8px;border:1px solid #ddd"><strong>Inventory Items</strong></td><td style="padding:8px;border:1px solid #ddd">${data.inventory}</td></tr><tr><td style="padding:8px;border:1px solid #ddd"><strong>Inventory Value</strong></td><td style="padding:8px;border:1px solid #ddd">${formatCurrency(data.inventoryValue)}</td></tr><tr><td style="padding:8px;border:1px solid #ddd"><strong>Income</strong></td><td style="padding:8px;border:1px solid #ddd">${formatCurrency(data.income)}</td></tr><tr><td style="padding:8px;border:1px solid #ddd"><strong>Expenses</strong></td><td style="padding:8px;border:1px solid #ddd">${formatCurrency(data.expenses)}</td></tr><tr><td style="padding:8px;border:1px solid #ddd"><strong>Balance</strong></td><td style="padding:8px;border:1px solid #ddd">${formatCurrency(data.balance)}</td></tr><tr><td style="padding:8px;border:1px solid #ddd"><strong>Applications</strong></td><td style="padding:8px;border:1px solid #ddd">${data.applications} (${data.pending} pending)</td></tr></table>`, 'General_Report', settings);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold">General Report</h3><PrintButton onClick={handlePrint}>Print</PrintButton></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><p className="text-sm text-[var(--text-secondary)]">Students</p><p className="text-xl font-bold text-primary-600">{data.students}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Employees</p><p className="text-xl font-bold text-purple-600">{data.employees}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Inventory</p><p className="text-xl font-bold text-green-600">{formatCurrency(data.inventoryValue)}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Balance</p><p className="text-xl font-bold" style={{color: data.balance>=0?'#059669':'#dc2626'}}>{formatCurrency(data.balance)}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Income</p><p className="text-xl font-bold text-green-600">{formatCurrency(data.income)}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Expenses</p><p className="text-xl font-bold text-red-600">{formatCurrency(data.expenses)}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Applications</p><p className="text-xl font-bold text-primary-600">{data.applications}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Pending</p><p className="text-xl font-bold text-yellow-600">{data.pending}</p></Card>
      </div>
    </div>
  );
};

export { ReportsLayout as default, StudentsReport, FeesReport, EmployeesReport, InventoryReport, GeneralReport };