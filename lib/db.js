import { neon } from '@neondatabase/serverless';

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }
  return neon(process.env.DATABASE_URL);
}

export async function getActiveProducts() {
  const sql = getDb();
  return sql`
    SELECT id, name, slug, default_rate, image_url, pin_rule
    FROM products
    WHERE is_active = true
    ORDER BY sort_order ASC, id ASC
  `;
}

export async function getActiveBanks() {
  const sql = getDb();
  return sql`
    SELECT id, name, code
    FROM banks
    WHERE is_active = true
    ORDER BY sort_order ASC, id ASC
  `;
}

export async function getServiceSettings() {
  const sql = getDb();
  const rows = await sql`SELECT setting_key, setting_value FROM service_settings`;
  const map = Object.fromEntries(rows.map(r => [r.setting_key, r.setting_value]));
  return {
    minimumOrderAmount: Number(map.minimum_order_amount || 10000),
    transferFee: Number(map.transfer_fee || 500),
    rateNotice: map.rate_notice || '매입률은 매일 업데이트 해드리고 있습니다',
    liveOrderLimit: Math.min(30, Math.max(1, Number(map.live_order_limit || 8))),
  };
}

export async function getLiveOrders(limit = 8) {
  const sql = getDb();
  return sql`
    SELECT
      o.order_no,
      o.customer_name,
      o.requested_amount,
      o.expected_amount,
      o.status,
      o.created_at,
      COALESCE(string_agg(DISTINCT p.name, ', ' ORDER BY p.name), '상품권') AS product_names,
      COUNT(oi.id)::int AS item_count
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN products p ON p.id = oi.product_id
    WHERE o.deleted_at IS NULL
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT ${limit}
  `;
}
