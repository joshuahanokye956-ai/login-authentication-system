import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { currentUser, home } from '@/lib/session';
import { hashPassword, verifyPassword } from '@/lib/password';

export async function POST(req) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
  const { current, next } = await req.json().catch(() => ({}));
  if (typeof current !== 'string' || typeof next !== 'string') return NextResponse.json({ error: 'Fill in both passwords.' }, { status: 400 });
  if (next.length < 8 || next.length > 128) return NextResponse.json({ error: 'New password must be 8 to 128 characters.' }, { status: 400 });
  if (next === current) return NextResponse.json({ error: 'Choose a password different from the current one.' }, { status: 400 });
  const [row] = await sql`SELECT password_hash, salt FROM users WHERE id = ${u.id}`;
  if (!(await verifyPassword(current, row.salt, row.password_hash))) return NextResponse.json({ error: 'Your current password is incorrect.' }, { status: 401 });
  const { salt, hash } = await hashPassword(next);
  await sql`UPDATE users SET password_hash = ${hash}, salt = ${salt}, must_change_password = false, password_changed_at = now() WHERE id = ${u.id}`;
  return NextResponse.json({ ok: true, redirect: home[u.role] });
}
