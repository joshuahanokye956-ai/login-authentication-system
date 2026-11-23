import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sql, ensureSchema } from './db';

const key = () => new TextEncoder().encode(process.env.JWT_SECRET);
export const home = { admin: '/admin', staff: '/staff', user: '/user' };

export async function setCookie(name, payload, seconds) {
  const token = await new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime(`${seconds}s`).sign(key());
  (await cookies()).set(name, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: seconds });
}
export async function readCookie(name) {
  try {
    const token = (await cookies()).get(name)?.value;
    return token ? (await jwtVerify(token, key())).payload : null;
  } catch { return null; }
}
// Always re-read the user from the database so role changes and deletions apply immediately.
export async function currentUser() {
  const s = await readCookie('session');
  if (!s) return null;
  await ensureSchema();
  const [u] = await sql`SELECT id, name, email, role, totp_enabled, created_at, must_change_password, last_login_at, prev_login_at, password_changed_at FROM users WHERE id = ${Number(s.sub)} AND deleted_at IS NULL`;
  return u || null;
}
export async function requirePage(role) {
  const u = await currentUser();
  if (!u) redirect('/login');
  if (u.must_change_password) redirect('/change-password');
  if (u.role !== role) redirect(home[u.role]);
  return u;
}
export async function requireApi(role) {
  const u = await currentUser();
  return u && !u.must_change_password && u.role === role ? u : null;
}
