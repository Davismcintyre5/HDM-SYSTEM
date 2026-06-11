// src/components/shared/PricingCard.jsx

import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const PricingCard = ({ plan, popular }) => {
  return (
    <div className={`card relative ${popular ? 'border-primary-500 ring-2 ring-primary-500' : ''}`}>
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
          POPULAR
        </span>
      )}
      <div className="text-center">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">{plan.name}</h3>
        <div className="mt-4">
          <span className="text-4xl font-bold text-[var(--text-primary)]">KES {plan.price?.toLocaleString()}</span>
          <span className="text-[var(--text-secondary)]">/{plan.type}</span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mt-2">{plan.trialDays}-day free trial</p>
      </div>
      <ul className="mt-6 space-y-3">
        {plan.features?.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
            <span className="text-green-500 mt-0.5">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <Link to={`/register?plan=${plan.type}`}>
          <Button variant={popular ? 'primary' : 'outline'} className="w-full">
            {plan.trialDays ? 'Start Free Trial' : 'Get Started'}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PricingCard;