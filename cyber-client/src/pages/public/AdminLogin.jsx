// src/pages/public/AdminLogin.jsx

import { useState } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const AdminLogin = ({ onLogin, onClose, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await onLogin(email, password);
    setLoading(false);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[var(--bg-primary)] rounded-xl shadow-2xl w-full max-w-sm p-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <span className="text-2xl">🔐</span>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Admin Access</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Verifying...' : 'Login'}</Button>
        </form>

        <button onClick={onClose} className="mt-4 w-full text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Cancel</button>
      </div>
    </div>
  );
};

export default AdminLogin;