import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'sayo_admin';
const SESSION_SECONDS = 60 * 60 * 12;

function secretKey() {
  const raw = process.env.APP_ENCRYPTION_KEY;
  if (!raw || !/^[a-fA-F0-9]{64}$/.test(raw)) throw new Error('APP_ENCRYPTION_KEY is not configured');
  return Buffer.from(raw, 'hex');
}

function sign(payload) {
  return crypto.createHmac('sha256', secretKey()).update(payload).digest('base64url');
}

export function makeAdminSession() {
  const payload = Buffer.from(JSON.stringify({ role: 'admin', exp: Math.floor(Date.now()/1000) + SESSION_SECONDS })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSession(token) {
  try {
    if (!token) return false;
    const [payload, sig] = String(token).split('.');
    if (!payload || !sig) return false;
    const expected = sign(payload);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a,b)) return false;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.role === 'admin' && Number(data.exp) > Math.floor(Date.now()/1000);
  } catch { return false; }
}

export async function isAdmin() {
  const store = await cookies();
  return verifyAdminSession(store.get(COOKIE_NAME)?.value);
}

export function adminCookieName() { return COOKIE_NAME; }
export function adminSessionMaxAge() { return SESSION_SECONDS; }
