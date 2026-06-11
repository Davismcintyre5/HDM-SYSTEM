// src/pages/public/Register.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import api from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const Register = () => {
  const [form, setForm] = useState({ regNumber: '', name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { portalLogin } = useAuthContext();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate
    if (!form.regNumber || !form.name || !form.email || !form.password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      // Step 1: Register portal user
      const res = await api.post('/school/portal/register', form);
      console.log('Register response:', res.data);

      // Step 2: Login automatically
      try {
        await portalLogin(form.email, form.password);
        setSuccess(true);
      } catch (loginErr) {
        console.log('Auto-login failed, redirecting to login:', loginErr.response?.data);
        setSuccess(true); // Still show success, user can login manually
      }
    } catch (err) {
      console.error('Registration error:', err.response?.data);
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white dark:bg-[#0f172a] flex items-center justify-center p-4">
        <Card className="max-w-sm text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Registration Successful!</h2>
          <p className="text-gray-500 mt-2 mb-6">Your portal account has been created.</p>
          <Button onClick={() => navigate('/portal/dashboard')} className="w-full">Go to Dashboard</Button>
          <button onClick={() => navigate('/login')} className="block mx-auto mt-3 text-sm text-primary-600 hover:underline">Go to Login</button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-[#0f172a] flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <div className="text-center mb-6">
          <img src="/logo.svg" alt="School" className="w-12 h-12 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Register Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Use your registration number</p>
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded text-xs text-blue-700 dark:text-blue-300">
            ⚠️ Your registration number must already exist in the school system. Contact admin if you don't have one.
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Registration Number *" name="regNumber" value={form.regNumber} onChange={handleChange} placeholder="e.g. CS26/001" required />
          <Input label="Full Name *" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Email *" type="email" name="email" value={form.email} onChange={handleChange} required />
          <Input label="Password *" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min 4 characters" required />
          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-2 rounded">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Registering...' : 'Register'}</Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">Already registered? <Link to="/login" className="text-primary-600 hover:underline">Login</Link></p>
        <button onClick={() => navigate('/')} className="block mx-auto mt-3 text-sm text-gray-500 hover:underline">← Back to Home</button>
      </Card>
    </div>
  );
};

export default Register;