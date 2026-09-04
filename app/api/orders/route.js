import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getDb, getServiceSettings } from '../../../lib/db';
import { encryptText, hashPassword } from '../../../lib/secure';

export const dynamic = 'force-dynamic';

const MAX_ITEMS_PER_ORDER = 20;
const MAX_PIN_LENGTH = 64;
const BLOCKING_ORDER_STATUSES = ['received', 'reviewing', 'checking', 'completed', 'paid'];

function makeOrderNo() {
  const d = new Date();
  const p = (n, w=2) => String(n).padStart(w, '0');
  const stamp = `${d.getUTCFullYear()}${p(d.getUTCMonth()+1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`;
  const rand = crypto.randomUUID().replace(/-/g,'').slice(0,8).toUpperCase();
  return `${stamp}${rand}`;
}

function makePinHash(productId, pin) {
  return crypto.createHash('sha256').update(`${productId}:${pin}`, 'utf8').digest('hex');
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerName, phone, bankId, accountNumber, password, items } = body || {};

    if (!customerName || !phone || !bankId || !accountNumber || !password || !Array.isArray(items) || !items.length) {
      return NextResponse.json({ message: '필수 신청정보를 확인해 주세요.' }, { status: 400 });
    }
    if (items.length > MAX_ITEMS_PER_ORDER) {
      return NextResponse.json({ message: `상품권은 한 번에 최대 ${MAX_ITEMS_PER_ORDER}개까지 접수할 수 있습니다.` }, { status: 400 });
    }
    if (String(password).length > 10) {
      return NextResponse.json({ message: '조회 비밀번호는 최대 10자리입니다.' }, { status: 400 });
    }

    const customer = String(customerName).trim();
    if (!customer || customer.length > 30) {
      return NextResponse.json({ message: '고객명(예금주)을 확인해 주세요.' }, { status: 400 });
    }

    const settings = await getServiceSettings();
    const sql = getDb();
    const numericBankId = Number(bankId);
    if (!Number.isInteger(numericBankId) || numericBankId <= 0) {
      return NextResponse.json({ message: '은행을 다시 선택해 주세요.' }, { status: 400 });
    }

    const banks = await sql`SELECT id FROM banks WHERE id=${numericBankId} AND is_active=true LIMIT 1`;
    if (!banks.length) {
      return NextResponse.json({ message: '현재 이용할 수 없는 은행입니다. 다시 선택해 주세요.' }, { status: 400 });
    }

    const ids = [...new Set(items.map(x => Number(x.productId)).filter(Boolean))];
    const products = await sql`SELECT id, name, slug, default_rate FROM products WHERE is_active=true AND id = ANY(${ids})`;
    const map = new Map(products.map(p => [Number(p.id), p]));
    const seenPins = new Set();
    let requested = 0;
    let expectedGross = 0;
    const normalized = [];

    for (const item of items) {
      const p = map.get(Number(item.productId));
      const face = Number(item.faceValue);
      const pin = String(item.pin || '').replace(/\s|-/g,'');
      if (!p || !pin || pin.length > MAX_PIN_LENGTH || !Number.isInteger(face) || face <= 0) {
        return NextResponse.json({ message: '상품권 정보를 다시 확인해 주세요.' }, { status: 400 });
      }
      const duplicateKey = `${p.id}:${pin}`;
      if (seenPins.has(duplicateKey)) {
        return NextResponse.json({ message: '같은 상품권 PIN 번호가 중복 입력되어 있습니다.' }, { status: 400 });
      }
      seenPins.add(duplicateKey);

      if (p.slug === 'lotte-mobile' && !pin.startsWith('23')) {
        return NextResponse.json({ message: "23으로 시작하는 '롯데 모바일 교환권'만 매입합니다" }, { status: 400 });
      }
      const rate = Number(p.default_rate);
      const itemExpected = Math.floor(face * rate / 100);
      const pinHash = makePinHash(Number(p.id), pin);
      requested += face;
      expectedGross += itemExpected;
      normalized.push({ productId: Number(p.id), pin, pinHash, face, rate, itemExpected });
    }

    const pinHashes = normalized.map((item) => item.pinHash);
    const duplicates = await sql`
      SELECT oi.pin_hash
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE oi.pin_hash = ANY(${pinHashes})
        AND o.deleted_at IS NULL
        AND o.status = ANY(${BLOCKING_ORDER_STATUSES})
      LIMIT 1
    `;
    if (duplicates.length) {
      return NextResponse.json({ message: '이미 정상 접수된 상품권 PIN입니다. 기존 접수내역을 확인해 주세요.' }, { status: 409 });
    }

    if (requested < settings.minimumOrderAmount) {
      return NextResponse.json({ message: `최소 판매금액은 ${settings.minimumOrderAmount.toLocaleString()}원 이상 입니다` }, { status: 400 });
    }

    const expected = Math.max(0, expectedGross - settings.transferFee);
    const orderNo = makeOrderNo();
    const phoneDigits = String(phone).replace(/[^0-9]/g,'');
    const accountDigits = String(accountNumber).replace(/[^0-9]/g,'');
    if (phoneDigits.length < 10 || phoneDigits.length > 11 || accountDigits.length < 8 || accountDigits.length > 20) {
      return NextResponse.json({ message: '연락처 또는 계좌번호를 확인해 주세요.' }, { status: 400 });
    }

    const inserted = await sql`
      INSERT INTO orders (order_no, customer_name, phone_encrypted, phone_last4, bank_id, account_number_encrypted, account_holder, requested_amount, expected_amount, status, lookup_password_hash)
      VALUES (${orderNo}, ${customer}, ${encryptText(phoneDigits)}, ${phoneDigits.slice(-4)}, ${numericBankId}, ${encryptText(accountDigits)}, ${customer}, ${requested}, ${expected}, 'received', ${hashPassword(password)})
      RETURNING id
    `;
    const orderId = inserted[0].id;

    for (const item of normalized) {
      await sql`
        INSERT INTO order_items (order_id, product_id, pin_encrypted, pin_hash, pin_last4, face_value, rate_percent, expected_amount, item_status)
        VALUES (${orderId}, ${item.productId}, ${encryptText(item.pin)}, ${item.pinHash}, ${item.pin.slice(-4)}, ${item.face}, ${item.rate}, ${item.itemExpected}, 'received')
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
