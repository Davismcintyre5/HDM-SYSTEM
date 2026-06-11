// src/pages/public/Landing.jsx

import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useSettings } from '../../hooks/useSettings';
import Button from '../../components/ui/Button';

const features = [
  { icon: '💻', title: 'Service Management', desc: 'Track all your cyber services with pricing and categories.' },
  { icon: '💰', title: 'Financial Accounts', desc: 'Record income and expenses. Know your balance at a glance.' },
  { icon: '📦', title: 'Inventory Tracking', desc: 'Manage stock, track values, and never lose sight of your assets.' },
  { icon: '📈', title: 'Smart Reports', desc: 'Monthly summaries, trends, and insights for your business.' },
  { icon: '💳', title: 'M-Pesa Integration', desc: 'Accept payments via STK Push, Till, Paybill, and Send Money.' },
  { icon: '🗄️', title: 'Automated Backups', desc: 'Schedule backups and get them emailed. Your data is safe.' },
];

const Landing = () => {
  const { user } = useAuthContext();
  const { isAdmin } = useAdminAuth();
  const { settings } = useSettings();
  const isLoggedIn = user || isAdmin;
  const siteName = settings?.siteName || 'HDM Cyber';

  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Manage Your Cyber Business<br /><span className="text-primary-200">Like a Pro</span>
          </h1>
          <p className="mt-6 text-lg text-primary-100 max-w-2xl mx-auto">
            Track services, accounts, inventory, and transactions — all in one platform. Start with a 14-day free trial.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {isLoggedIn ? (
              <Link to={isAdmin ? '/admin/dashboard' : '/dashboard'}>
                <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100">Launch Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white border-none">Start Free Trial</Button>
                </Link>
                <Link to="/pricing">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-primary-700">View Pricing</Button>
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
      </section>

      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">Everything You Need</h2>
            <p className="mt-4 text-[var(--text-secondary)] max-w-xl mx-auto">Powerful tools to run your cyber business efficiently.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card hover:shadow-lg transition-shadow">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mt-3">{f.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-2">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[var(--bg-secondary)]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-12">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xl font-bold text-primary-600">1</div>
              <h3 className="font-semibold text-[var(--text-primary)]">Create Account</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-2">Sign up in seconds. Start with a free 14-day trial.</p>
            </div>
            <div>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xl font-bold text-primary-600">2</div>
              <h3 className="font-semibold text-[var(--text-primary)]">Set Up Services</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-2">Add your cyber services, prices, and inventory.</p>
            </div>
            <div>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xl font-bold text-primary-600">3</div>
              <h3 className="font-semibold text-[var(--text-primary)]">Start Earning</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-2">Track sales, manage accounts, and grow your business.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">
            {isLoggedIn ? 'Ready to Manage Your Business?' : 'Ready to Get Started?'}
          </h2>
          <p className="mt-4 text-[var(--text-secondary)]">
            {isLoggedIn ? 'Jump back into your dashboard.' : `Join hundreds of cyber businesses already using ${siteName}.`}
          </p>
          <div className="mt-8">
            {isLoggedIn ? (
              <Link to={isAdmin ? '/admin/dashboard' : '/dashboard'}>
                <Button size="lg">Launch Dashboard</Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button size="lg">Start Free Trial — No Credit Card</Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;