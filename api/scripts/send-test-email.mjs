#!/usr/bin/env node
/**
 * Standalone Resend test — the quickstart snippet, done safely:
 *   - reads the key from api/.env instead of hardcoding it
 *   - awaits the send and reports { data, error }
 *
 * Usage:
 *   1. Create api/.env from .env.example and set RESEND_API_KEY=re_... (your real key)
 *   2. Set EMAIL_TEST_TO to the address your Resend account was created with
 *      (with the default onboarding@resend.dev sender, Resend only delivers there)
 *   3. From the api/ folder:  npm run email:test
 */
import 'dotenv/config';
import { Resend } from 'resend';

const key = (process.env.RESEND_API_KEY || '').trim();
if (!key || /^re_x{6,}$/.test(key)) {
  console.error(
    'Missing RESEND_API_KEY.\n' +
      'Open api/.env and replace  RESEND_API_KEY=re_xxxxxxxxx  with your real key\n' +
      'from https://resend.com/api-keys'
  );
  process.exit(1);
}

const from = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const to = (process.env.EMAIL_TEST_TO || process.env.RESEND_ACCOUNT_EMAIL || '').trim();
if (!to) {
  console.error(
    'Set EMAIL_TEST_TO in api/.env to your Resend signup address.\n' +
      'With the default onboarding@resend.dev sender, Resend will not deliver anywhere else.'
  );
  process.exit(1);
}

console.log(`Sending a test email via Resend: ${from} -> ${to} ...`);

const resend = new Resend(key);
const { data, error } = await resend.emails.send({
  from,
  to,
  subject: 'CampusShare — Resend test',
  html: '<p>Congrats on sending your <strong>first email</strong>!</p>',
});

if (error) {
  console.error(`Send failed (${error.name}): ${error.message}`);
  process.exit(1);
}

console.log(`Sent. Resend message id = ${data?.id}`);
