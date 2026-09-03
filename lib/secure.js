import crypto from 'crypto';

function getKey() {
  const raw = process.env.APP_ENCRYPTION_KEY;
  if (!raw) throw new Error('APP_ENCRYPTION_KEY is not configured');
  if (!/^[a-fA-F0-9]{64}$/.test(raw)) throw new Error('APP_ENCRYPTION_KEY must be 64 hex characters');
  return Buffer.from(raw, 'hex');
}

export function encryptText(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64url'), tag.toString('base64url'), encrypted.toString('base64url')].join('.');
}

export function decryptText(value) {
  const [ivPart, tagPart, encryptedPart] = String(value || '').split('.');
  if (!ivPart || !tagPart || !encryptedPart) return '';
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivPart, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, 'base64url')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

export function hashPassword(value) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(String(value), salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}
