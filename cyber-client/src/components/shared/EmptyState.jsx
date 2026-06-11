// src/components/shared/EmptyState.jsx

import Button from '../ui/Button';

const EmptyState = ({ icon = '📭', title, description, actionLabel, onAction }) => {
  return (
    <div className="text-center py-12">
      <p className="text-5xl mb-4">{icon}</p>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{title || 'No data found'}</h3>
      {description && <p className="text-sm text-[var(--text-secondary)] mb-4">{description}</p>}
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
};

export default EmptyState;