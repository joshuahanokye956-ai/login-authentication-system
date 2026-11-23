'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, Trash2, UserPlus, ShieldAlert, Megaphone, ArrowRightLeft, History } from 'lucide-react';
import AdminTable from './AdminTable';
import Avatar from './Avatar';
import { ActionButton, post } from './Controls';
import { useToast } from './Toast';

const ICONS = { added: UserPlus, deleted: Trash2, restored: RotateCcw, role: ArrowRightLeft, announced: Megaphone };
const SENTENCE = {
  added: (a) => `added ${a.target} as ${a.detail}`,
  deleted: (a) => `moved ${a.target} to the Trash`,
  restored: (a) => `restored ${a.target}`,
  role: (a) => `changed ${a.target}’s role to ${a.detail}`,
  announced: () => 'posted an announcement',
};

function Trash({ trash }) {
  return (
    <section className="table-card">
      {trash.length === 0 ? (
        <p className="empty">The Trash is empty. Deleted members appear here, and you can restore them whenever you like.</p>
      ) : (
        <div className="scroll"><table>
          <thead><tr><th>Member</th><th>Role</th><th>Status</th><th>Deleted by</th><th>Deleted on</th><th></th></tr></thead>
          <tbody>{trash.map((u) => (
            <tr key={u.id} className="gone">
              <td><div className="who-cell"><Avatar name={u.name} /><div><strong>{u.name}</strong><span className="muted">{u.email}</span></div></div></td>
              <td><span className={`role-pill ${u.role}`}>{u.role}</span></td>
              <td><span className="status deleted">Deleted</span></td>
              <td>{u.by || 'Unknown'}</td>
              <td className="muted">{u.when}</td>
              <td className="right"><ActionButton url="/api/admin/restore" body={{ id: u.id }} label="Restore" icon={<RotateCcw size={14} />} variant="outline" success={`${u.name} restored`} /></td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
    </section>
  );
}

function Activity({ activity }) {
  return (
    <section className="card">
      {activity.length === 0 ? <p className="empty">No activity yet. Actions like adding, deleting and restoring members will be recorded here.</p> : (
        <ul className="feed">{activity.map((a, i) => {
          const Icon = ICONS[a.action] || History;
          return (
            <li key={i} className="feed-row"><span className="feed-icon"><Icon size={16} /></span>
              <div><p><strong>{a.actor}</strong> {(SENTENCE[a.action] || (() => a.action))(a)}</p><span className="muted">{a.when}</span></div></li>
          );
        })}</ul>
      )}
    </section>
  );
}

function Announcements({ items }) {
  const router = useRouter();
  const toast = useToast();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try { await post('/api/admin/announce', { message: text }); toast('Announcement posted'); setText(''); router.refresh(); }
    catch (err) { toast(err.message, 'err'); }
    setBusy(false);
  }
  return (
    <section className="card">
      <form onSubmit={submit} className="announce-form">
        <label>New announcement
          <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={280} rows={3} required placeholder="Share an update with staff and users…" />
        </label>
        <div className="announce-foot"><span className="muted">{text.length}/280</span><button className="btn primary small" disabled={busy}>{busy ? 'Posting…' : 'Post'}</button></div>
      </form>
      {items.length > 0 && <ul className="feed">{items.map((a) => (
        <li key={a.id} className="feed-row"><span className="feed-icon"><Megaphone size={16} /></span>
          <div className="grow"><p>{a.message}</p><span className="muted">{a.author} · {a.when}</span></div>
          <ActionButton url="/api/admin/announce" body={{ id: a.id, remove: true }} label="Remove" variant="outline" success="Announcement removed" />
        </li>))}</ul>}
    </section>
  );
}

export default function AdminTabs({ members, trash, activity, announcements, meId }) {
  const [tab, setTab] = useState('members');
  const tabs = [['members', `Members (${members.length})`], ['trash', `Trash (${trash.length})`], ['activity', 'Activity'], ['announcements', 'Announcements']];
  return (
    <>
      <div className="tabs" role="tablist">
        {tabs.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={`tab ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>{l}</button>)}
      </div>
      {tab === 'members' && <AdminTable users={members} meId={meId} />}
      {tab === 'trash' && <Trash trash={trash} />}
      {tab === 'activity' && <Activity activity={activity} />}
      {tab === 'announcements' && <Announcements items={announcements} />}
    </>
  );
}
