// src/pages/public/Checkout.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const planType = searchParams.get('plan') || 'monthly';
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [checkoutData, setCheckoutData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [mpesaLoading, setMpesaLoading] = useState(false);
  const [confirmedPaid, setConfirmedPaid] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem('checkout_data');
    if (data) {
      setCheckoutData(JSON.parse(data));
    } else {
      navigate('/pricing', { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        const [plansRes, settingsRes] = await Promise.all([
          api.get('/cyber/admin/plans'),
          api.get('/cyber/public-settings'),
        ]);
        const found = plansRes.data?.find(p => p.type === planType);
        setPlan(found || { name: planType === 'yearly' ? 'Yearly' : 'Monthly', type: planType, price: planType === 'yearly' ? 15000 : 1500 });
        setSettings(settingsRes.data);
      } catch {
        setPlan({ name: planType === 'yearly' ? 'Yearly' : 'Monthly', type: planType, price: planType === 'yearly' ? 15000 : 1500 });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [planType, navigate]);

  const handleMpesaPush = async () => {
    if (!phoneNumber) return;
    setMpesaLoading(true);
    setResult(null);
    try {
      const res = await api.post('/cyber/mpesa/stkpush', { phoneNumber, amount: plan?.price, reference: `Cyber-${planType}` });
      setResult(res.data.success
        ? { success: true, message: 'STK Push sent! Check your phone and enter your PIN to complete payment.' }
        : { success: false, message: res.data.error || 'STK Push failed. Try again.' });
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || 'Payment failed' });
    } finally {
      setMpesaLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!checkoutData) return;
    setProcessing(true);
    setResult(null);
    try {
      await api.post('/cyber/tenant/auth/register-paid', { ...checkoutData, plan: planType });
      sessionStorage.removeItem('checkout_data');
      setResult({ success: true, message: 'Registration submitted! Check your email. You will be notified once your account is approved.', redirect: true });
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || 'Registration failed' });
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem('checkout_data');
    navigate('/pricing', { replace: true });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white dark:bg-[#0f172a] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (result?.redirect) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white dark:bg-[#0f172a] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Registration Submitted!</h2>
          <p className="text-[var(--text-secondary)] mb-6">{result.message}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => navigate('/')}>Back to Home</Button>
            <Button onClick={() => navigate('/login')}>Go to Login</Button>
          </div>
        </Card>
      </div>
    );
  }

  const mpesaDetails = settings?.mpesaDetails || {};
  const paymentMethods = settings?.paymentMethods || {};

  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-[#0f172a] overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-4 pt-8 pb-20">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center">
            <img src="/logo.svg" alt="HDM Cyber" className="w-12 h-12 mx-auto mb-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Complete Your Subscription</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Choose a payment method to activate your account</p>
          </div>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">📋 Order Summary</h3>
            <div className="space-y-3">
              {checkoutData && (
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Business</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate ml-4">{checkoutData.businessName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Owner</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{checkoutData.ownerName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Email</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate ml-4">{checkoutData.email}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center py-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Plan</span>
                <Badge variant="info">{plan?.name} ({plan?.type})</Badge>
              </div>
              <div className="flex justify-between items-center py-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Total</span>
                <span className="text-2xl font-bold text-primary-600">KES {plan?.price?.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">💳 Payment Method</h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {paymentMethods.stkPush && (
                <button onClick={() => { setSelectedMethod('stkpush'); setPaymentMethod('stkpush'); setResult(null); setConfirmedPaid(false); }}
                  className={`p-3 rounded-lg border-2 transition-colors text-center ${selectedMethod === 'stkpush' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-gray-200 dark:border-gray-700'}`}>
                  <span className="text-xl block">📱</span><span className="text-xs font-medium text-gray-900 dark:text-gray-100">STK Push</span>
                </button>
              )}
              {paymentMethods.sendMoney && (
                <button onClick={() => { setSelectedMethod('sendmoney'); setPaymentMethod('sendmoney'); setResult(null); setConfirmedPaid(false); }}
                  className={`p-3 rounded-lg border-2 transition-colors text-center ${selectedMethod === 'sendmoney' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-gray-200 dark:border-gray-700'}`}>
                  <span className="text-xl block">💸</span><span className="text-xs font-medium text-gray-900 dark:text-gray-100">Send Money</span>
                </button>
              )}
              {paymentMethods.till && (
                <button onClick={() => { setSelectedMethod('till'); setPaymentMethod('till'); setResult(null); setConfirmedPaid(false); }}
                  className={`p-3 rounded-lg border-2 transition-colors text-center ${selectedMethod === 'till' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-gray-200 dark:border-gray-700'}`}>
                  <span className="text-xl block">🏪</span><span className="text-xs font-medium text-gray-900 dark:text-gray-100">Till Number</span>
                </button>
              )}
              {paymentMethods.paybill && (
                <button onClick={() => { setSelectedMethod('paybill'); setPaymentMethod('paybill'); setResult(null); setConfirmedPaid(false); }}
                  className={`p-3 rounded-lg border-2 transition-colors text-center ${selectedMethod === 'paybill' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-gray-200 dark:border-gray-700'}`}>
                  <span className="text-xl block">🏦</span><span className="text-xs font-medium text-gray-900 dark:text-gray-100">Paybill</span>
                </button>
              )}
            </div>

            {selectedMethod && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                {selectedMethod === 'stkpush' && (
                  <>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Enter your M-Pesa phone number to receive a payment prompt.</p>
                    <Input label="M-Pesa Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="0712345678" />
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 text-center">
                      <p className="text-sm text-green-700 dark:text-green-300">Amount: <strong>KES {plan?.price?.toLocaleString()}</strong></p>
                    </div>
                    <Button onClick={handleMpesaPush} disabled={mpesaLoading || !phoneNumber} className="w-full">
                      {mpesaLoading ? 'Sending...' : '📱 Send STK Push'}
                    </Button>
                  </>
                )}

                {selectedMethod === 'sendmoney' && (
                  <>
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                      <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">📋 Steps:</h4>
                      <ol className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                        <li>1. Go to <strong>M-Pesa</strong> → <strong>Send Money</strong></li>
                        <li>2. Enter number: <strong className="text-lg">{mpesaDetails.sendMoneyNumber || '07XX XXX XXX'}</strong></li>
                        <li>3. Enter amount: <strong className="text-lg">KES {plan?.price?.toLocaleString()}</strong></li>
                        <li>4. Enter PIN and confirm</li>
                      </ol>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100 cursor-pointer">
                      <input type="checkbox" checked={confirmedPaid} onChange={(e) => setConfirmedPaid(e.target.checked)} className="w-4 h-4 rounded" />
                      I have completed the payment
                    </label>
                  </>
                )}

                {selectedMethod === 'till' && (
                  <>
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                      <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">📋 Steps:</h4>
                      <ol className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                        <li>1. Go to <strong>M-Pesa</strong> → <strong>Lipa na M-Pesa</strong> → <strong>Buy Goods</strong></li>
                        <li>2. Enter Till: <strong className="text-lg">{mpesaDetails.tillNumber || '000000'}</strong></li>
                        <li>3. Enter amount: <strong className="text-lg">KES {plan?.price?.toLocaleString()}</strong></li>
                        <li>4. Enter PIN and confirm</li>
                      </ol>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100 cursor-pointer">
                      <input type="checkbox" checked={confirmedPaid} onChange={(e) => setConfirmedPaid(e.target.checked)} className="w-4 h-4 rounded" />
                      I have completed the payment
                    </label>
                  </>
                )}

                {selectedMethod === 'paybill' && (
                  <>
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                      <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">📋 Steps:</h4>
                      <ol className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                        <li>1. Go to <strong>M-Pesa</strong> → <strong>Lipa na M-Pesa</strong> → <strong>Paybill</strong></li>
                        <li>2. Business Number: <strong className="text-lg">{mpesaDetails.paybillNumber || '000000'}</strong></li>
                        <li>3. Account Number: <strong>{checkoutData?.businessName || 'Your Name'}</strong></li>
                        <li>4. Amount: <strong className="text-lg">KES {plan?.price?.toLocaleString()}</strong></li>
                        <li>5. Enter PIN and confirm</li>
                      </ol>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100 cursor-pointer">
                      <input type="checkbox" checked={confirmedPaid} onChange={(e) => setConfirmedPaid(e.target.checked)} className="w-4 h-4 rounded" />
                      I have completed the payment
                    </label>
                  </>
                )}

                {result && (
                  <div className={`p-3 rounded-lg text-sm ${result.success ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'}`}>
                    {result.message}
                  </div>
                )}
              </div>
            )}
          </Card>

          <Button onClick={handleCreateAccount} disabled={processing || (!confirmedPaid && selectedMethod !== 'stkpush')} className="w-full" size="lg">
            {processing ? 'Creating Account...' : '✅ I Have Paid — Create My Account'}
          </Button>

          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pb-8">
            <Link to="/legal/refund" target="_blank" className="hover:underline">Refund Policy</Link>
            <button onClick={handleCancel} className="hover:underline">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;