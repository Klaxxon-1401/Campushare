import express from 'express';
import { AuthController } from '../controllers/auth';

const router = express.Router();
const authController = new AuthController();

// POST /auth/register
router.post('/register', authController.register);

// POST /auth/login
router.post('/login', authController.login);

// GET /auth/me
router.get('/me', authController.getMe);

// POST /auth/verify/start
router.post('/verify/start', authController.startVerification);

// POST /auth/verify/confirm
router.post('/verify/confirm', authController.confirmVerification);

export default router;
