import bcrypt from 'bcryptjs';
import { createHmac, randomBytes } from 'crypto';

// password -> HMAC-SHA256(pepper, salt + password) -> bcrypt (adds its own salt + work factor)
function peppered(password, salt) {
  if (!process.env.PEPPER) throw new Error('PEPPER is not set');
  return createHmac('sha256', process.env.PEPPER).update(salt + password).digest('base64');
}
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await bcrypt.hash(peppered(password, salt), 12);
  return { salt, hash };
}
export const verifyPassword = (password, salt, hash) => bcrypt.compare(peppered(password, salt), hash);
