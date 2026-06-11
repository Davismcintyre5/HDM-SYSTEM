// src/components/ui/StatCard.jsx

const StatCard = ({ title, value, icon, trend, color = 'primary', link, linkText }) => {
  const colors = {
    primary: 'text-primary-600 dark:text-primary-400',
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    purple: 'text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${colors[color]}`}>{value}</p>
          {trend && <p className="text-xs text-[var(--text-secondary)] mt-1">{trend}</p>}
        </div>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      {link && (
        <a href={link} className="text-xs text-primary-600 hover:underline mt-3 inline-block">
          {linkText || 'View all'} →
        </a>
      )}
    </div>
  );
};

export default StatCard;