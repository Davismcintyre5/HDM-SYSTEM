// src/pages/portal/Payments.jsx

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../../components/ui/Card';

const Payments = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/school/portal/profile')
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!data) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  const { feeSummary } = data;

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Payment History</h1>
      <Card className="mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><p className="text-sm text-[var(--text-secondary)]">Total Fee</p><p className="text-xl font-bold mt-1">KES {feeSummary?.totalFee?.toLocaleString()}</p></div>
          <div><p className="text-sm text-[var(--text-secondary)]">Paid</p><p className="text-xl font-bold text-green-600 mt-1">KES {feeSummary?.totalPaid?.toLocaleString()}</p></div>
          <div><p className="text-sm text-[var(--text-secondary)]">Balance</p><p className="text-xl font-bold text-red-600 mt-1">KES {feeSummary?.balance?.toLocaleString()}</p></div>
        </div>
      </Card>
      <Card padding={false}>
        <h3 className="font-semibold p-4 pb-2">All Payments</h3>
        {feeSummary?.payments?.length > 0 ? (
          <table className="w-full"><thead><tr className="border-b border-[var(--border-color)]"><th className="p-3 text-xs uppercase text-left">Date</th><th className="p-3 text-xs uppercase text-left">Amount</th><th className="p-3 text-xs uppercase text-left hidden sm:table-cell">Balance</th></tr></thead><tbody>{feeSummary.payments.map((p,i)=>(<tr key={i} className="border-b border-[var(--border-color)]"><td className="p-3 text-sm">{new Date(p.date).toLocaleDateString()}</td><td className="p-3 text-sm font-semibold text-green-600">KES {p.amount?.toLocaleString()}</td><td className="p-3 text-sm hidden sm:table-cell">KES {p.balanceAfter?.toLocaleString()}</td></tr>))}</tbody></table>
        ) : <p className="text-center py-8 text-[var(--text-secondary)]">No payments yet.</p>}
      </Card>
    </div>
  );
};

export default Payments;