// src/components/ui/Button.jsx

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700',
  secondary: 'border border-[var(--border-color)] hover:bg-[var(--bg-secondary)]',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'hover:bg-[var(--bg-secondary)]',
  success: 'bg-green-600 text-white hover:bg-green-700',
};

const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3' };

const Button = ({ children, variant = 'primary', size = 'md', className = '', disabled, ...props }) => (
  <button className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled} {...props}>{children}</button>
);

export default Button;