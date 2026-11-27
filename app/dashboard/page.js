'use client';
import { Shell, useUsers } from '@/components/Shell';
export default function UserDash() {
  const [u] = useUsers(); const me = u[0];
  return (<Shell title="My dashboard">{me ? <div className="card" style={{ margin: 0 }}><p><b>Name:</b> {me.name}</p><p><b>Email:</b> {me.email}</p><p><b>Role:</b> {me.role}</p><p><b>Joined:</b> {new Date(me.created_at).toLocaleDateString()}</p></div> : <p>Loading…</p>}</Shell>);
}
