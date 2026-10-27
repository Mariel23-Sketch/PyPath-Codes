import { useEffect } from 'react';
import Icon from './Icon';

/* Backdrop: click outside or press Esc to close. Rendered only while open. */
export function Backdrop({ onClose, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const t = setTimeout(() => {
      const f = document.querySelector('.modal-backdrop.open input, .modal-backdrop.open select, .modal-backdrop.open textarea');
      if (f) f.focus();
    }, 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="modal-backdrop open" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {children}
    </div>
  );
}

/* Standard modal: title bar with close button, body, footer. Pass onSubmit to render a <form>. */
export default function Modal({ title, onClose, onSubmit, footer, children, small = false }) {
  const Tag = onSubmit ? 'form' : 'div';
  return (
    <Backdrop onClose={onClose}>
      <Tag className={`modal${small ? ' modal-sm' : ''}`} role="dialog" aria-modal="true" onSubmit={onSubmit} noValidate={!!onSubmit}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}><Icon name="x" /></button>
        </div>
        {children}
        {footer && <div className="modal-foot">{footer}</div>}
      </Tag>
    </Backdrop>
  );
}
