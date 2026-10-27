import { useCallback, useRef, useState } from 'react';
import Icon from './Icon';
import { ToastCtx } from '../hooks/useToast';

/* toast(message, 'error'?) – same look and timing as the old PP.toast */
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const seq = useRef(0);

  const toast = useCallback((msg, kind) => {
    const id = ++seq.current;
    setItems((l) => [...l, { id, msg, kind, out: false }]);
    setTimeout(() => setItems((l) => l.map((t) => (t.id === id ? { ...t, out: true } : t))), 2600);
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 2850);
  }, []);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="toasts" id="toasts">
        {items.map((t) => (
          <div key={t.id} className={`toast${t.kind ? ` toast-${t.kind}` : ''}${t.out ? ' out' : ''}`}>
            <Icon name={t.kind === 'error' ? 'x' : 'check'} />
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
