import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { decryptText, verifyPassword } from '../../../../lib/secure';

export const dynamic = 'force-dynamic';

const statusLabel = {
  received: '접수중',
  reviewing: '확인중',
  checking: '확인중',
  completed: '입금완료',
  paid: '입금완료',
  impossible: '처리불가',
  rejected: '처리불가',
};

export async function POST(request) {
  try {
    const body = await request.json();
    const phone = String(body?.phone || '').replace(/[^0-9]/g, '');
    const password = String(body?.password || '');

    if (!phone || !password) {
      return NextResponse.json({ message: '접수 시 입력한 전화번호와 조회 비밀번호를 입력해 주세요.' }, { status: 400 });
    }
    if (phone.length < 10 || phone.length > 11 || password.length > 10) {
      return NextResponse.json({ message: '조회 정보를 다시 확인해 주세요.' }, { status: 400 });
    }

    const sql = getDb();
    const candidates = await sql`
      SELECT id, order_no, phone_encrypted, requested_amount, expected_amount, paid_amount,
             status, lookup_password_hash, created_at, updated_at
      FROM orders
      WHERE phone_last4 = ${phone.slice(-4)}
        AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 50
    `;

    const matched = candidates.filter((order) => {
      try {
        return decryptText(order.phone_encrypted) === phone && verifyPassword(password, order.lookup_password_hash);
      } catch {
        return false;
      }
    });

    if (!matched.length) {
      return NextResponse.json({ message: '전화번호 또는 조회 비밀번호가 일치하지 않습니다.' }, { status: 404 });
    }

    const orderIds = matched.map((order) => order.id);
    const itemRows = await sql`
      SELECT oi.order_id, p.name AS product_name, oi.face_value, oi.rate_percent,
             oi.expected_amount, oi.item_status
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ANY(${orderIds})
      ORDER BY oi.order_id DESC, oi.id ASC
    `;

    const itemsByOrder = new Map();
    for (const item of itemRows) {
      const key = Number(item.order_id);
      if (!itemsByOrder.has(key)) itemsByOrder.set(key, []);
      itemsByOrder.get(key).push({
        productName: item.product_name,
        faceValue: Number(item.face_value || 0),
        ratePercent: Number(item.rate_percent || 0),
        expectedAmount: Number(item.expected_amount || 0),
        status: item.item_status,
      });
    }

    return NextResponse.json({
      ok: true,
      orders: matched.map((order) => ({
        orderNo: order.order_no,
        requestedAmount: Number(order.requested_amount || 0),
        expectedAmount: Number(order.expected_amount || 0),
        paidAmount: Number(order.paid_amount || 0),
        status: order.status,
        statusLabel: statusLabel[order.status] || '처리중',
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        items: itemsByOrder.get(Number(order.id)) || [],
      })),
    });
  } catch (error) {
    console.error('Order lookup failed', error);
    return NextResponse.json({ message: '주문 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
