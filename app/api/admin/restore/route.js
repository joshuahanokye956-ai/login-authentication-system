import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireApi } from '@/lib/session';
import { logActivity } from '@/lib/activity';

export async function POST(req) {
  const me = await requireApi('admin');
  if (!me) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  const id = Number((await req.json().catch(() => ({}))).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Invalid user.' }, { status: 400 });
  const rows = await sql`UPDATE users SET deleted_at = NULL, deleted_by = NULL, failed_attempts = 0, locked_until = NULL
                         WHERE id = ${id} AND deleted_at IS NOT NULL RETURNING id, name`;
  if (!rows.length) return NextResponse.json({ error: 'Deleted account not found.' }, { status: 404 });
  await logActivity(me, 'restored', rows[0].name);
  return NextResponse.json({ ok: true });
}
