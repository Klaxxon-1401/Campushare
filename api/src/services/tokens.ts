import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { JwtClaims, UserRecord } from '../types';

/**
 * JWT issuing / verification (docs/week-03/api-contract-v1.md §1).
 * Secret comes from JWT_SECRET; production refuses to start without one.
 */

const DEV_SECRET = 'campus-share-dev-secret-do-not-use-in-production';
const IS_PROD = process.env.NODE_ENV === 'production';
let warned = false;

const secret = (): string => {
  const value = process.env.JWT_SECRET?.trim();
  if (value) return value;
  if (IS_PROD) throw new Error('JWT_SECRET must be set in production');
  if (!warned) {
    console.warn('[auth] JWT_SECRET not set — using an insecure development secret.');
    warned = true;
  }
  return DEV_SECRET;
};

const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const signToken = (user: UserRecord): string => {
  const claims: Omit<JwtClaims, 'iat' | 'exp'> = {
    sub: user.id,
    email: user.email,
    role: user.role,
    verificationStatus: user.verificationStatus,
  };
  return jwt.sign(claims, secret(), { expiresIn: EXPIRES_IN } as SignOptions);
};

export const verifyToken = (token: string): JwtClaims | null => {
  try {
    const decoded = jwt.verify(token, secret());
    if (typeof decoded === 'string') return null;
    const { sub, email, role, verificationStatus } = decoded as JwtPayload;
    if (!sub || !email) return null;
    return {
      sub: String(sub),
      email: String(email),
      role: role === 'admin' ? 'admin' : 'student',
      verificationStatus: (verificationStatus as JwtClaims['verificationStatus']) ?? 'pending',
      iat: decoded.iat,
      exp: decoded.exp,
    };
  } catch {
    return null;
  }
};
