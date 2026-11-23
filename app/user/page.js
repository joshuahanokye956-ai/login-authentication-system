import { CheckCircle2, Circle, Clock, Lightbulb, KeyRound, ShieldCheck } from 'lucide-react';
import Shell from '@/components/Shell';
import UserBanner from '@/components/UserBanner';
import ScoreRing from '@/components/ScoreRing';
import Announcements from '@/components/Announcements';
import ChangePasswordForm from '@/components/ChangePasswordForm';
import { requirePage } from '@/lib/session';
import { sql } from '@/lib/db';
import { fmtTime } from '@/lib/format';

export const dynamic = 'force-dynamic';

const TIPS = [
  'Use a different password for every account. A password manager makes this easy.',
  'Never share your authenticator code, even with someone who says they work here.',
  'Be wary of urgent emails asking you to sign in. Type the address yourself instead.',
  'Keep your phone’s software up to date. Your authenticator app lives there.',
  'Longer passwords beat clever ones. Try three or four unrelated words.',
  'Sign out on shared computers, and close the browser tab when you finish.',
];

export default async function UserDashboard() {
  const me = await requirePage('user');
  const notes = await sql`SELECT id, author_name, message, created_at FROM announcements ORDER BY id DESC LIMIT 5`;
  const items = notes.map((a) => ({ ...a, when: fmtTime(a.created_at) }));
  const days = Math.floor((Date.now() - new Date(me.created_at).getTime()) / 864e5);
  const fresh = Date.now() - new Date(me.password_changed_at || me.created_at).getTime() < 90 * 864e5;
  const checks = [
    { ok: me.totp_enabled, label: 'Two-factor authentication is on', pts: 40 },
    { ok: !me.must_change_password, label: 'You chose your own password', pts: 30 },
    { ok: fresh, label: 'Password changed in the last 90 days', pts: 30 },
  ];
  const score = checks.reduce((n, c) => n + (c.ok ? c.pts : 0), 0);
  const tip = TIPS[Math.floor(Date.now() / 864e5) % TIPS.length];
  return (
    <Shell role="user" user={me} banner={<UserBanner name={me.name} role={me.role} days={days} />}>
      <div className="user-grid">
        <div className="col">
          <section className="card">
            <h3 className="card-title"><ShieldCheck size={17} /> Security score</h3>
            <div className="score">
              <ScoreRing score={score} />
              <ul className="checks">{checks.map((c) => (
                <li key={c.label} className={c.ok ? 'done' : ''}>{c.ok ? <CheckCircle2 size={18} /> : <Circle size={18} />}{c.label}</li>
              ))}</ul>
            </div>
          </section>
          <section className="card">
            <h3 className="card-title"><KeyRound size={17} /> Change password</h3>
            <ChangePasswordForm />
          </section>
        </div>
        <div className="col">
          <section className="card">
            <h3 className="card-title"><Clock size={17} /> Last sign-in</h3>
            <p className="big-line">{me.prev_login_at ? fmtTime(me.prev_login_at) : 'This is your first sign-in. Welcome!'}</p>
            <p className="muted">If this wasn’t you, change your password straight away and tell an admin.</p>
          </section>
          <section className="card tip">
            <h3 className="card-title"><Lightbulb size={17} /> Security tip of the day</h3>
            <p>{tip}</p>
          </section>
          <Announcements items={items} />
        </div>
      </div>
    </Shell>
  );
}
