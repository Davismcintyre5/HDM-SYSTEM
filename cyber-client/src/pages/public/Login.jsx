// src/pages/public/Login.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import LoginForm from '../../components/forms/LoginForm';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-[#0f172a] overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="text-center mb-6">
            <img src="/logo.svg" alt="HDM Cyber" className="w-12 h-12 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome Back</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Login to your account</p>
          </div>
          <LoginForm onSubmit={handleSubmit} loading={loading} error={error} />
          <div className="text-center mt-4">
            <Link to="/pricing" className="text-sm text-primary-600 hover:underline">
              Don't have an account? View plans →
            </Link>
          </div>
          <div className="text-center mt-3">
            <button onClick={() => navigate('/')} className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
              ← Back to Home
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;