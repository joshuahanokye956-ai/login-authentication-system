import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { sql, ensureSchema } from './db';

export async function runBackup() {
  await ensureSchema();
  const users = await sql`SELECT * FROM users ORDER BY id`;
  const activity = await sql`SELECT * FROM activity ORDER BY id`;
  const announcements = await sql`SELECT * FROM announcements ORDER BY id`;
  const now = new Date().toISOString();
  const key = `backups/backup-${now.replace(/[:.]/g, '-')}.json`;
  const s3 = new S3Client({
    region: process.env.BACKUP_AWS_REGION,
    credentials: { accessKeyId: process.env.BACKUP_AWS_ACCESS_KEY_ID, secretAccessKey: process.env.BACKUP_AWS_SECRET_ACCESS_KEY },
  });
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET, Key: key, ContentType: 'application/json', ServerSideEncryption: 'AES256',
    Body: JSON.stringify({ createdAt: now, users, activity, announcements }, null, 2),
  }));
  return key;
}
