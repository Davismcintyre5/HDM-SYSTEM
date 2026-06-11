// src/pages/public/Pricing.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const defaultPlans = [
  {
    name: 'Free Trial',
    type: 'trial',
    price: 0,
    trialDays: 14,
    features: ['Full access', 'Unlimited services', 'Inventory management', 'Financial reports', '14 days free'],
    active: true,
    order: 0,
  },
  {
    name: 'Monthly',
    type: 'monthly',
    price: 1500,
    trialDays: 14,
    features: ['Full access', 'Unlimited services', 'Inventory management', 'Financial reports', 'Email support'],
    active: true,
    order: 1,
  },
  {
    name: 'Yearly',
    type: 'yearly',
    price: 15000,
    trialDays: 14,
    features: ['Full access', 'Unlimited services', 'Inventory management', 'Financial reports', 'Priority support', '2 months free'],
    active: true,
    order: 2,
  },
];

const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/cyber/admin/plans');
        if (res.data?.length > 0) {
          setPlans([
            { name: 'Free Trial', type: 'trial', price: 0, trialDays: res.data[0]?.trialDays || 14, features: ['Full access', 'Unlimited services', 'Inventory management', 'Financial reports', '14 days free', 'No credit card required'], active: true, order: 0 },
            ...res.data.map(p => ({ ...p, features: [...p.features, p.type === 'yearly' ? '2 months free' : 'Email support'] })),
          ]);
        } else {
          setPlans(defaultPlans);
        }
      } catch {
        setPlans(defaultPlans);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  if (loading) return <Spinner className="py-12" />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">Simple, Transparent Pricing</h1>
        <p className="mt-4 text-[var(--text-secondary)] max-w-xl mx-auto">
          Start with a 14-day free trial. No credit card required. Upgrade anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, i) => {
          const isPopular = plan.type === 'monthly';
          const isFree = plan.type === 'trial';
          const isYearly = plan.type === 'yearly';

          return (
            <div
              key={i}
              className={`card relative flex flex-col ${isPopular ? 'border-primary-500 ring-2 ring-primary-500 shadow-lg scale-105 z-10' : ''}`}
            >
              {isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </span>
              )}

              <div className="text-center mb-6">
                <h3 className={`text-lg font-bold ${isFree ? 'text-green-600 dark:text-green-400' : isYearly ? 'text-purple-600 dark:text-purple-400' : 'text-primary-600 dark:text-primary-400'}`}>
                  {plan.name}
                </h3>
                <div className="mt-4">
                  {isFree ? (
                    <>
                      <span className="text-4xl font-bold text-[var(--text-primary)]">Free</span>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">{plan.trialDays} days trial</p>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-[var(--text-primary)]">KES {plan.price?.toLocaleString()}</span>
                      <span className="text-[var(--text-secondary)]">/{plan.type}</span>
                      {plan.trialDays > 0 && <p className="text-sm text-green-600 dark:text-green-400 mt-1">Includes {plan.trialDays}-day free trial</p>}
                    </>
                  )}
                </div>
              </div>

              <ul className="space-y-3 flex-1">
                {plan.features?.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {isFree ? (
                  <Link to="/register">
                    <Button variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950">
                      Start Free Trial
                    </Button>
                  </Link>
                ) : (
                  <Link to={`/register?plan=${plan.type}`}>
                    <Button variant={isPopular ? 'primary' : 'outline'} className="w-full">
                      {isPopular ? 'Get Started' : 'Choose Plan'}
                    </Button>
                  </Link>
                )}
              </div>

              {isYearly && (
                <p className="text-center text-xs text-green-600 dark:text-green-400 mt-3 font-medium">
                  🎉 Save KES {(plan.price / 12).toFixed(0)}/month vs monthly
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-[var(--text-secondary)] mt-10">
        All plans include full access to all features. Upgrade or cancel anytime.
      </p>
    </div>
  );
};

export default Pricing;