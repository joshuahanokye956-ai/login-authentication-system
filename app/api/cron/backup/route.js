import { NextResponse } from 'next/server';
import { runBackup } from '@/lib/backup';

export const dynamic = 'force-dynamic';

// Vercel Cron calls this with "Authorization: Bearer <CRON_SECRET>".
export async function GET(req) {
  if (!process.env.CRON_SECRET || req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, id: await runBackup() });
  } catch (err) {
    console.error('Scheduled backup failed', err);
    return NextResponse.json({ error: 'Backup failed' }, { status: 500 });
  }
}
