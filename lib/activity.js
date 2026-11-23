import { sql } from './db';

export async function logActivity(actor, action, target = '', detail = '') {
  try {
    await sql`INSERT INTO activity (actor_id, actor_name, action, target_name, detail) VALUES (${actor.id}, ${actor.name}, ${action}, ${target}, ${detail})`;
  } catch (err) { console.error('Activity log failed', err); }
}
