import { neon } from '@neondatabase/serverless';
import { hashPassword } from './password';

export const sql = (...args) => neon(process.env.DATABASE_URL)(...args);

let ready;
export function ensureSchema() {
  ready ??= (async () => {
    await sql`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin','staff','user')),
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      totp_secret TEXT,
      totp_enabled BOOLEAN NOT NULL DEFAULT false,
      failed_attempts INT NOT NULL DEFAULT 0,
      locked_until TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      deleted_at TIMESTAMPTZ,
      deleted_by INT
    )`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS prev_login_at TIMESTAMPTZ`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ`;
    await sql`CREATE TABLE IF NOT EXISTS activity (
      id SERIAL PRIMARY KEY, actor_id INT, actor_name TEXT NOT NULL, action TEXT NOT NULL,
      target_name TEXT NOT NULL DEFAULT '', detail TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS announcements (
      id SERIAL PRIMARY KEY, author_name TEXT NOT NULL, message TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS backups (
      id SERIAL PRIMARY KEY, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), user_count INT NOT NULL, data JSONB NOT NULL
    )`;
    const { ADMIN_EMAIL: email, ADMIN_PASSWORD: password } = process.env;
    if (email && password) {
      const admins = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`;
      if (!admins.length) {
        const { salt, hash } = await hashPassword(password);
        await sql`INSERT INTO users (name, email, role, password_hash, salt)
                  VALUES ('Administrator', ${email.trim().toLowerCase()}, 'admin', ${hash}, ${salt})
                  ON CONFLICT (email) DO NOTHING`;
      }
    }
  })().catch((err) => { ready = undefined; throw err; });
  return ready;
}
