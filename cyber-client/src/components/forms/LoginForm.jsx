// src/components/forms/LoginForm.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';

const LoginForm = ({ onSubmit, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
      <p className="text-center text-sm text-[var(--text-secondary)]">
        Don't have an account? <Link to="/register" className="text-primary-600 hover:underline">Register</Link>
      </p>
    </form>
  );
};

export default LoginForm;