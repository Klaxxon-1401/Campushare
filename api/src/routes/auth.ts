import express from 'express';
import { confirmVerification, login, me, register, startVerification } from '../controllers/auth';
import { requireAuth } from '../middleware/auth';
import { authLimiter, otpLimiter } from '../middleware/rateLimit';

const router = express.Router();

// POST /auth/register — create an account and email an OTP
router.post('/register', authLimiter, register);

// POST /auth/login — verify credentials, return a JWT
router.post('/login', authLimiter, login);

// GET /auth/me — current user (requires a valid bearer token)
router.get('/me', requireAuth, me);

// POST /auth/verify/start — (re)send the OTP
router.post('/verify/start', otpLimiter, startVerification);

// POST /auth/verify/confirm — confirm the OTP and mark the account verified
router.post('/verify/confirm', authLimiter, confirmVerification);

export default router;
