import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authenticator } from 'otplib';
import { sql, ensureSchema } from '@/lib/db';
import { readCookie, setCookie, home } from '@/lib/session';

authenticator.options = { window: 1 };

export async function POST(req) {
  await ensureSchema();
  const expired = () => NextResponse.json({ error: 'Your sign-in expired. Sign in again.', expired: true }, { status: 401 });
  const pending = await readCookie('pending');
  if (!pending) return expired();
  const [u] = await sql`SELECT * FROM users WHERE id = ${Number(pending.sub)} AND deleted_at IS NULL`;
  if (!u || !u.totp_secret) return expired();
  if (u.locked_until && new Date(u.locked_until) > new Date())
    return NextResponse.json({ error: 'Too many failed attempts. Try again in 15 minutes.' }, { status: 429 });
  const { code } = await req.json().catch(() => ({}));
  if (!authenticator.check(String(code || '').replace(/\s/g, ''), u.totp_secret)) {
    await sql`UPDATE users SET failed_attempts = failed_attempts + 1,
              locked_until = CASE WHEN failed_attempts + 1 >= 5 THEN now() + interval '15 minutes' ELSE locked_until END
              WHERE id = ${u.id}`;
    return NextResponse.json({ error: 'That code is incorrect or expired.' }, { status: 401 });
  }
  await sql`UPDATE users SET totp_enabled = true, failed_attempts = 0, locked_until = NULL, prev_login_at = last_login_at, last_login_at = now() WHERE id = ${u.id}`;
  await setCookie('session', { sub: String(u.id), role: u.role }, 8 * 3600);
  (await cookies()).delete('pending');
  return NextResponse.json({ redirect: u.must_change_password ? '/change-password' : home[u.role] });
}
