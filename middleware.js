import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
const need = { '/admin': 'admin', '/staff': 'staff', '/dashboard': 'user' };
export async function middleware(req) {
  const base = '/' + req.nextUrl.pathname.split('/')[1];
  let role = null;
  try {
    const t = req.cookies.get('session')?.value;
    role = (await jwtVerify(t, new TextEncoder().encode(process.env.JWT_SECRET))).payload.role;
  } catch {}
  if (role !== need[base]) return NextResponse.redirect(new URL(role ? '/' + (role === 'user' ? 'dashboard' : role) : '/login', req.url));
}
export const config = { matcher: ['/admin/:path*', '/staff/:path*', '/dashboard/:path*'] };
