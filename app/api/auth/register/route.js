import { NextResponse } from 'next/server';
import { sql, ensureSchema } from '@/lib/db';
import { hashPassword } from '@/lib/password';

export async function POST(req) {
  await ensureSchema();
  const { name, email, password } = await req.json().catch(() => ({}));
  const n = typeof name === 'string' ? name.trim() : '';
  const e = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (n.length < 2 || n.length > 80) return NextResponse.json({ error: 'Enter your full name.' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  if (typeof password !== 'string' || password.length < 8 || password.length > 128)
    return NextResponse.json({ error: 'Password must be 8 to 128 characters.' }, { status: 400 });
  const { salt, hash } = await hashPassword(password);
  try {
    await sql`INSERT INTO users (name, email, password_hash, salt) VALUES (${n}, ${e}, ${hash}, ${salt})`;
  } catch (err) {
    if (err.code === '23505') return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    throw err;
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
