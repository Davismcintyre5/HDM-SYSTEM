// src/components/ui/Card.jsx

const Card = ({ children, className = '', padding = true }) => (
  <div className={`card ${!padding ? 'p-0' : ''} ${className}`}>{children}</div>
);

export default Card;