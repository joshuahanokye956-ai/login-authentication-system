import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { sql, ensure } from '@/lib/db';
import { checkPw, sign, json } from '@/lib/auth';
export async function POST(req) {
  const { email, password } = await req.json();
  await ensure();
  const [u] = await sql`SELECT * FROM users WHERE email=${(email || '').toLowerCase()}`;
  if (!u || u.is_deleted || !(await checkPw(password || '', u.salt, u.password_hash))) return json({ error: 'Wrong email or password, or the account is deleted.' }, 401);
  const pre = await sign({ id: u.id, step: 'pre' }, '5m');
  const qr = u.totp_enrolled ? null : await QRCode.toDataURL(authenticator.keyuri(u.email, 'Login Authentication System', u.totp_secret));
  return json({ pre, qr });
}
