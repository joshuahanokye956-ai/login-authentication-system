import { authenticator } from 'otplib';
import { sql, ensure } from '@/lib/db';
import { newSalt, hashPw, json } from '@/lib/auth';
export async function POST(req) {
  const { name, email, password } = await req.json();
  if (!name || !/^\S+@\S+\.\S+$/.test(email || '') || (password || '').length < 8) return json({ error: 'Enter a name, a valid email and a password of 8+ characters.' }, 400);
  await ensure();
  const e = email.toLowerCase();
  if ((await sql`SELECT 1 FROM users WHERE email=${e}`).length) return json({ error: 'That email is already registered.' }, 409);
  const salt = newSalt();
  const role = e === (process.env.ADMIN_EMAIL || '').toLowerCase() ? 'admin' : 'user';
  await sql`INSERT INTO users(name,email,salt,password_hash,role,totp_secret)
    VALUES(${name},${e},${salt},${await hashPw(password, salt)},${role},${authenticator.generateSecret()})`;
  return json({ ok: true });
}
