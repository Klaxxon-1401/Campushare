import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import { sendEmail } from './email';

/**
 * Email OTP lifecycle for campus verification (PROJECT_PLAN §11.1).
 *
 * Codes are stored hashed (SHA-256 of "email:code"), single-use, time-limited,
 * attempt-limited, and rate-limited by a per-email resend cooldown.
 * State is in-memory for now — it moves to the database with the store.
 */

const TTL_MS = Math.max(1, Number(process.env.OTP_TTL_MINUTES ?? 10)) * 60_000;
const COOLDOWN_MS = Math.max(1, Number(process.env.OTP_RESEND_COOLDOWN_SECONDS ?? 60)) * 1000;
const MAX_ATTEMPTS = Math.max(1, Number(process.env.OTP_MAX_ATTEMPTS ?? 5));

interface OtpRecord {
  codeHash: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
}

const records = new Map<string, OtpRecord>();

const key = (email: string): string => email.trim().toLowerCase();
const hashCode = (email: string, code: string): string =>
  createHash('sha256').update(`${key(email)}:${code}`).digest('hex');

export type IssueResult =
  | { ok: true; code: string; expiresInMinutes: number }
  | { ok: false; reason: 'cooldown'; retryAfterSeconds: number };

export const issueOtp = async (email: string, name?: string): Promise<IssueResult> => {
  const k = key(email);
  const now = Date.now();
  const existing = records.get(k);

  if (existing && now - existing.lastSentAt < COOLDOWN_MS) {
    return {
      ok: false,
      reason: 'cooldown',
      retryAfterSeconds: Math.ceil((COOLDOWN_MS - (now - existing.lastSentAt)) / 1000),
    };
  }

  // 6-digit code, uniform, cryptographically random.
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  records.set(k, {
    codeHash: hashCode(email, code),
    expiresAt: now + TTL_MS,
    attempts: 0,
    lastSentAt: now,
  });

  const minutes = Math.round(TTL_MS / 60_000);
  const greeting = name ? `Hi ${name},` : 'Hi,';
  try {
    await sendEmail({
      to: email,
      subject: 'Your CampusShare verification code',
      text: `${greeting} your CampusShare verification code is ${code}. It expires in ${minutes} minutes.`,
      html: [
        `<p>${greeting}</p>`,
        `<p>Your CampusShare verification code is:</p>`,
        `<p style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</p>`,
        `<p>This code expires in ${minutes} minutes. If you didn't request it, you can ignore this email.</p>`,
      ].join(''),
    });
  } catch (error) {
    // Don't leave a record behind if delivery failed — let the user retry immediately.
    records.delete(k);
    throw error;
  }

  return { ok: true, code, expiresInMinutes: minutes };
};

export type VerifyResult = 'ok' | 'expired' | 'invalid' | 'too_many';

export const verifyOtp = (email: string, code: string): VerifyResult => {
  const k = key(email);
  const record = records.get(k);
  if (!record) return 'expired';
  if (Date.now() > record.expiresAt) {
    records.delete(k);
    return 'expired';
  }
  if (record.attempts >= MAX_ATTEMPTS) return 'too_many';

  const expected = Buffer.from(record.codeHash, 'hex');
  const provided = Buffer.from(hashCode(email, code), 'hex');
  if (expected.length === provided.length && timingSafeEqual(expected, provided)) {
    records.delete(k);
    return 'ok';
  }

  record.attempts += 1;
  return 'invalid';
};

export const clearOtp = (email: string): void => {
  records.delete(key(email));
};

/** Test helper. */
export const __resetOtps = (): void => {
  records.clear();
};
