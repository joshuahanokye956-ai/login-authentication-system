'use client';
import { useMemo, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import Avatar from './Avatar';
import { RoleSelect, ActionButton, CopyButton } from './Controls';

const FILTERS = [['all', 'All'], ['admin', 'Admins'], ['staff', 'Staff'], ['user', 'Users']];

export default function AdminTable({ users, meId }) {
  const [q, setQ] = useState('');
  const [f, setF] = useState('all');
  const rows = useMemo(() => users.filter((u) => {
    const t = q.trim().toLowerCase();
    if (t && !(u.name.toLowerCase().includes(t) || u.email.toLowerCase().includes(t))) return false;
    return f === 'all' || u.role === f;
  }), [users, q, f]);

  return (
    <section className="table-card">
      <div className="toolbar">
        <label className="search"><Search size={16} aria-hidden="true" />
          <input type="search" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search members" />
        </label>
        <div className="chips" role="group" aria-label="Filter members">
          {FILTERS.map(([k, l]) => <button key={k} className={`chip ${f === k ? 'on' : ''}`} aria-pressed={f === k} onClick={() => setF(k)}>{l}</button>)}
        </div>
      </div>
      <div className="scroll">
        {rows.length === 0 ? <p className="empty">No members match your search.</p> : (
          <table>
            <thead><tr><th>Member</th><th>Role</th><th>Status</th><th>2FA</th><th>Salt</th><th>Password hash</th><th>Created</th><th></th></tr></thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td><div className="who-cell"><Avatar name={u.name} /><div><strong>{u.name}</strong><span className="muted">{u.email}</span></div></div></td>
                  <td>{u.id === meId ? <span className={`role-pill ${u.role}`}>{u.role} (you)</span> : <RoleSelect id={u.id} role={u.role} />}</td>
                  <td><span className={`status ${u.invited ? 'invited' : 'active'}`}>{u.invited ? 'Invited' : 'Active'}</span></td>
                  <td><span className={`dot ${u.mfa ? 'on' : ''}`}>{u.mfa ? 'On' : 'Off'}</span></td>
                  <td><span className="copy-cell"><code className="hash" title={u.salt}>{u.salt}</code><CopyButton value={u.salt} label="Salt" /></span></td>
                  <td><span className="copy-cell"><code className="hash" title={u.hash}>{u.hash}</code><CopyButton value={u.hash} label="Hash" /></span></td>
                  <td className="muted">{u.created}</td>
                  <td className="right">{u.id !== meId && <ActionButton url="/api/admin/delete" body={{ id: u.id }} label="Delete" icon={<Trash2 size={14} />} variant="danger"
                    confirmTitle={`Delete ${u.name}?`} confirmText="They lose access straight away. You can restore them from the Trash at any time." confirmLabel="Move to Trash" success={`${u.name} moved to Trash`} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
