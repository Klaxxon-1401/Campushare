import { Request, RequestHandler } from 'express';
import { store } from '../data/store';
import { verifyToken } from '../services/tokens';
import { UserRecord } from '../types';

/** A request whose bearer token has been verified and resolved to a user. */
export interface AuthedRequest extends Request {
  user?: UserRecord;
}

const bearerToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
};

/** Rejects the request unless it carries a valid bearer token for a real user. */
export const requireAuth: RequestHandler = (req, res, next) => {
  const token = bearerToken(req);
  if (!token) {
    res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Missing bearer token' } });
    return;
  }
  const claims = verifyToken(token);
  if (!claims) {
    res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } });
    return;
  }
  const user = store.findUserById(claims.sub);
  if (!user) {
    res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Account no longer exists' } });
    return;
  }
  (req as AuthedRequest).user = user;
  next();
};

/** Must run after `requireAuth`. Blocks unverified accounts. */
export const requireVerified: RequestHandler = (req, res, next) => {
  const user = (req as AuthedRequest).user;
  if (!user) {
    res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Missing bearer token' } });
    return;
  }
  if (user.verificationStatus !== 'verified') {
    res.status(403).json({ error: { code: 'NOT_VERIFIED', message: 'Campus verification required' } });
    return;
  }
  next();
};

/** Must run after `requireAuth`. Admin-only endpoints. */
export const requireAdmin: RequestHandler = (req, res, next) => {
  const user = (req as AuthedRequest).user;
  if (!user) {
    res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Missing bearer token' } });
    return;
  }
  if (user.role !== 'admin') {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } });
    return;
  }
  next();
};
