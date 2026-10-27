import { useState } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { EMAIL_RE } from './Auth';
import { useToast } from '../hooks/useToast';

/* "Forgot password" dialog on both login pages (demo only – no email is sent) */
export default function ForgotModal({ who, placeholder, onClose }) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');

  const send = () => {
    const v = email.trim();
    if (!EMAIL_RE.test(v)) { setErr('Enter a valid email address.'); return; }
    setErr('');
    onClose();
    toast(`Reset link sent to ${v}`);
  };

  return (
    <Modal
      title="Reset password"
      onClose={onClose}
      footer={(
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={send}>Send link</button>
        </>
      )}
    >
      <p className="muted-p">Enter your {who} email and we&apos;ll send you a reset link (demo only).</p>
      <div className="field">
        <label htmlFor="resetEmail">Email</label>
        <div className="input-ico">
          <Icon name="mail" box />
          <input className="input" id="resetEmail" type="email" placeholder={placeholder} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="err" id="resetErr">{err}</div>
      </div>
    </Modal>
  );
}
