import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const jar = await cookies();
  jar.delete('session');
  jar.delete('pending');
  return NextResponse.json({ ok: true });
}
