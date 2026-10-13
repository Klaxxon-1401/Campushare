import { Request, Response } from 'express';
import { z } from 'zod';
import { store, toPublicUser } from '../data/store';
import { hashPassword, hashPasswordSync, verifyPassword } from '../services/passwords';
import { signToken } from '../services/tokens';
import { issueOtp, verifyOtp } from '../services/otp';
import { AuthedRequest } from '../middleware/auth';
import { UserRecord } from '../types';

// Campus email domains — must match the institutional allowlist (PROJECT_PLAN §11.1)
const CAMPUS_DOMAINS = (process.env.CAMPUS_DOMAINS || 'university.edu,student.university.edu')
  .split(',')
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

const isCampusEmail = (email: string): boolean =>
  CAMPUS_DOMAINS.includes(email.split('@')[1]?.toLowerCase() ?? '');

const campusEmail = z
  .string()
  .email()
  .refine(isCampusEmail, { message: 'Registration requires a campus email address' });

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: campusEmail,
  studentId: z.string().trim().regex(/^[A-Za-z0-9]{5,15}$/, 'Student ID must be 5-15 alphanumeric characters'),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

const emailOnlySchema = z.object({ email: campusEmail });
const confirmSchema = z.object({ email: campusEmail, otp: z.string().regex(/^\d{6}$/, 'Code must be 6 digits') });

const DEV = process.env.NODE_ENV !== 'production';

/** Constant-time-ish guard so a missing account isn't obvious from response time. */
const DUMMY_HASH = hashPasswordSync('timing-equalizer-not-a-real-password');

const fail = (res: Response, status: number, code: string, message: string, extra?: object) =>
  res.status(status).json({ error: { code, message, ...extra } });

// POST /auth/register
export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, 400, 'VALIDATION_ERROR', 'Invalid registration details', { details: parsed.error.issues });
  }
  const { email, studentId, password } = parsed.data;
  const normalized = email.trim().toLowerCase();
  const name = parsed.data.name ?? normalized.split('@')[0];

  if (store.findUserByEmail(normalized)) {
    return fail(res, 409, 'EMAIL_IN_USE', 'An account with this email already exists');
  }

  const user = store.createUser({
    name,
    email: normalized,
    studentId,
    passwordHash: await hashPassword(password),
    verificationStatus: 'pending',
  });

  let otpSent = false;
  let devCode: string | undefined;
  try {
    const issue = await issueOtp(user.email, user.name);
    if (issue.ok) {
      otpSent = true;
      devCode = issue.code;
    }
  } catch (error) {
    console.error('[auth] verification email failed:', (error as Error).message);
  }

  return res.status(201).json({
    userId: user.id,
    email: user.email,
    verificationStatus: user.verificationStatus,
    otpSent,
    message: otpSent
      ? 'Verification code sent to your campus email.'
      : 'Account created, but the verification email could not be sent. Use resend.',
    ...(DEV && devCode ? { devCode } : {}),
  });
};

// POST /auth/login
export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, 400, 'VALIDATION_ERROR', 'Email and password are required');
  }
  const { email, password } = parsed.data;
  const user = store.findUserByEmail(email);
  const passwordOk = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !passwordOk) {
    return fail(res, 401, 'INVALID_CREDENTIALS', 'Incorrect email or password');
  }
  if (user.verificationStatus !== 'verified') {
    return fail(res, 403, 'NOT_VERIFIED', 'Verify your campus email to continue', {
      verificationStatus: user.verificationStatus,
    });
  }
  return res.json({ token: signToken(user), user: toPublicUser(user) });
};

// GET /auth/me  (requireAuth)
export const me = (req: Request, res: Response) => {
  const user = (req as AuthedRequest).user as UserRecord;
  return res.json({ user: toPublicUser(user) });
};

// POST /auth/verify/start
export const startVerification = async (req: Request, res: Response) => {
  const parsed = emailOnlySchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, 400, 'VALIDATION_ERROR', 'A valid campus email is required');
  }
  const user = store.findUserByEmail(parsed.data.email);

  // Don't reveal whether an account exists.
  if (!user) {
    return res.json({ message: 'If that account exists, a verification code has been sent.' });
  }
  if (user.verificationStatus === 'verified') {
    return res.json({ message: 'This account is already verified.' });
  }

  let issue;
  try {
    issue = await issueOtp(user.email, user.name);
  } catch (error) {
    console.error('[auth] verification email failed:', (error as Error).message);
    return fail(res, 502, 'EMAIL_FAILED', 'Could not send the verification email. Please try again.');
  }

  if (!issue.ok) {
    return fail(res, 429, 'RESEND_COOLDOWN', `Please wait ${issue.retryAfterSeconds}s before requesting another code.`, {
      retryAfterSeconds: issue.retryAfterSeconds,
    });
  }

  return res.json({
    message: 'Verification code sent.',
    expiresInMinutes: issue.expiresInMinutes,
    ...(DEV ? { devCode: issue.code } : {}),
  });
};

// POST /auth/verify/confirm
export const confirmVerification = async (req: Request, res: Response) => {
  const parsed = confirmSchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, 400, 'VALIDATION_ERROR', 'A campus email and 6-digit code are required');
  }
  const { email, otp } = parsed.data;
  const user = store.findUserByEmail(email);
  if (!user) {
    return fail(res, 404, 'NOT_FOUND', 'No account found for that email');
  }

  const result = verifyOtp(user.email, otp);
  if (result === 'expired') {
    return fail(res, 400, 'OTP_EXPIRED', 'That code is invalid or has expired. Request a new one.');
  }
  if (result === 'too_many') {
    return fail(res, 429, 'OTP_TOO_MANY_ATTEMPTS', 'Too many incorrect attempts. Request a new code.');
  }
  if (result === 'invalid') {
    return fail(res, 400, 'OTP_INVALID', 'Incorrect code. Please try again.');
  }

  const verified = store.setUserVerification(user.id, 'verified') ?? user;
  return res.json({ user: toPublicUser(verified), token: signToken(verified) });
};
