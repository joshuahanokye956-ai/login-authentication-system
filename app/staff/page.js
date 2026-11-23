import { Users, UserPlus } from 'lucide-react';
import Shell from '@/components/Shell';
import Stat from '@/components/Stat';
import StaffTable from '@/components/StaffTable';
import Announcements from '@/components/Announcements';
import { requirePage } from '@/lib/session';
import { sql } from '@/lib/db';
import { fmtDate, fmtTime } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function StaffDashboard() {
  const me = await requirePage('staff');
  const [rows, notes] = await Promise.all([
    sql`SELECT id, name, email, created_at FROM users WHERE role = 'user' AND deleted_at IS NULL ORDER BY id DESC`,
    sql`SELECT id, author_name, message, created_at FROM announcements ORDER BY id DESC LIMIT 3`,
  ]);
  const week = Date.now() - 7 * 864e5;
  const users = rows.map((u) => ({ id: u.id, name: u.name, email: u.email, created: fmtDate(u.created_at), recent: new Date(u.created_at).getTime() > week }));
  const items = notes.map((a) => ({ ...a, when: fmtTime(a.created_at) }));
  return (
    <Shell role="staff" user={me} subtitle="Review active users and remove accounts that should no longer have access.">
      <div className="stats">
        <Stat icon={<Users size={20} />} label="Active users" value={users.length} />
        <Stat icon={<UserPlus size={20} />} label="Joined this week" value={users.filter((u) => u.recent).length} />
      </div>
      {items.length > 0 && <div className="gap-bottom"><Announcements items={items} /></div>}
      <StaffTable users={users} />
    </Shell>
  );
}
