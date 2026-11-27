import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
const key = () => new TextEncoder().encode(process.env.JWT_SECRET);
// salt (random, per user, stored in DB) + pepper (secret, env var only)
export const newSalt = () => crypto.randomBytes(16).toString('hex');
const prep = (pw, salt) => crypto.createHmac('sha256', process.env.PEPPER).update(salt + pw).digest('hex');
export const hashPw = (pw, salt) => bcrypt.hash(prep(pw, salt), 12);
export const checkPw = (pw, salt, hash) => bcrypt.compare(prep(pw, salt), hash);
export const sign = (payload, exp) => new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime(exp).sign(key());
export const verify = async (t) => { try { return (await jwtVerify(t, key())).payload; } catch { return null; } };
export async function session() {
  const t = cookies().get('session')?.value;
  return t ? verify(t) : null;
}
export const json = (d, status = 200) => Response.json(d, { status });
