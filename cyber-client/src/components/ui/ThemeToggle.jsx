// src/components/ui/ThemeToggle.jsx

import { useThemeContext } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { dark, toggle } = useThemeContext();

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors text-lg"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
};

export default ThemeToggle;