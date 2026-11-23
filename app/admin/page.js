import { Users, ShieldCheck, UserCog, Trash2 } from 'lucide-react';
import Shell from '@/components/Shell';
import Stat from '@/components/Stat';
import AdminTabs from '@/components/AdminTabs';
import AddMember from '@/components/AddMember';
import { BackupButton } from '@/components/Controls';
import { requirePage } from '@/lib/session';
import { sql } from '@/lib/db';
import { fmtDate, fmtTime } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const me = await requirePage('admin');
  const [live, gone, log, notes] = await Promise.all([
    sql`SELECT id, name, email, role, password_hash, salt, totp_enabled, created_at, must_change_password FROM users WHERE deleted_at IS NULL ORDER BY id`,
    sql`SELECT u.id, u.name, u.email, u.role, u.deleted_at, d.name AS by FROM users u LEFT JOIN users d ON d.id = u.deleted_by WHERE u.deleted_at IS NOT NULL ORDER BY u.deleted_at DESC`,
    sql`SELECT actor_name, action, target_name, detail, created_at FROM activity ORDER BY id DESC LIMIT 50`,
    sql`SELECT id, author_name, message, created_at FROM announcements ORDER BY id DESC LIMIT 20`,
  ]);
  const members = live.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, hash: u.password_hash, salt: u.salt, mfa: u.totp_enabled, invited: u.must_change_password, created: fmtDate(u.created_at) }));
  const trash = gone.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, by: u.by, when: fmtTime(u.deleted_at) }));
  const activity = log.map((a) => ({ actor: a.actor_name, action: a.action, target: a.target_name, detail: a.detail, when: fmtTime(a.created_at) }));
  const announcements = notes.map((a) => ({ id: a.id, author: a.author_name, message: a.message, when: fmtTime(a.created_at) }));
  const count = (r) => members.filter((u) => u.role === r).length;
  return (
    <Shell role="admin" user={me} subtitle="Manage members, roles and backups. Password hashes are sensitive, so keep this page private."
      actions={<><AddMember /><BackupButton /></>}>
      <div className="stats">
        <Stat icon={<Users size={20} />} label="Active members" value={members.length} />
        <Stat icon={<ShieldCheck size={20} />} label="Admins" value={count('admin')} />
        <Stat icon={<UserCog size={20} />} label="Staff" value={count('staff')} />
        <Stat icon={<Trash2 size={20} />} label="In the Trash" value={trash.length} />
      </div>
      <AdminTabs members={members} trash={trash} activity={activity} announcements={announcements} meId={me.id} />
    </Shell>
  );
}
