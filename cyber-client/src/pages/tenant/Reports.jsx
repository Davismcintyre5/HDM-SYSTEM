// src/pages/tenant/Reports.jsx

import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useOutletContext } from 'react-router-dom';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { printDocument } from '../../utils/print';

const tabs = [
  { to: '/reports/transactions', label: '💳 Transactions' },
  { to: '/reports/inventory', label: '📦 Inventory' },
  { to: '/reports/profit-loss', label: '📊 Profit & Loss' },
  { to: '/reports/general', label: '📋 General' },
];

const ReportsLayout = () => {
  const location = useLocation();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/cyber/tenant/settings').then(res => setSettings(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Reports</h1>

      <div className="flex gap-1 mb-6 border-b border-[var(--border-color)] overflow-x-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end
            className={({ isActive }) =>
              `px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive ? 'border-primary-600 text-primary-600' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Outlet context={{ settings }} />
    </div>
  );
};

// ==================== TRANSACTIONS REPORT ====================
const TransactionsReport = () => {
  const { settings } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/cyber/tenant/transactions').then(res => setData(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner className="py-8" />;

  const completed = data?.filter(t => t.status === 'completed') || [];
  const pending = data?.filter(t => t.status === 'pending') || [];
  const totalCompleted = completed.reduce((s, t) => s + t.amount, 0);
  const totalPending = pending.reduce((s, t) => s + t.amount, 0);

  const handlePrint = () => {
    printDocument({
      title: 'Transaction Report',
      headHTML: `
        <div style="text-align:center;">
          <h2 style="color:#2563eb;margin:0;">${settings?.businessName || 'My Business'}</h2>
          ${settings?.address ? `<p style="margin:2px 0;font-size:12px;color:#666;">📍 ${settings?.address}</p>` : ''}
          ${settings?.phone ? `<p style="margin:2px 0;font-size:12px;color:#666;">📞 ${settings?.phone}</p>` : ''}
          <div style="border-top:2px solid #2563eb;margin:10px 0;"></div>
          <h1 style="font-size:22px;letter-spacing:3px;color:#333;margin:8px 0;">TRANSACTION REPORT</h1>
          <div style="border-bottom:1px solid #ccc;margin:8px 0;"></div>
        </div>
      `,
      content: `
        <div style="font-size:13px;">
          <p style="margin-bottom:10px;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <table style="width:100%;border-collapse:collapse;margin:10px 0;">
            <tr style="background:#f0f4ff;"><th style="text-align:left;padding:6px;font-size:11px;">DESCRIPTION</th><th style="text-align:right;padding:6px;font-size:11px;">AMOUNT</th><th style="text-align:center;padding:6px;font-size:11px;">STATUS</th><th style="text-align:right;padding:6px;font-size:11px;">DATE</th></tr>
            ${[...completed, ...pending].map(t => `<tr><td style="padding:6px;">${t.description}</td><td style="text-align:right;padding:6px;">KES ${t.amount?.toLocaleString()}</td><td style="text-align:center;padding:6px;">${t.status}</td><td style="text-align:right;padding:6px;">${new Date(t.date).toLocaleDateString()}</td></tr>`).join('')}
          </table>
          <div style="border-top:2px solid #333;padding-top:8px;margin-top:10px;">
            <table style="width:100%;">
              <tr><td style="padding:3px;">Completed</td><td style="text-align:right;font-weight:bold;padding:3px;">${completed.length} — KES ${totalCompleted.toLocaleString()}</td></tr>
              <tr><td style="padding:3px;">Pending</td><td style="text-align:right;padding:3px;">${pending.length} — KES ${totalPending.toLocaleString()}</td></tr>
              <tr><td style="font-size:14px;font-weight:bold;padding:3px;">TOTAL</td><td style="text-align:right;font-size:16px;font-weight:bold;color:#2563eb;padding:3px;">KES ${(totalCompleted + totalPending).toLocaleString()}</td></tr>
            </table>
          </div>
        </div>
      `,
      footerHTML: `<p style="font-size:10px;color:#999;">Printed: ${new Date().toLocaleString()}</p>`,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Transaction Report</h3>
        <Button size="sm" variant="secondary" onClick={handlePrint}>🖨️ Print</Button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card><p className="text-sm text-[var(--text-secondary)]">Completed</p><p className="text-lg font-bold text-green-600">KES {totalCompleted.toLocaleString()}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Pending</p><p className="text-lg font-bold text-yellow-600">KES {totalPending.toLocaleString()}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Total</p><p className="text-lg font-bold text-primary-600">KES {(totalCompleted + totalPending).toLocaleString()}</p></Card>
      </div>
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-[var(--border-color)] text-left"><th className="p-3 text-xs uppercase">Description</th><th className="p-3 text-xs uppercase">Amount</th><th className="p-3 text-xs uppercase">Status</th><th className="p-3 text-xs uppercase hidden md:table-cell">Date</th></tr></thead>
            <tbody>
              {[...completed, ...pending].slice(0, 20).map(t => (
                <tr key={t._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]">
                  <td className="p-3 text-sm truncate max-w-[200px]">{t.description}</td>
                  <td className="p-3 text-sm font-semibold text-green-600">KES {t.amount?.toLocaleString()}</td>
                  <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${t.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{t.status}</span></td>
                  <td className="p-3 text-sm text-[var(--text-secondary)] hidden md:table-cell">{new Date(t.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ==================== INVENTORY REPORT ====================
const InventoryReport = () => {
  const { settings } = useOutletContext();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/cyber/tenant/inventory').then(res => setItems(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner className="py-8" />;

  const totalValue = items.reduce((s, i) => s + (i.value || 0) * (i.quantity || 1), 0);

  const handlePrint = () => {
    printDocument({
      title: 'Inventory Report',
      headHTML: `
        <div style="text-align:center;">
          <h2 style="color:#2563eb;margin:0;">${settings?.businessName || 'My Business'}</h2>
          ${settings?.address ? `<p style="margin:2px 0;font-size:12px;color:#666;">📍 ${settings?.address}</p>` : ''}
          <div style="border-top:2px solid #2563eb;margin:10px 0;"></div>
          <h1 style="font-size:22px;letter-spacing:3px;color:#333;margin:8px 0;">INVENTORY REPORT</h1>
          <div style="border-bottom:1px solid #ccc;margin:8px 0;"></div>
        </div>
      `,
      content: `
        <div style="font-size:13px;">
          <p style="margin-bottom:10px;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <table style="width:100%;border-collapse:collapse;margin:10px 0;">
            <tr style="background:#f0f4ff;"><th style="text-align:left;padding:6px;font-size:11px;">ITEM</th><th style="text-align:center;padding:6px;font-size:11px;">QTY</th><th style="text-align:right;padding:6px;font-size:11px;">VALUE</th><th style="text-align:right;padding:6px;font-size:11px;">TOTAL</th><th style="text-align:center;padding:6px;font-size:11px;">STATUS</th></tr>
            ${items.map(i => `<tr><td style="padding:6px;">${i.name} <span style="color:#666;font-size:11px;">(${i.type || 'N/A'})</span></td><td style="text-align:center;padding:6px;">${i.quantity || 1}</td><td style="text-align:right;padding:6px;">KES ${(i.value || 0).toLocaleString()}</td><td style="text-align:right;padding:6px;">KES ${((i.value || 0) * (i.quantity || 1)).toLocaleString()}</td><td style="text-align:center;padding:6px;">${i.status || 'Available'}</td></tr>`).join('')}
          </table>
          <div style="border-top:2px solid #333;padding-top:8px;margin-top:10px;">
            <table style="width:100%;">
              <tr><td style="padding:3px;">Total Items</td><td style="text-align:right;font-weight:bold;padding:3px;">${items.length}</td></tr>
              <tr><td style="font-size:14px;font-weight:bold;padding:3px;">Total Value</td><td style="text-align:right;font-size:16px;font-weight:bold;color:#2563eb;padding:3px;">KES ${totalValue.toLocaleString()}</td></tr>
            </table>
          </div>
        </div>
      `,
      footerHTML: `<p style="font-size:10px;color:#999;">Printed: ${new Date().toLocaleString()}</p>`,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Inventory Report</h3>
        <Button size="sm" variant="secondary" onClick={handlePrint}>🖨️ Print</Button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card><p className="text-sm text-[var(--text-secondary)]">Total Items</p><p className="text-lg font-bold text-primary-600">{items.length}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Total Value</p><p className="text-lg font-bold text-green-600">KES {totalValue.toLocaleString()}</p></Card>
      </div>
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-[var(--border-color)]"><th className="p-3 text-xs uppercase">Item</th><th className="p-3 text-xs uppercase">Qty</th><th className="p-3 text-xs uppercase">Value</th><th className="p-3 text-xs uppercase">Total</th><th className="p-3 text-xs uppercase hidden sm:table-cell">Status</th></tr></thead>
            <tbody>{items.map(i => (
              <tr key={i._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]">
                <td className="p-3 text-sm"><p className="font-medium">{i.name}</p><p className="text-xs text-[var(--text-secondary)]">{i.type}</p></td>
                <td className="p-3 text-sm">{i.quantity || 1}</td><td className="p-3 text-sm">KES {(i.value || 0).toLocaleString()}</td>
                <td className="p-3 text-sm font-semibold text-green-600">KES {((i.value || 0) * (i.quantity || 1)).toLocaleString()}</td>
                <td className="p-3 text-sm hidden sm:table-cell">{i.status || 'Available'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ==================== PROFIT & LOSS ====================
const ProfitLossReport = () => {
  const { settings } = useOutletContext();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/cyber/tenant/accounts').then(res => setAccounts(res.data.accounts || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner className="py-8" />;

  const income = accounts.filter(a => a.type === 'in');
  const expenses = accounts.filter(a => a.type === 'out');
  const totalIncome = income.reduce((s, a) => s + a.amount, 0);
  const totalExpenses = expenses.reduce((s, a) => s + a.amount, 0);
  const profit = totalIncome - totalExpenses;

  const handlePrint = () => {
    printDocument({
      title: 'Profit & Loss Report',
      headHTML: `
        <div style="text-align:center;">
          <h2 style="color:#2563eb;margin:0;">${settings?.businessName || 'My Business'}</h2>
          ${settings?.address ? `<p style="margin:2px 0;font-size:12px;color:#666;">📍 ${settings?.address}</p>` : ''}
          <div style="border-top:2px solid #2563eb;margin:10px 0;"></div>
          <h1 style="font-size:22px;letter-spacing:3px;color:#333;margin:8px 0;">PROFIT & LOSS</h1>
          <div style="border-bottom:1px solid #ccc;margin:8px 0;"></div>
        </div>
      `,
      content: `
        <div style="font-size:13px;">
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <h4 style="color:#059669;margin:10px 0 5px;">INCOME</h4>
          <table style="width:100%;border-collapse:collapse;">${income.map(a => `<tr><td style="padding:4px;">${a.description}</td><td style="text-align:right;padding:4px;color:#059669;">KES ${a.amount?.toLocaleString()}</td></tr>`).join('')}</table>
          <h4 style="color:#dc2626;margin:10px 0 5px;">EXPENSES</h4>
          <table style="width:100%;border-collapse:collapse;">${expenses.map(a => `<tr><td style="padding:4px;">${a.description}</td><td style="text-align:right;padding:4px;color:#dc2626;">KES ${a.amount?.toLocaleString()}</td></tr>`).join('')}</table>
          <div style="border-top:2px solid #333;padding-top:8px;margin-top:10px;">
            <table style="width:100%;">
              <tr><td>Total Income</td><td style="text-align:right;">KES ${totalIncome.toLocaleString()}</td></tr>
              <tr><td>Total Expenses</td><td style="text-align:right;">KES ${totalExpenses.toLocaleString()}</td></tr>
              <tr><td style="font-size:16px;font-weight:bold;color:${profit >= 0 ? '#059669' : '#dc2626'};">${profit >= 0 ? 'PROFIT' : 'LOSS'}</td><td style="text-align:right;font-size:18px;font-weight:bold;color:${profit >= 0 ? '#059669' : '#dc2626'};">KES ${Math.abs(profit).toLocaleString()}</td></tr>
            </table>
          </div>
        </div>
      `,
      footerHTML: `<p style="font-size:10px;color:#999;">Printed: ${new Date().toLocaleString()}</p>`,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Profit & Loss</h3>
        <Button size="sm" variant="secondary" onClick={handlePrint}>🖨️ Print</Button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card><p className="text-sm text-[var(--text-secondary)]">Income</p><p className="text-lg font-bold text-green-600">KES {totalIncome.toLocaleString()}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Expenses</p><p className="text-lg font-bold text-red-600">KES {totalExpenses.toLocaleString()}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">{profit >= 0 ? 'Profit' : 'Loss'}</p><p className={`text-lg font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>KES {Math.abs(profit).toLocaleString()}</p></Card>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card><h4 className="font-semibold text-green-600 mb-3">Income</h4><div className="space-y-2 max-h-80 overflow-y-auto">{income.map(a => <div key={a._id} className="flex justify-between text-sm border-b pb-2"><span>{a.description}</span><span className="font-semibold text-green-600">KES {a.amount?.toLocaleString()}</span></div>)}</div></Card>
        <Card><h4 className="font-semibold text-red-600 mb-3">Expenses</h4><div className="space-y-2 max-h-80 overflow-y-auto">{expenses.map(a => <div key={a._id} className="flex justify-between text-sm border-b pb-2"><span>{a.description}</span><span className="font-semibold text-red-600">KES {a.amount?.toLocaleString()}</span></div>)}</div></Card>
      </div>
    </div>
  );
};

// ==================== GENERAL REPORT ====================
const GeneralReport = () => {
  const { settings } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/cyber/tenant/transactions'),
      api.get('/cyber/tenant/inventory'),
      api.get('/cyber/tenant/accounts'),
      api.get('/cyber/tenant/services'),
    ]).then(([tx, inv, acc, svc]) => {
      setData({ transactions: tx.data, inventory: inv.data, accounts: acc.data.accounts || [], services: svc.data });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner className="py-8" />;

  const txTotal = data.transactions.filter(t => t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const invTotal = data.inventory.reduce((s, i) => s + (i.value || 0) * (i.quantity || 1), 0);
  const incTotal = data.accounts.filter(a => a.type === 'in').reduce((s, a) => s + a.amount, 0);

  const handlePrint = () => {
    printDocument({
      title: 'General Report',
      headHTML: `
        <div style="text-align:center;">
          <h2 style="color:#2563eb;margin:0;">${settings?.businessName || 'My Business'}</h2>
          ${settings?.address ? `<p style="margin:2px 0;font-size:12px;color:#666;">📍 ${settings?.address}</p>` : ''}
          <div style="border-top:2px solid #2563eb;margin:10px 0;"></div>
          <h1 style="font-size:22px;letter-spacing:3px;color:#333;margin:8px 0;">GENERAL REPORT</h1>
          <div style="border-bottom:1px solid #ccc;margin:8px 0;"></div>
        </div>
      `,
      content: `
        <div style="font-size:13px;">
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr style="border-bottom:1px solid #eee;"><td style="padding:8px;">Services</td><td style="text-align:right;font-weight:bold;padding:8px;">${data.services.length}</td></tr>
            <tr style="border-bottom:1px solid #eee;"><td style="padding:8px;">Inventory Items</td><td style="text-align:right;font-weight:bold;padding:8px;">${data.inventory.length}</td></tr>
            <tr style="border-bottom:1px solid #eee;"><td style="padding:8px;">Completed Transactions</td><td style="text-align:right;font-weight:bold;padding:8px;">KES ${txTotal.toLocaleString()}</td></tr>
            <tr style="border-bottom:1px solid #eee;"><td style="padding:8px;">Inventory Value</td><td style="text-align:right;font-weight:bold;padding:8px;">KES ${invTotal.toLocaleString()}</td></tr>
            <tr><td style="padding:8px;font-size:14px;font-weight:bold;">Total Income</td><td style="text-align:right;font-size:16px;font-weight:bold;color:#2563eb;padding:8px;">KES ${incTotal.toLocaleString()}</td></tr>
          </table>
        </div>
      `,
      footerHTML: `<p style="font-size:10px;color:#999;">Printed: ${new Date().toLocaleString()}</p>`,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">General Report</h3>
        <Button size="sm" variant="secondary" onClick={handlePrint}>🖨️ Print</Button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card><p className="text-sm text-[var(--text-secondary)]">Services</p><p className="text-lg font-bold text-primary-600">{data.services.length}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Inventory</p><p className="text-lg font-bold text-purple-600">{data.inventory.length}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Transactions</p><p className="text-lg font-bold text-green-600">KES {txTotal.toLocaleString()}</p></Card>
        <Card><p className="text-sm text-[var(--text-secondary)]">Income</p><p className="text-lg font-bold text-green-600">KES {incTotal.toLocaleString()}</p></Card>
      </div>
    </div>
  );
};

export { ReportsLayout as default, TransactionsReport, InventoryReport, ProfitLossReport, GeneralReport };