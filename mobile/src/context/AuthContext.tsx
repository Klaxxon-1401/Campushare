import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { User } from '../types';
import { ApiUser, authApi, toAppUser } from '../services/authApi';
import { ApiError, setAuthToken } from '../services/http';
import { clearToken, clearUser, loadToken, loadUser, saveToken, saveUser } from '../services/tokenStore';

export type AuthStatus = 'restoring' | 'signedIn' | 'signedOut';

interface SignUpInput {
  name?: string;
  email: string;
  studentId: string;
  password: string;
}

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  /** Log in and establish a session. */
  signIn(email: string, password: string): Promise<User>;
  /** Create a pending account and trigger the OTP email. */
  signUp(input: SignUpInput): Promise<{ email: string; otpSent: boolean; devCode?: string }>;
  /** Confirm the OTP — verifies the account and signs in. */
  verifyOtp(email: string, otp: string): Promise<User>;
  /** Request a fresh OTP (subject to the server cooldown). */
  resendOtp(email: string): Promise<{ devCode?: string }>;
  /** Clear the session and stored token. */
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>('restoring');
  const [user, setUser] = useState<User | null>(null);

  const applySession = useCallback(async (token: string, apiUser: ApiUser): Promise<User> => {
    setAuthToken(token);
    await saveToken(token);
    const mapped = toAppUser(apiUser);
    await saveUser(mapped).catch(() => undefined);
    setUser(mapped);
    setStatus('signedIn');
    return mapped;
  }, []);

  // Restore a persisted session on launch.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await loadToken();
        if (!token) {
          if (!cancelled) setStatus('signedOut');
          return;
        }
        setAuthToken(token);
        const { user: apiUser } = await authApi.me();
        if (cancelled) return;
        const mapped = toAppUser(apiUser);
        setUser(mapped);
        setStatus('signedIn');
        await saveUser(mapped).catch(() => undefined);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 401) {
          // Token was rejected — clear it.
          setAuthToken(null);
          await clearToken().catch(() => undefined);
          await clearUser().catch(() => undefined);
          setStatus('signedOut');
          return;
        }
        // Network/server hiccup — restore the cached profile if we have one.
        const cached = await loadUser<User>();
        if (cached) {
          setUser(cached);
          setStatus('signedIn');
        } else {
          setStatus('signedOut');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { token, user: apiUser } = await authApi.login(email.trim(), password);
      return applySession(token, apiUser);
    },
    [applySession]
  );

  const signUp = useCallback(async (input: SignUpInput) => {
    const result = await authApi.register({ ...input, email: input.email.trim() });
    return { email: result.email, otpSent: result.otpSent, devCode: result.devCode };
  }, []);

  const verifyOtp = useCallback(
    async (email: string, otp: string) => {
      const { token, user: apiUser } = await authApi.verifyConfirm(email.trim(), otp);
      return applySession(token, apiUser);
    },
    [applySession]
  );

  const resendOtp = useCallback(async (email: string) => {
    const result = await authApi.verifyStart(email.trim());
    return { devCode: result.devCode };
  }, []);

  const signOut = useCallback(async () => {
    setAuthToken(null);
    await clearToken().catch(() => undefined);
    await clearUser().catch(() => undefined);
    setUser(null);
    setStatus('signedOut');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, signIn, signUp, verifyOtp, resendOtp, signOut }),
    [status, user, signIn, signUp, verifyOtp, resendOtp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
