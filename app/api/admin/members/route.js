import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireApi } from '@/lib/session';
import { hashPassword } from '@/lib/password';
import { logActivity } from '@/lib/activity';

export async function POST(req) {
  const me = await requireApi('admin');
  if (!me) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  const { name, email, role, password } = await req.json().catch(() => ({}));
  const n = typeof name === 'string' ? name.trim() : '';
  const e = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (n.length < 2 || n.length > 80) return NextResponse.json({ error: 'Enter the member’s full name.' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  if (!['user', 'staff', 'admin'].includes(role)) return NextResponse.json({ error: 'Choose a role.' }, { status: 400 });
  if (typeof password !== 'string' || password.length < 8 || password.length > 128)
    return NextResponse.json({ error: 'Temporary password must be 8 to 128 characters.' }, { status: 400 });
  const { salt, hash } = await hashPassword(password);
  try {
    // must_change_password forces the member to choose their own password at first sign-in.
    await sql`INSERT INTO users (name, email, role, password_hash, salt, must_change_password)
              VALUES (${n}, ${e}, ${role}, ${hash}, ${salt}, true)`;
  } catch (err) {
    if (err.code === '23505') return NextResponse.json({ error: 'That email is already registered. If the member was deleted, restore them from the Trash.' }, { status: 409 });
    throw err;
  }
  await logActivity(me, 'added', n, role);
  return NextResponse.json({ ok: true }, { status: 201 });
}
