import { NextResponse } from 'next/server';
import { adminCookieName } from '../../../../lib/admin-auth';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookieName(), '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 });
  return res;
}
