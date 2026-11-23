import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { authenticator } from 'otplib';
import { sql, ensureSchema } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { setCookie } from '@/lib/session';

export async function POST(req) {
  await ensureSchema();
  const { email, password } = await req.json().catch(() => ({}));
  const fail = (m = 'Invalid email or password.', s = 401) => NextResponse.json({ error: m }, { status: s });
  if (typeof email !== 'string' || typeof password !== 'string') return fail();
  const [u] = await sql`SELECT * FROM users WHERE email = ${email.trim().toLowerCase()}`;
  if (!u || u.deleted_at) return fail();
  if (u.locked_until && new Date(u.locked_until) > new Date()) return fail('Too many failed attempts. Try again in 15 minutes.', 429);
  if (!(await verifyPassword(password, u.salt, u.password_hash))) {
    await sql`UPDATE users SET failed_attempts = failed_attempts + 1,
              locked_until = CASE WHEN failed_attempts + 1 >= 5 THEN now() + interval '15 minutes' ELSE locked_until END
              WHERE id = ${u.id}`;
    return fail();
  }
  // Password is correct: issue a short-lived "pending" cookie. The real session comes only after 2FA.
  let secret = u.totp_secret;
  if (!secret) {
    secret = authenticator.generateSecret();
    await sql`UPDATE users SET totp_secret = ${secret} WHERE id = ${u.id}`;
  }
  await setCookie('pending', { sub: String(u.id) }, 300);
  if (u.totp_enabled) return NextResponse.json({ step: 'verify' });
  const qr = await QRCode.toDataURL(authenticator.keyuri(u.email, 'Login Authentication System', secret));
  return NextResponse.json({ step: 'setup', qr, secret });
}
