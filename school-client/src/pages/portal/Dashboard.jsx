// src/pages/portal/Dashboard.jsx

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../../components/ui/Card';

const PortalDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/school/portal/profile')
      .then(res => {
        console.log('Data loaded:', res.data);
        setData(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data || !data.portalUser) {
    return (
      <div className="text-center py-20 text-[var(--text-secondary)]">
        <p className="text-4xl mb-2">😕</p>
        <p>No profile data available.</p>
        <p className="text-xs mt-2">Please contact the administrator.</p>
      </div>
    );
  }

  const { portalUser, userData, feeSummary } = data;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Welcome, {portalUser.name}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <Card className="text-center">
          <p className="text-sm text-[var(--text-secondary)]">Reg Number</p>
          <p className="text-lg font-bold text-primary-600 mt-1">{portalUser.regNumber}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-[var(--text-secondary)]">Course</p>
          <p className="text-lg font-bold text-primary-600 mt-1">{userData?.course || 'N/A'}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-[var(--text-secondary)]">Status</p>
          <p className="text-lg font-bold text-green-600 mt-1 capitalize">{userData?.status || 'Active'}</p>
        </Card>
      </div>

      {feeSummary && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Fee Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Total Fee</p>
              <p className="text-xl font-bold mt-1">KES {feeSummary.totalFee?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Paid</p>
              <p className="text-xl font-bold text-green-600 mt-1">KES {feeSummary.totalPaid?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Balance</p>
              <p className="text-xl font-bold text-red-600 mt-1">KES {feeSummary.balance?.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PortalDashboard;