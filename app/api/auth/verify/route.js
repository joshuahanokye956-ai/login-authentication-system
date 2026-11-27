import { authenticator } from 'otplib';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import { sign, verify, json } from '@/lib/auth';
export async function POST(req) {
  const { pre, code } = await req.json();
  const p = await verify(pre || '');
  if (!p || p.step !== 'pre') return json({ error: 'Session expired. Sign in again.' }, 401);
  const [u] = await sql`SELECT * FROM users WHERE id=${p.id} AND is_deleted=false`;
  if (!u || !authenticator.check(String(code).trim(), u.totp_secret)) return json({ error: 'Invalid code.' }, 401);
  if (!u.totp_enrolled) await sql`UPDATE users SET totp_enrolled=true WHERE id=${u.id}`;
  cookies().set('session', await sign({ id: u.id, role: u.role, name: u.name }, '8h'), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 28800 });
  return json({ role: u.role });
}
