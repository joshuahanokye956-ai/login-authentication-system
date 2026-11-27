'use client';
import { useState } from 'react';
import { Shell, useUsers, api } from '@/components/Shell';
export default function AdminDash() {
  const [users, load] = useUsers(); const [note, setNote] = useState('');
  const backup = async () => { setNote('Backing up…'); const d = await api('/api/backup', 'POST'); setNote(d.message || d.error); };
  const patch = async (id, b) => { await api(`/api/users/${id}`, 'PATCH', b); load(); };
  return (<Shell title="Admin dashboard">
    <div className="bar" style={{ marginBottom: 16 }}><button onClick={backup}>Backup</button><b className={note === 'Backup completed' ? 'ok' : 'err'}>{note}</b></div>
    <div className="wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Salt</th><th>Password hash</th><th>Status</th><th></th></tr></thead><tbody>
      {users.map((x) => (<tr key={x.id} className={x.is_deleted ? 'del' : ''}><td>{x.name}</td><td>{x.email}</td>
        <td>{x.role === 'admin' ? 'admin' : <select value={x.role} onChange={(e) => patch(x.id, { role: e.target.value })} style={{ margin: 0 }}><option>user</option><option>staff</option></select>}</td>
        <td className="hash">{x.salt}</td><td className="hash">{x.password_hash}</td>
        <td>{x.is_deleted ? <span className="tag">Deleted</span> : 'Active'}</td>
        <td>{x.is_deleted && <button onClick={() => patch(x.id, { restore: true })}>Restore</button>}</td></tr>))}
    </tbody></table></div></Shell>);
}
