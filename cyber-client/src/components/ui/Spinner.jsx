// src/components/ui/Spinner.jsx

const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-[var(--border-color)] border-b-primary-600 ${sizes[size]}`} />
    </div>
  );
};

export default Spinner;