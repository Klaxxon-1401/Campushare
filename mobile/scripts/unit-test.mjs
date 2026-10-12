#!/usr/bin/env node
/**
 * Unit tests for the pure logic modules (date math, pricing, formatting).
 * Compiles just `src/utils` + `src/types` to a temp dir with tsc (CommonJS)
 * and runs assertions with the Node test runner. No React Native runtime needed.
 *
 *   npm test          # in mobile/
 *   node scripts/unit-test.mjs
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const mobileRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = mkdtempSync(path.join(tmpdir(), 'campusshare-unit-'));
const files = ['src/utils/date.ts', 'src/utils/pricing.ts', 'src/utils/format.ts', 'src/types/index.ts'];

const tsc = spawnSync('npx', ['tsc', '--ignoreConfig', ...files, '--outDir', out, '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck', '--esModuleInterop'], {
  cwd: mobileRoot,
  stdio: 'pipe',
  encoding: 'utf8',
});
if (tsc.status !== 0) {
  console.error(tsc.stderr || tsc.stdout);
  process.exit(1);
}

const date = await import(path.join(out, 'utils/date.js'));
const pricing = await import(path.join(out, 'utils/pricing.js'));
const fmt = await import(path.join(out, 'utils/format.js'));

const tests = [];
const t = (name, fn) => tests.push([name, fn]);

// ---- date helpers ----------------------------------------------------------
t('daysInclusive: same day counts as 1 day', () => {
  assert.equal(date.daysInclusive('2026-10-20', '2026-10-20'), 1);
});
t('daysInclusive: Oct 20–22 is 3 billable days', () => {
  assert.equal(date.daysInclusive('2026-10-20', '2026-10-22'), 3);
});
t('eachDay spans inclusive endpoints', () => {
  assert.deepEqual(date.eachDay('2026-10-20', '2026-10-22'), ['2026-10-20', '2026-10-21', '2026-10-22']);
});
t('overlaps: identical ranges overlap', () => {
  assert.equal(date.overlaps('2026-10-20', '2026-10-22', '2026-10-20', '2026-10-21'), true);
});
t('overlaps: adjacent (end == start) ranges overlap', () => {
  assert.equal(date.overlaps('2026-10-20', '2026-10-21', '2026-10-21', '2026-10-23'), true);
});
t('overlaps: disjoint ranges do not overlap', () => {
  assert.equal(date.overlaps('2026-10-20', '2026-10-21', '2026-10-24', '2026-10-25'), false);
});
t('addDays handles month boundaries', () => {
  assert.equal(date.addDays('2026-10-31', 1), '2026-11-01');
  assert.equal(date.addDays('2026-02-28', 1), '2026-03-01');
});
t('todayISO is YYYY-MM-DD', () => {
  assert.match(date.todayISO(), /^\d{4}-\d{2}-\d{2}$/);
});

// ---- pricing ---------------------------------------------------------------
t('computePrice: 3 days × ₹10 + ₹20 deposit', () => {
  assert.deepEqual(pricing.computePrice(10, 20, '2026-10-20', '2026-10-22'), {
    days: 3,
    rentalFee: 30,
    deposit: 20,
    total: 50,
  });
});
t('computePrice: single day rental', () => {
  const p = pricing.computePrice(5, 15, '2026-10-20', '2026-10-20');
  assert.equal(p.rentalFee, 5);
  assert.equal(p.total, 20);
});
t('computePrice: zero deposit', () => {
  assert.equal(pricing.computePrice(8, 0, '2026-10-20', '2026-10-21').total, 16);
});
t('pricing floor: minimum is ₹30/day', () => {
  assert.equal(pricing.MIN_PRICE_PER_DAY, 30);
  assert.equal(pricing.isValidDayRate(30), true);
  assert.equal(pricing.isValidDayRate(60), true);
  assert.equal(pricing.isValidDayRate(29), false);
  assert.equal(pricing.isValidDayRate(0), false);
  assert.equal(pricing.isValidDayRate(NaN), false);
});

// ---- formatting ------------------------------------------------------------
t('formatMoney: whole rupees without decimals', () => {
  assert.equal(fmt.formatMoney(10), '₹10');
  assert.equal(fmt.formatMoney(3.5), '₹3.50');
});
t('initials from full name', () => {
  assert.equal(fmt.initials('Devan D'), 'DD');
  assert.equal(fmt.initials('anmol kumar'), 'AK');
});

// ---- activity timestamps (notifications) -----------------------------------
const now = new Date(2026, 9, 20, 12, 0, 0);
const ago = (ms) => new Date(now.getTime() - ms).toISOString();

t('timeAgo: under a minute is "just now"', () => {
  assert.equal(date.timeAgo(ago(30_000), now), 'just now');
});
t('timeAgo: minutes, hours and days', () => {
  assert.equal(date.timeAgo(ago(5 * 60_000), now), '5m ago');
  assert.equal(date.timeAgo(ago(3 * 3_600_000), now), '3h ago');
  assert.equal(date.timeAgo(ago(2 * 86_400_000), now), '2d ago');
});
t('timeAgo: a week or more falls back to a short date', () => {
  assert.equal(date.timeAgo(ago(10 * 86_400_000), now), '10 Oct');
});

let passed = 0;
for (const [name, fn] of tests) {
  try {
    await fn();
    passed += 1;
    console.log(`  PASS  ${name}`);
  } catch (e) {
    console.error(`  FAIL  ${name}`);
    console.error(e.message);
    process.exitCode = 1;
  }
}
console.log(`\n${passed}/${tests.length} unit tests passed`);
if (passed !== tests.length) process.exit(1);