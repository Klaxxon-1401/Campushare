import { request } from './http';
import { User, VerificationStatus } from '../types';

/** Shape of a user as returned by the API (note `email`, not `campusEmail`). */
export interface ApiUser {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  role: 'student' | 'admin';
  verificationStatus: 'draft' | 'pending' | 'verified' | 'rejected';
  rating: number;
  reviewCount: number;
  createdAt: string;
}

const mapStatus = (status: ApiUser['verificationStatus']): VerificationStatus =>
  status === 'draft' ? 'pending' : status;

/** Convert an API user into the app's domain User shape. */
export const toAppUser = (user: ApiUser): User => ({
  id: user.id,
  name: user.name,
  campusEmail: user.email,
  studentId: user.studentId,
  verificationStatus: mapStatus(user.verificationStatus),
  role: user.role,
  rating: user.rating,
  reviewCount: user.reviewCount,
});

export interface RegisterResult {
  userId: string;
  email: string;
  verificationStatus: string;
  otpSent: boolean;
  message: string;
  devCode?: string;
}

export const authApi = {
  register(input: { name?: string; email: string; studentId: string; password: string }) {
    return request<RegisterResult>('/auth/register', { method: 'POST', body: input });
  },

  login(email: string, password: string) {
    return request<{ token: string; user: ApiUser }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  me() {
    return request<{ user: ApiUser }>('/auth/me');
  },

  verifyStart(email: string) {
    return request<{ message: string; expiresInMinutes?: number; devCode?: string }>(
      '/auth/verify/start',
      { method: 'POST', body: { email } }
    );
  },

  verifyConfirm(email: string, otp: string) {
    return request<{ user: ApiUser; token: string }>('/auth/verify/confirm', {
      method: 'POST',
      body: { email, otp },
    });
  },
};
