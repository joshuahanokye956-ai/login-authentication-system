'use client';
import { useMemo, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import Avatar from './Avatar';
import { ActionButton } from './Controls';

export default function StaffTable({ users }) {
  const [q, setQ] = useState('');
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return users.filter((u) => !t || u.name.toLowerCase().includes(t) || u.email.toLowerCase().includes(t));
  }, [users, q]);
  return (
    <section className="table-card">
      <div className="toolbar">
        <label className="search"><Search size={16} aria-hidden="true" />
          <input type="search" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search users" />
        </label>
      </div>
      <div className="scroll">
        {rows.length === 0 ? <p className="empty">{users.length ? 'No users match your search.' : 'No active users yet.'}</p> : (
          <table>
            <thead><tr><th>User</th><th>Joined</th><th></th></tr></thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td><div className="who-cell"><Avatar name={u.name} /><div><strong>{u.name}</strong><span className="muted">{u.email}</span></div></div></td>
                  <td className="muted">{u.created}</td>
                  <td className="right"><ActionButton url="/api/staff/delete" body={{ id: u.id }} label="Delete" icon={<Trash2 size={14} />} variant="danger"
                    confirmTitle={`Delete ${u.name}?`} confirmText="They will lose access straight away. An admin can restore the account later." confirmLabel="Delete user" success={`${u.name} deleted`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
