import { NextResponse } from 'next/server';
import { encryptText } from '../../../lib/secure';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sample = encryptText('health-check');
    return NextResponse.json({ ok: true, encryption: sample.includes('.') ? 'ready' : 'invalid' });
  } catch (error) {
    console.error('Security health check failed', error);
    return NextResponse.json({ ok: false, encryption: 'not-ready' }, { status: 500 });
  }
}
