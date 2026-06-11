// src/pages/public/Login.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { portalLogin } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await portalLogin(email, password);
      navigate('/portal/dashboard');
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
          <img src="/logo.svg" alt="School" className="w-12 h-12 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Student Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Login to your portal account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
        </form>
        <div className="text-center mt-4 space-y-2">
          <p className="text-sm text-gray-500">Don't have an account? <Link to="/register" className="text-primary-600 hover:underline">Register</Link></p>
          <Link to="/admin/login" className="block text-sm text-gray-400 hover:text-gray-500 hover:underline">🔐 Admin Access</Link>
        </div>
        <button onClick={() => navigate('/')} className="block mx-auto mt-3 text-sm text-gray-500 hover:underline">← Back to Home</button>
      </Card>
    </div>
  );
};

export default Login;