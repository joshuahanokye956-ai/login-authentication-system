import { sql } from '@/lib/db';
import { session, json } from '@/lib/auth';
export async function PATCH(req, { params }) {
  const s = await session();
  if (s?.role !== 'admin') return json({ error: 'Admins only' }, 403);
  const id = +params.id, b = await req.json();
  if (b.role) {
    if (!['user', 'staff'].includes(b.role) || id === s.id) return json({ error: 'Not allowed' }, 400);
    await sql`UPDATE users SET role=${b.role} WHERE id=${id}`;
  }
  if (b.restore) await sql`UPDATE users SET is_deleted=false WHERE id=${id}`;
  return json({ ok: true });
}
export async function DELETE(_, { params }) {
  const s = await session();
  if (!['staff', 'admin'].includes(s?.role)) return json({ error: 'Not allowed' }, 403);
  await sql`UPDATE users SET is_deleted=true WHERE id=${+params.id} AND role='user'`;
  return json({ ok: true });
}
