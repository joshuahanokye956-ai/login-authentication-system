import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireApi } from '@/lib/session';
import { logActivity } from '@/lib/activity';

export async function POST(req) {
  const me = await requireApi('admin');
  if (!me) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  const id = Number((await req.json().catch(() => ({}))).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Invalid member.' }, { status: 400 });
  if (id === me.id) return NextResponse.json({ error: 'You can’t delete your own account.' }, { status: 400 });
  const rows = await sql`UPDATE users SET deleted_at = now(), deleted_by = ${me.id}
                         WHERE id = ${id} AND deleted_at IS NULL RETURNING id, name`;
  if (!rows.length) return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
  await logActivity(me, 'deleted', rows[0].name);
  return NextResponse.json({ ok: true });
}
