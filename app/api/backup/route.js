import { put } from '@vercel/blob';
import { sql } from '@/lib/db';
import { session, json } from '@/lib/auth';
async function run() {
  const rows = await sql`SELECT * FROM users ORDER BY id`;
  // NOTE: backup holds password hashes; use a private Blob store if your plan offers one.
  const b = await put(`backups/backup-${new Date().toISOString()}.json`, JSON.stringify(rows, null, 2), { access: 'public', addRandomSuffix: true, contentType: 'application/json' });
  return b.url;
}
export async function POST() {
  if ((await session())?.role !== 'admin') return json({ error: 'Admins only' }, 403);
  try { await run(); return json({ message: 'Backup completed' }); } catch { return json({ error: 'Backup failed' }, 500); }
}
export async function GET(req) { // Vercel Cron
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return json({ error: 'Unauthorized' }, 401);
  return json({ url: await run() });
}
