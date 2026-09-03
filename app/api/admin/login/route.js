import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { adminCookieName, adminSessionMaxAge, makeAdminSession } from '../../../../lib/admin-auth';

export async function POST(request) {
  try {
    const { password } = await request.json();
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) return NextResponse.json({ message: '관리자 비밀번호 설정이 필요합니다.' }, { status: 500 });
    const a = Buffer.from(String(password || ''));
    const b = Buffer.from(String(expected));
    const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
    if (!ok) return NextResponse.json({ message: '관리자 비밀번호가 올바르지 않습니다.' }, { status: 401 });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(adminCookieName(), makeAdminSession(), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: adminSessionMaxAge(),
    });
    return res;
  } catch {
    return NextResponse.json({ message: '로그인 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
