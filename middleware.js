import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Coarse gate: a valid session cookie is required. Role checks happen on the
// server against the database, so a stale cookie can never grant access.
export async function middleware(req) {
  try {
    await jwtVerify(req.cookies.get('session')?.value ?? '', new TextEncoder().encode(process.env.JWT_SECRET));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}
export const config = { matcher: ['/admin/:path*', '/staff/:path*', '/user/:path*', '/change-password'] };
