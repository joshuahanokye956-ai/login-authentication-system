import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireApi } from '@/lib/session';
import { logActivity } from '@/lib/activity';

export async function POST(req) {
  const me = await requireApi('admin');
  if (!me) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  if (body.remove) {
    const id = Number(body.id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: 'Invalid announcement.' }, { status: 400 });
    await sql`DELETE FROM announcements WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  }
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message || message.length > 280) return NextResponse.json({ error: 'Write a message of up to 280 characters.' }, { status: 400 });
  await sql`INSERT INTO announcements (author_name, message) VALUES (${me.name}, ${message})`;
  await logActivity(me, 'announced');
  return NextResponse.json({ ok: true }, { status: 201 });
}
