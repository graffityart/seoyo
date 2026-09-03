import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT count(*)::int AS products FROM products WHERE is_active = true`;
    return NextResponse.json({ ok: true, products: rows[0]?.products ?? 0 });
  } catch (error) {
    console.error('DB health check failed', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
