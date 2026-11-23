'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Wand2 } from 'lucide-react';
import { post, CopyButton } from './Controls';
import { useToast } from './Toast';

function generate() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const a = new Uint32Array(14);
  crypto.getRandomValues(a);
  return [...a].map((n) => chars[n % chars.length]).join('');
}

export default function AddMember() {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null);

  function close() { setOpen(false); setCreated(null); setPw(''); setError(''); router.refresh(); }
  async function submit(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    setError(''); setBusy(true);
    try {
      await post('/api/admin/members', f);
      toast(`${f.name} added`);
      setCreated({ email: f.email, password: f.password, name: f.name });
    } catch (err) { setError(err.message); }
    setBusy(false);
  }

  return (
    <>
      <button className="btn outline" onClick={() => setOpen(true)}><UserPlus size={16} /> Add member</button>
      {open && (
        <div className="overlay" onClick={close}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="add-title" onClick={(e) => e.stopPropagation()}>
            {created ? (
              <>
                <h2 id="add-title">{created.name} was added</h2>
                <p>Share these sign-in details with them. This password is shown only once. They will be asked to choose their own at first sign-in.</p>
                <div className="creds">
                  <div><span className="muted">Email</span><code>{created.email}</code></div>
                  <div><span className="muted">Temporary password</span><span className="copy-cell"><code>{created.password}</code><CopyButton value={created.password} label="Password" /></span></div>
                </div>
                <div className="modal-actions"><button className="btn primary" onClick={close} autoFocus>Done</button></div>
              </>
            ) : (
              <form onSubmit={submit}>
                <h2 id="add-title">Add a new member</h2>
                <label>Full name<input name="name" required minLength={2} autoFocus placeholder="Kofi Boateng" /></label>
                <label>Email<input name="email" type="email" required placeholder="kofi@organisation.com" /></label>
                <label>Role
                  <select name="role" defaultValue="user" className="role-select wide-select"><option value="user">User</option><option value="staff">Staff</option><option value="admin">Admin</option></select>
                </label>
                <label>Temporary password
                  <span className="pw-row">
                    <input name="password" type="text" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="off" placeholder="At least 8 characters" />
                    <button type="button" className="btn outline small" onClick={() => setPw(generate())}><Wand2 size={14} /> Generate</button>
                  </span>
                </label>
                {error && <p className="err" role="alert">{error}</p>}
                <div className="modal-actions">
                  <button type="button" className="btn outline" onClick={close}>Cancel</button>
                  <button className="btn primary" disabled={busy}>{busy ? 'Adding…' : 'Add member'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
