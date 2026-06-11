// src/pages/public/Register.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import api from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';

const Register = () => {
  const [searchParams] = useSearchParams();
  const planType = searchParams.get('plan') || 'trial';
  const navigate = useNavigate();
  const { register } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [plan, setPlan] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [legalModal, setLegalModal] = useState(null);
  const [legalContent, setLegalContent] = useState('');

  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    password: '',
    phone: '',
  });

  const isTrial = planType === 'trial';
  const isPaid = planType === 'monthly' || planType === 'yearly';

  useEffect(() => {
    if (isPaid) {
      const fetchPlan = async () => {
        try {
          const res = await api.get('/cyber/admin/plans');
          const found = res.data?.find(p => p.type === planType);
          if (found) setPlan(found);
        } catch {}
      };
      fetchPlan();
    }
  }, [planType]);

  const openLegal = async (page) => {
    setLegalModal(page);
    try {
      const res = await api.get(`/cyber/legal/${page}`);
      setLegalContent(res.data.content || 'No content available.');
    } catch {
      setLegalContent('Content not available.');
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError('You must agree to the Terms & Conditions and Privacy Policy');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isTrial) {
        await register(form);
        setSuccess(true);
        setSuccessMessage(`Welcome aboard, ${form.ownerName}! 🚀 Your 14-day free trial is now active.`);
      } else {
        sessionStorage.setItem('checkout_data', JSON.stringify({ ...form, plan: planType }));
        navigate(`/checkout?plan=${planType}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white dark:bg-[#0f172a] flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Welcome to HDM Cyber!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{successMessage}</p>
          <Button onClick={() => navigate('/dashboard')} className="w-full">Go to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-[#0f172a] overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="text-center mb-6">
            <img src="/logo.svg" alt="HDM Cyber" className="w-12 h-12 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isTrial ? 'Start Free Trial' : `Register — ${planType === 'yearly' ? 'Yearly' : 'Monthly'} Plan`}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isTrial ? '14 days free. No credit card required.' : plan ? `KES ${plan.price?.toLocaleString()}/${plan.type}` : 'Complete your registration'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Business Name" name="businessName" value={form.businessName} onChange={handleChange} placeholder="My Cyber Business" required />
            <Input label="Your Name" name="ownerName" value={form.ownerName} onChange={handleChange} placeholder="John Doe" required />
            <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" required />
            <Input label="Phone (optional)" name="phone" value={form.phone} onChange={handleChange} placeholder="0712345678" />

            <div className="flex items-start gap-2">
              <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-1 w-4 h-4 rounded border-[var(--border-color)] text-primary-600 focus:ring-primary-500" id="terms" />
              <label htmlFor="terms" className="text-sm text-gray-500 dark:text-gray-400">
                I agree to the{' '}
                <button type="button" onClick={() => openLegal('terms')} className="text-primary-600 hover:underline">Terms & Conditions</button>
                {' '}and{' '}
                <button type="button" onClick={() => openLegal('privacy')} className="text-primary-600 hover:underline">Privacy Policy</button>
              </label>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : isTrial ? 'Start Free Trial' : 'Continue to Payment'}
            </Button>
          </form>

          <div className="text-center mt-4">
            {isTrial ? (
              <Link to="/pricing" className="text-sm text-primary-600 hover:underline">View all plans →</Link>
            ) : (
              <Link to="/pricing" className="text-sm text-primary-600 hover:underline">← Back to plans</Link>
            )}
          </div>
          <div className="text-center mt-2">
            <button onClick={() => navigate('/')} className="text-sm text-gray-500 dark:text-gray-400 hover:underline">← Back to Home</button>
          </div>
        </Card>
      </div>

      <Modal isOpen={!!legalModal} onClose={() => setLegalModal(null)} title={legalModal === 'privacy' ? 'Privacy Policy' : legalModal === 'refund' ? 'Refund Policy' : 'Terms & Conditions'} size="lg">
        <div className="prose dark:prose-invert max-w-none text-sm text-gray-500 dark:text-gray-400 max-h-[60vh] overflow-y-auto" dangerouslySetInnerHTML={{ __html: legalContent }} />
      </Modal>
    </div>
  );
};

export default Register;