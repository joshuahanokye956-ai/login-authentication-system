import { neon } from '@neondatabase/serverless';
export const sql = neon(process.env.DATABASE_URL);
let ready = false;
export async function ensure() {
  if (ready) return;
  await sql`CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
    salt TEXT NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'user',
    totp_secret TEXT NOT NULL, totp_enrolled BOOLEAN NOT NULL DEFAULT false,
    is_deleted BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ DEFAULT now())`;
  ready = true;
}
