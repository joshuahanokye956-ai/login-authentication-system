import { NextResponse } from 'next/server';
import { requireApi } from '@/lib/session';
import { runBackup } from '@/lib/backup';

export async function POST() {
  if (!(await requireApi('admin'))) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  try {
    return NextResponse.json({ ok: true, id: await runBackup() });
  } catch (err) {
    console.error('Backup failed', err);
    return NextResponse.json({ error: 'Backup failed. Please try again.' }, { status: 500 });
  }
}
