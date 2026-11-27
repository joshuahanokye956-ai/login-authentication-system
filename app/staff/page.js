'use client';
import { Shell, useUsers, api } from '@/components/Shell';
export default function StaffDash() {
  const [users, load] = useUsers();
  return (<Shell title="Staff dashboard"><div className="wrap"><table><thead><tr><th>Name</th><th>Email</th><th></th></tr></thead><tbody>
    {users.map((x) => (<tr key={x.id}><td>{x.name}</td><td>{x.email}</td><td><button className="red" onClick={async () => { if (confirm(`Delete ${x.name}?`)) { await api(`/api/users/${x.id}`, 'DELETE'); load(); } }}>Delete</button></td></tr>))}
    {!users.length && <tr><td colSpan="3">No users yet.</td></tr>}</tbody></table></div></Shell>);
}
