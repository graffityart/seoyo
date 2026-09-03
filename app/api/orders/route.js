import { NextResponse } from 'next/server';
import { getDb, getServiceSettings } from '../../../lib/db';
import { encryptText, hashPassword } from '../../../lib/secure';

export const dynamic = 'force-dynamic';

function makeOrderNo() {
  const d = new Date();
  const p = (n, w=2) => String(n).padStart(w, '0');
  const stamp = `${d.getUTCFullYear()}${p(d.getUTCMonth()+1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`;
  const rand = crypto.randomUUID().replace(/-/g,'').slice(0,8).toUpperCase();
  return `${stamp}${rand}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerName, phone, bankId, accountNumber, password, items } = body || {};
    if (!customerName || !phone || !bankId || !accountNumber || !password || !Array.isArray(items) || !items.length) {
      return NextResponse.json({ message: '필수 신청정보를 확인해 주세요.' }, { status: 400 });
    }
    if (String(password).length > 10) return NextResponse.json({ message: '조회 비밀번호는 최대 10자리입니다.' }, { status: 400 });
    const [settings] = await Promise.all([getServiceSettings()]);
    const sql = getDb();
    const ids = items.map(x => Number(x.productId)).filter(Boolean);
    const products = await sql`SELECT id, name, slug, default_rate FROM products WHERE is_active=true AND id = ANY(${ids})`;
    const map = new Map(products.map(p => [Number(p.id), p]));
    let requested = 0;
    let expectedGross = 0;
    const normalized = [];
    for (const item of items) {
      const p = map.get(Number(item.productId));
      const face = Number(item.faceValue);
      const pin = String(item.pin || '').replace(/\s|-/g,'');
      if (!p || !pin || !Number.isInteger(face) || face <= 0) return NextResponse.json({ message: '상품권 정보를 다시 확인해 주세요.' }, { status: 400 });
      if (p.slug === 'lotte-mobile' && !pin.startsWith('23')) return NextResponse.json({ message: "23으로 시작하는 '롯데 모바일 교환권'만 매입합니다" }, { status: 400 });
      const rate = Number(p.default_rate);
      const itemExpected = Math.floor(face * rate / 100);
      requested += face; expectedGross += itemExpected;
      normalized.push({ productId: Number(p.id), pin, face, rate, itemExpected });
    }
    if (requested < settings.minimumOrderAmount) return NextResponse.json({ message: `최소 판매금액은 ${settings.minimumOrderAmount.toLocaleString()}원 이상 입니다` }, { status: 400 });
    const expected = Math.max(0, expectedGross - settings.transferFee);
    const orderNo = makeOrderNo();
    const phoneDigits = String(phone).replace(/[^0-9]/g,'');
    const accountDigits = String(accountNumber).replace(/[^0-9]/g,'');
    if (phoneDigits.length < 10 || accountDigits.length < 8) return NextResponse.json({ message: '연락처 또는 계좌번호를 확인해 주세요.' }, { status: 400 });

    const inserted = await sql`
      INSERT INTO orders (order_no, customer_name, phone_encrypted, phone_last4, bank_id, account_number_encrypted, account_holder, requested_amount, expected_amount, status, lookup_password_hash)
      VALUES (${orderNo}, ${String(customerName).trim()}, ${encryptText(phoneDigits)}, ${phoneDigits.slice(-4)}, ${Number(bankId)}, ${encryptText(accountDigits)}, ${String(customerName).trim()}, ${requested}, ${expected}, 'received', ${hashPassword(password)})
      RETURNING id
    `;
    const orderId = inserted[0].id;
    for (const item of normalized) {
      await sql`
        INSERT INTO order_items (order_id, product_id, pin_encrypted, pin_last4, face_value, rate_percent, expected_amount, item_status)
        VALUES (${orderId}, ${item.productId}, ${encryptText(item.pin)}, ${item.pin.slice(-4)}, ${item.face}, ${item.rate}, ${item.itemExpected}, 'received')
      `;
    }
    await sql`INSERT INTO order_history (order_id, new_status, changed_by, reason) VALUES (${orderId}, 'received', 'system', '신규 상품권 교환 신청')`;
    return NextResponse.json({ ok: true, orderNo, expectedAmount: expected });
  } catch (error) {
    console.error('Order create failed', error);
    const setup = String(error?.message || '').includes('APP_ENCRYPTION_KEY');
    return NextResponse.json({ message: setup ? '보안키 설정이 필요합니다.' : '신청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
