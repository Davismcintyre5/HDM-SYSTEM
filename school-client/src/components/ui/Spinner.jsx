// src/components/ui/Spinner.jsx

const Spinner = ({ className = '' }) => (
  <div className={`flex items-center justify-center ${className}`}><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
);

export default Spinner;