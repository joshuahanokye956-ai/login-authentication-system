import { sql, ensureSchema } from './db';

const KEEP = 30; // newest backups kept

// Saves a full snapshot (members, activity, announcements) as a row in the "backups" table.
export async function runBackup() {
  await ensureSchema();
  const users = await sql`SELECT * FROM users ORDER BY id`;
  const activity = await sql`SELECT * FROM activity ORDER BY id`;
  const announcements = await sql`SELECT * FROM announcements ORDER BY id`;
  const snapshot = JSON.stringify({ createdAt: new Date().toISOString(), users, activity, announcements });
  const [row] = await sql`INSERT INTO backups (user_count, data) VALUES (${users.length}, ${snapshot}::jsonb) RETURNING id`;
  await sql`DELETE FROM backups WHERE id NOT IN (SELECT id FROM backups ORDER BY id DESC LIMIT ${KEEP})`;
  return row.id;
}
