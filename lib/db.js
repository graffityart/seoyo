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
