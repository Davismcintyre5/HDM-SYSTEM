// src/components/ui/Input.jsx

const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{label}</label>}
      <input className={`input ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`} {...props} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default Input;