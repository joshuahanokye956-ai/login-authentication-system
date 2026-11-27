import { sql } from '@/lib/db';
import { session, json } from '@/lib/auth';
export async function GET() {
  const s = await session();
  if (!s) return json({ error: 'Unauthorized' }, 401);
  if (s.role === 'admin') return json(await sql`SELECT id,name,email,role,salt,password_hash,is_deleted,created_at FROM users ORDER BY id`);
  if (s.role === 'staff') return json(await sql`SELECT id,name,email,created_at FROM users WHERE role='user' AND is_deleted=false ORDER BY id`);
  return json(await sql`SELECT id,name,email,role,created_at FROM users WHERE id=${s.id}`);
}
