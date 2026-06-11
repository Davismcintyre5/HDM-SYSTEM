// src/pages/tenant/Billing.jsx

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { useAuthContext } from '../../context/AuthContext';

const Billing = () => {
  const { user } = useAuthContext();
  const [settings, setSettings] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('stkpush');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [plansRes, settingsRes] = await Promise.all([
          api.get('/cyber/admin/plans'),
          api.get('/cyber/public-settings'),
        ]);
        setPlans(plansRes.data);
        setSettings(settingsRes.data);
        if (settingsRes.data?.paymentMethods?.stkPush) setPaymentMethod('stkpush');
        else if (settingsRes.data?.paymentMethods?.sendMoney) setPaymentMethod('sendmoney');
        else if (settingsRes.data?.paymentMethods?.till) setPaymentMethod('till');
        else if (settingsRes.data?.paymentMethods?.paybill) setPaymentMethod('paybill');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const currentPlan = plans.find(p => p.type === user?.plan) || { name: 'Free Trial', type: 'trial', price: 0 };

  const handlePayment = async () => {
    if (!phoneNumber) return;
    setPayLoading(true);
    setResult(null);
    try {
      const res = await api.post('/cyber/mpesa/stkpush', { phoneNumber, amount: currentPlan.price, reference: `Renew-${currentPlan.type}` });
      setResult(res.data.success ? { success: true, message: 'STK Push sent! Check your phone.' } : { success: false, message: res.data.error });
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || 'Failed' });
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) return <Spinner className="py-12" />;

  const mpesaDetails = settings?.mpesaDetails || {};

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Billing & Subscription</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Current Plan</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Plan</span>
              <Badge variant="info">{currentPlan.name} ({currentPlan.type})</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Price</span>
              <span className="font-bold text-primary-600">KES {currentPlan.price?.toLocaleString()}</span>
            </div>
            {user?.subscriptionEndDate && (
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Expires</span>
                <span className="font-medium text-[var(--text-primary)]">{new Date(user.subscriptionEndDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Make Payment</h3>
          {paymentMethod === 'stkpush' && (
            <div className="space-y-4">
              <Input label="M-Pesa Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="0712345678" />
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 text-center">
                <p className="text-sm text-green-700 dark:text-green-300">Amount: <strong>KES {currentPlan.price?.toLocaleString()}</strong></p>
              </div>
              <Button onClick={handlePayment} disabled={payLoading || !phoneNumber} className="w-full">
                {payLoading ? 'Sending...' : '💳 Pay with M-Pesa'}
              </Button>
            </div>
          )}
          {paymentMethod === 'sendmoney' && (
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 text-sm text-blue-700 dark:text-blue-300">
              <p className="font-semibold mb-2">Send Money Instructions:</p>
              <p>1. Go to M-Pesa → Send Money</p>
              <p>2. Enter: <strong>{mpesaDetails.sendMoneyNumber || 'N/A'}</strong></p>
              <p>3. Amount: <strong>KES {currentPlan.price?.toLocaleString()}</strong></p>
            </div>
          )}
          {paymentMethod === 'till' && (
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 text-sm text-blue-700 dark:text-blue-300">
              <p className="font-semibold mb-2">Till Number:</p>
              <p>1. M-Pesa → Lipa na M-Pesa → Buy Goods</p>
              <p>2. Till: <strong>{mpesaDetails.tillNumber || 'N/A'}</strong></p>
              <p>3. Amount: <strong>KES {currentPlan.price?.toLocaleString()}</strong></p>
            </div>
          )}
          {paymentMethod === 'paybill' && (
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 text-sm text-blue-700 dark:text-blue-300">
              <p className="font-semibold mb-2">Paybill:</p>
              <p>1. M-Pesa → Lipa na M-Pesa → Paybill</p>
              <p>2. Business: <strong>{mpesaDetails.paybillNumber || 'N/A'}</strong></p>
              <p>3. Account: <strong>{user?.businessName || 'N/A'}</strong></p>
              <p>4. Amount: <strong>KES {currentPlan.price?.toLocaleString()}</strong></p>
            </div>
          )}
          {result && (
            <div className={`mt-3 p-3 rounded-lg text-sm ${result.success ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'}`}>
              {result.message}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Billing;