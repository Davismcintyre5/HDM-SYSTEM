// src/pages/admin/AdminLogin.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-[#0f172a] flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">Staff access only</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
        </form>
        <button onClick={() => navigate('/')} className="block mx-auto mt-4 text-sm text-gray-500 hover:underline">← Back to Home</button>
      </Card>
    </div>
  );
};

export default AdminLogin;