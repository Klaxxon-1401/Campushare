import { randomBytes, scrypt, scryptSync, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

/**
 * Password hashing with Node's built-in scrypt (no native dependencies).
 * Stored format:  scrypt$<salt hex>$<hash hex>
 */

const KEYLEN = 64;
const scryptAsync = promisify(scrypt) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number
) => Promise<Buffer>;

const FORMAT = /^scrypt\$([0-9a-f]+)\$([0-9a-f]+)$/;

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16).toString('hex');
  const derived = await scryptAsync(password, salt, KEYLEN);
  return `scrypt$${salt}$${derived.toString('hex')}`;
};

export const verifyPassword = async (password: string, stored: string): Promise<boolean> => {
  const match = FORMAT.exec(stored);
  if (!match) return false;
  const [, salt, hash] = match;
  const expected = Buffer.from(hash, 'hex');
  const derived = await scryptAsync(password, salt, KEYLEN);
  // Constant-time compare; lengths must match before timingSafeEqual.
  return derived.length === expected.length && timingSafeEqual(derived, expected);
};

/** Synchronous variant — used only to seed demo users at module load. */
export const hashPasswordSync = (password: string): string => {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, KEYLEN);
  return `scrypt$${salt}$${derived.toString('hex')}`;
};
