// src/components/ui/Modal.jsx

import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => { document.body.style.overflow = isOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [isOpen]);
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-[var(--bg-primary)] rounded-xl shadow-xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]"><h3 className="text-lg font-semibold">{title}</h3><button onClick={onClose} className="p-1 hover:bg-[var(--bg-secondary)] rounded-lg">✕</button></div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;