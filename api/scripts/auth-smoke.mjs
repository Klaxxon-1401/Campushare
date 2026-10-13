#!/usr/bin/env node
/**
 * End-to-end smoke test for the auth module.
 *
 * Build first, then:  node scripts/auth-smoke.mjs   (or: npm run auth:smoke)
 *
 * Runs its own server instance on a dedicated port. RESEND_API_KEY is forced
 * empty so OTPs go through the console 'log' driver — the flow is exercised
 * without depending on real email delivery.
 */

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = Number(process.env.AUTH_SMOKE_PORT ?? 3212);
const BASE = `http://localhost:${PORT}/v1`;
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

let passed = 0;
let failed = 0;
const check = (name, cond, extra = '') => {
  if (cond) {
    passed += 1;
    console.log(`  PASS  ${name}${extra ? ` — ${extra}` : ''}`);
  } else {
    failed += 1;
    console.error(`  FAIL  ${name}${extra ? ` — ${extra}` : ''}`);
  }
};

const j = (r) => r.json();
const post = (url, body, headers = {}) =>
  fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

const server = spawn('node', [path.join(root, 'dist/index.js')], {
  // Empty RESEND_API_KEY → 'log' email driver (no real send, OTP returned as devCode).
  env: { ...process.env, PORT: String(PORT), NODE_ENV: 'test', RESEND_API_KEY: '', JWT_SECRET: 'test-secret' },
  stdio: 'ignore',
});

const waitForHealth = async () => {
  for (let i = 0; i < 40; i++) {
    try {
      if ((await fetch(`http://localhost:${PORT}/health`)).ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
};

const NEW_USER = {
  name: 'Test Student',
  email: 'test.student@student.university.edu',
  studentId: '22ZZ9999',
  password: 'supersecret123',
};

const run = async () => {
  const up = await waitForHealth();
  check('server starts', up);
  if (!up) {
    server.kill();
    process.exit(1);
  }

  // --- Registration validation ---
  let r = await post(`${BASE}/auth/register`, { ...NEW_USER, email: 'someone@gmail.com' });
  check('register rejects non-campus email', r.status === 400, `status ${r.status}`);

  r = await post(`${BASE}/auth/register`, { ...NEW_USER, password: 'short' });
  check('register rejects weak password', r.status === 400, `status ${r.status}`);

  // --- Happy-path registration ---
  r = await post(`${BASE}/auth/register`, NEW_USER);
  const reg = await j(r);
  check('register creates a pending account', r.status === 201 && reg.verificationStatus === 'pending', `status ${r.status}`);
  check('register returns a dev OTP', typeof reg.devCode === 'string' && /^\d{6}$/.test(reg.devCode));
  const devCode = reg.devCode;

  // --- Duplicate ---
  r = await post(`${BASE}/auth/register`, NEW_USER);
  check('duplicate email is rejected', r.status === 409, `status ${r.status}`);

  // --- Cannot log in before verification ---
  r = await post(`${BASE}/auth/login`, { email: NEW_USER.email, password: NEW_USER.password });
  const pendingLogin = await j(r);
  check('login blocked while unverified', r.status === 403 && pendingLogin.error?.code === 'NOT_VERIFIED', `status ${r.status}`);

  // --- Resend cooldown ---
  r = await post(`${BASE}/auth/verify/start`, { email: NEW_USER.email });
  const cooldown = await j(r);
  check('resend is rate-limited (cooldown)', r.status === 429 && cooldown.error?.code === 'RESEND_COOLDOWN', `status ${r.status}`);

  // --- Wrong OTP ---
  const wrong = devCode === '000000' ? '111111' : '000000';
  r = await post(`${BASE}/auth/verify/confirm`, { email: NEW_USER.email, otp: wrong });
  const badOtp = await j(r);
  check('wrong OTP is rejected', r.status === 400 && badOtp.error?.code === 'OTP_INVALID', `status ${r.status}`);

  // --- Correct OTP ---
  r = await post(`${BASE}/auth/verify/confirm`, { email: NEW_USER.email, otp: devCode });
  const confirmed = await j(r);
  check('correct OTP verifies the account', r.status === 200 && confirmed.user?.verificationStatus === 'verified', `status ${r.status}`);
  check('verification returns a token', typeof confirmed.token === 'string' && confirmed.token.split('.').length === 3);
  check('verified user has no passwordHash', confirmed.user && !('passwordHash' in confirmed.user));

  // --- Login after verification ---
  r = await post(`${BASE}/auth/login`, { email: NEW_USER.email, password: NEW_USER.password });
  const login = await j(r);
  check('login succeeds after verification', r.status === 200 && typeof login.token === 'string');
  check('login returns the public user', login.user?.email === NEW_USER.email && !('passwordHash' in (login.user ?? {})));

  // --- Wrong password ---
  r = await post(`${BASE}/auth/login`, { email: NEW_USER.email, password: 'wrong-password' });
  check('wrong password is rejected', r.status === 401, `status ${r.status}`);

  // --- /me ---
  r = await fetch(`${BASE}/auth/me`);
  check('me without token is 401', r.status === 401, `status ${r.status}`);

  r = await fetch(`${BASE}/auth/me`, { headers: { authorization: `Bearer ${login.token}` } });
  const meBody = await j(r);
  check('me with token returns the user', r.status === 200 && meBody.user?.email === NEW_USER.email, `status ${r.status}`);

  r = await fetch(`${BASE}/auth/me`, { headers: { authorization: 'Bearer not.a.jwt' } });
  check('me with a bad token is 401', r.status === 401, `status ${r.status}`);

  // --- Seeded demo account ---
  r = await post(`${BASE}/auth/login`, { email: 'devan.d@student.university.edu', password: 'campus1234' });
  const seedLogin = await j(r);
  check('seeded demo user can log in', r.status === 200 && seedLogin.user?.email === 'devan.d@student.university.edu', `status ${r.status}`);

  console.log(`\n${passed} passed, ${failed} failed`);
  server.kill();
  process.exit(failed === 0 ? 0 : 1);
};

run().catch((err) => {
  console.error(err);
  server.kill();
  process.exit(1);
});
