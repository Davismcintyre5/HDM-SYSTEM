// src/components/ui/StatCard.jsx

const StatCard = ({ title, value, icon, color = 'primary', link, linkText }) => {
  const colors = { primary: 'text-primary-600', green: 'text-green-600', red: 'text-red-600', yellow: 'text-yellow-600', purple: 'text-purple-600' };
  return (
    <div className="card">
      <div className="flex items-start justify-between"><div><p className="text-sm text-[var(--text-secondary)]">{title}</p><p className={`text-2xl font-bold mt-1 ${colors[color]}`}>{value}</p></div>{icon && <span className="text-2xl">{icon}</span>}</div>
      {link && <a href={link} className="text-xs text-primary-600 hover:underline mt-3 inline-block">{linkText || 'View all'} →</a>}
    </div>
  );
};

export default StatCard;