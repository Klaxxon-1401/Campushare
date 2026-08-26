import { Request, Response } from 'express';
import { z } from 'zod';

// Campus email domains — must match institutional allowlist (PROJECT_PLAN §11.1)
const CAMPUS_DOMAINS = (process.env.CAMPUS_DOMAINS || 'university.edu,student.university.edu')
  .split(',')
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

const campusEmail = z
  .string()
  .email()
  .refine(
    (email) => CAMPUS_DOMAINS.includes(email.split('@')[1]?.toLowerCase() ?? ''),
    { message: 'Registration requires a campus email address' }
  );

// Validation schemas
const registerSchema = z.object({
  email: campusEmail,
  studentId: z.string().regex(/^[A-Za-z0-9]{5,15}$/, 'Student ID must be 5-15 alphanumeric characters'),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const body = registerSchema.parse(req.body);
      
      // TODO: Implement Firebase Auth registration
      // TODO: Send OTP to campus email
      
      res.status(201).json({
        message: 'Registration successful. Please check your email for verification code.',
        userId: 'mock-user-id',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.issues });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const body = loginSchema.parse(req.body);
      
      // TODO: Implement Firebase Auth login
      
      res.json({
        token: 'mock-jwt-token',
        user: {
          id: 'mock-user-id',
          email: body.email,
          name: 'John Doe',
          verificationStatus: 'verified',
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.issues });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      // TODO: Implement JWT verification and get user from token
      
      res.json({
        user: {
          id: 'mock-user-id',
          email: 'john@university.edu',
          name: 'John Doe',
          verificationStatus: 'verified',
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async startVerification(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      // TODO: Implement OTP generation and sending
      
      res.json({
        message: 'Verification code sent to email',
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async confirmVerification(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      
      // TODO: Implement OTP verification
      
      res.json({
        message: 'Email verified successfully',
        user: {
          id: 'mock-user-id',
          email,
          verificationStatus: 'verified',
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
