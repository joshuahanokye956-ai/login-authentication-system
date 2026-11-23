import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireApi } from '@/lib/session';
import { logActivity } from '@/lib/activity';

export async function POST(req) {
  const me = await requireApi('admin');
  if (!me) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  const { id, role } = await req.json().catch(() => ({}));
  if (!Number.isInteger(id) || !['user', 'staff', 'admin'].includes(role))
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  if (id === me.id) return NextResponse.json({ error: 'You can’t change your own role.' }, { status: 400 });
  const rows = await sql`UPDATE users SET role = ${role} WHERE id = ${id} AND deleted_at IS NULL RETURNING id, name`;
  if (!rows.length) return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  await logActivity(me, 'role', rows[0].name, role);
  return NextResponse.json({ ok: true });
}
