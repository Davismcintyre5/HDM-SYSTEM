// src/pages/admin/Transactions.jsx

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/shared/EmptyState';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/cyber/admin/transactions');
        setTransactions(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Spinner className="py-12" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Transactions</h1>
      <Card padding={false}>
        {transactions.length === 0 ? (
          <EmptyState icon="💳" title="No transactions" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-left">
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Tenant</th>
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Description</th>
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Amount</th>
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Type</th>
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Status</th>
                  <th className="p-3 text-xs font-medium text-[var(--text-secondary)] uppercase hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]">
                    <td className="p-3 text-sm text-[var(--text-primary)]">{tx.tenantId?.businessName || 'N/A'}</td>
                    <td className="p-3 text-sm text-[var(--text-secondary)]">{tx.description}</td>
                    <td className="p-3 text-sm font-semibold text-green-600">KES {tx.amount?.toLocaleString()}</td>
                    <td className="p-3"><Badge variant="info">{tx.type}</Badge></td>
                    <td className="p-3"><Badge variant={tx.status === 'completed' ? 'success' : 'warning'}>{tx.status}</Badge></td>
                    <td className="p-3 text-sm text-[var(--text-secondary)] hidden md:table-cell">{new Date(tx.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Transactions;