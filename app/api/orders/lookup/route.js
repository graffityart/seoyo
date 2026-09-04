import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { verifyPassword } from '../../../../lib/secure';

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
    const orderNo = String(body?.orderNo || '').trim().toUpperCase();
    const password = String(body?.password || '');

    if (!orderNo || !password) {
      return NextResponse.json({ message: '접수번호와 조회 비밀번호를 입력해 주세요.' }, { status: 400 });
    }
    if (orderNo.length > 40 || password.length > 10) {
      return NextResponse.json({ message: '조회 정보를 다시 확인해 주세요.' }, { status: 400 });
    }

    const sql = getDb();
    const rows = await sql`
      SELECT id, order_no, requested_amount, expected_amount, paid_amount, status, lookup_password_hash, created_at, updated_at
      FROM orders
      WHERE order_no = ${orderNo} AND deleted_at IS NULL
      LIMIT 1
    `;
    const order = rows[0];

    if (!order || !verifyPassword(password, order.lookup_password_hash)) {
      return NextResponse.json({ message: '접수번호 또는 조회 비밀번호가 일치하지 않습니다.' }, { status: 404 });
    }

    const items = await sql`
      SELECT p.name AS product_name, oi.face_value, oi.rate_percent, oi.expected_amount, oi.item_status
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ${order.id}
      ORDER BY oi.id ASC
    `;

    return NextResponse.json({
      ok: true,
      order: {
        orderNo: order.order_no,
        requestedAmount: Number(order.requested_amount || 0),
        expectedAmount: Number(order.expected_amount || 0),
        paidAmount: Number(order.paid_amount || 0),
        status: order.status,
        statusLabel: statusLabel[order.status] || '처리중',
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        items: items.map((item) => ({
          productName: item.product_name,
          faceValue: Number(item.face_value || 0),
          ratePercent: Number(item.rate_percent || 0),
          expectedAmount: Number(item.expected_amount || 0),
          status: item.item_status,
        })),
      },
    });
  } catch (error) {
    console.error('Order lookup failed', error);
    return NextResponse.json({ message: '주문 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
