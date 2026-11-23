'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Check, Copy, DatabaseBackup } from 'lucide-react';
import { useToast } from './Toast';

export async function post(url, body) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Something went wrong.');
  return d;
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <button className="btn small ghost" onClick={async () => { await post('/api/auth/logout'); router.push('/login'); router.refresh(); }}>
      <LogOut size={15} /> Sign out
    </button>
  );
}

function Confirm({ title, text, confirmLabel, danger, onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="dlg-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="dlg-title">{title}</h2>
        <p>{text}</p>
        <div className="modal-actions">
          <button className="btn outline" onClick={onCancel} autoFocus>Cancel</button>
          <button className={`btn ${danger ? 'danger' : 'primary'}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export function ActionButton({ url, body, label, icon, variant = 'primary', confirmTitle, confirmText, confirmLabel, success = 'Done' }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [ask, setAsk] = useState(false);
  async function run() {
    setAsk(false); setBusy(true);
    try { await post(url, body); toast(success); router.refresh(); } catch (e) { toast(e.message, 'err'); }
    setBusy(false);
  }
  return (
    <>
      <button className={`btn small ${variant}`} disabled={busy} onClick={() => (confirmText ? setAsk(true) : run())}>
        {icon}{busy ? 'Working…' : label}
      </button>
      {ask && <Confirm title={confirmTitle} text={confirmText} confirmLabel={confirmLabel || label} danger={variant === 'danger'} onConfirm={run} onCancel={() => setAsk(false)} />}
    </>
  );
}

export function RoleSelect({ id, role }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  async function change(e) {
    const next = e.target.value;
    setBusy(true);
    try { await post('/api/admin/role', { id, role: next }); toast(`Role changed to ${next}`); router.refresh(); } catch (err) { toast(err.message, 'err'); }
    setBusy(false);
  }
  return (
    <select className="role-select" value={role} onChange={change} disabled={busy} aria-label="Change role">
      {['user', 'staff', 'admin'].map((r) => <option key={r} value={r}>{r}</option>)}
    </select>
  );
}

export function CopyButton({ value, label }) {
  const toast = useToast();
  const [done, setDone] = useState(false);
  return (
    <button className="icon-btn" aria-label={`Copy ${label}`} title={`Copy ${label}`} onClick={async () => {
      try { await navigator.clipboard.writeText(value); setDone(true); toast(`${label} copied`); setTimeout(() => setDone(false), 1500); }
      catch { toast('Could not copy', 'err'); }
    }}>
      {done ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

export function BackupButton() {
  const toast = useToast();
  const [s, setS] = useState('idle');
  async function run() {
    setS('busy');
    try { await post('/api/admin/backup'); setS('done'); toast('Backup completed'); setTimeout(() => setS('idle'), 3500); }
    catch (e) { setS('idle'); toast(e.message, 'err'); }
  }
  return (
    <button className="btn primary" onClick={run} disabled={s === 'busy'}>
      {s === 'done' ? <Check size={16} /> : <DatabaseBackup size={16} />}
      {s === 'busy' ? 'Backing up…' : s === 'done' ? 'Backup completed' : 'Backup'}
    </button>
  );
}
