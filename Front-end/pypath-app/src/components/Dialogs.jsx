import { useCallback, useState } from 'react';
import Icon from './Icon';
import Modal, { Backdrop } from './Modal';
import { DialogCtx } from '../hooks/useDialogs';

/* confirm({title,text,confirm,icon,primary}) -> Promise<boolean>
   message(title, content, buttonLabel) -> simple info modal */
export function DialogProvider({ children }) {
  const [dlg, setDlg] = useState(null);

  const confirm = useCallback((o) => new Promise((resolve) => {
    setDlg({ kind: 'confirm', o, resolve });
  }), []);
  const message = useCallback((title, content, btn) => setDlg({ kind: 'message', title, content, btn }), []);

  const close = (v) => {
    if (dlg && dlg.kind === 'confirm') dlg.resolve(!!v);
    setDlg(null);
  };

  return (
    <DialogCtx.Provider value={{ confirm, message }}>
      {children}
      {dlg && dlg.kind === 'confirm' && (
        <Backdrop onClose={() => close(false)}>
          <div className="modal modal-sm" role="dialog" aria-modal="true">
            <div className={`confirm-ico${dlg.o.primary ? ' blue' : ''}${dlg.o.tone ? ` ${dlg.o.tone}` : ''}`}><Icon name={dlg.o.icon || (dlg.o.primary ? 'alert' : 'trash')} /></div>
            <h3>{dlg.o.title || 'Are you sure?'}</h3>
            <p>{dlg.o.text || ''}</p>
            <div className="modal-foot center">
              <button className="btn btn-ghost" onClick={() => close(false)}>Cancel</button>
              <button className={`btn ${dlg.o.primary ? 'btn-primary' : 'btn-danger-solid'}`} autoFocus onClick={() => close(true)}>{dlg.o.confirm || (dlg.o.primary ? 'OK' : 'Delete')}</button>
            </div>
          </div>
        </Backdrop>
      )}
      {dlg && dlg.kind === 'message' && (
        <Modal title={dlg.title} onClose={() => close()} footer={<button className="btn btn-primary" onClick={() => close()}>{dlg.btn || 'Close'}</button>}>
          <div className="modal-body">{dlg.content}</div>
        </Modal>
      )}
    </DialogCtx.Provider>
  );
}
