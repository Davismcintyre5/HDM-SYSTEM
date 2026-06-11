import Button from './ui/Button';

const PrintButton = ({ children = 'Print', onClick, ...props }) => (
  <Button size="sm" variant="secondary" onClick={onClick} {...props}>🖨️ {children}</Button>
);

export default PrintButton;