#!/usr/bin/env node
/**
 * End-to-end smoke test for the CampusShare API.
 *
 * Build first (`npm run build` / `npx tsc`) then run:
 *   PORT=3210 node scripts/smoke.mjs
 *
 * Spins up its own server instance on a dedicated port so it can run against
 * an unmodified checkout. Uses only the Node built-in fetch + child_process.
 */

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = Number(process.env.SMOKE_PORT ?? 3210);
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
const post = (url, body) => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
const patch = (url) => fetch(url, { method: 'PATCH' });

const server = spawn('node', [path.join(root, 'dist/index.js')], {
  env: { ...process.env, PORT: String(PORT) },
  stdio: 'ignore',
});

const waitForHealth = async () => {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://localhost:${PORT}/health`);
      if (r.ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((res) => setTimeout(res, 250));
  }
  return false;
};

const run = async () => {
  const up = await waitForHealth();
  check('server starts', up);
  if (!up) process.exit(1);

  // Items
  const feed = await j(await fetch(`${BASE}/items`));
  check('GET /items returns seed listings', feed.items.length >= 5, `${feed.items.length} items`);

  const search = await j(await fetch(`${BASE}/items?q=calculator`));
  check('GET /items?q=calculator filters', search.items.length >= 1 && search.items.every((i) => i.title.toLowerCase().includes('calculator')));

  const cat = await j(await fetch(`${BASE}/items?category=fitness`));
  check('GET /items?category=fitness filters', cat.items.length === 2);

  const detail = await j(await fetch(`${BASE}/items/it_labcoat`));
  check('GET /items/:id', detail.item.id === 'it_labcoat' && detail.item.status === 'published');

  const avail = await j(await fetch(`${BASE}/items/it_labcoat/availability?year=2026&month=9`));
  check('GET /items/:id/availability', avail.availability.length === 31, `${avail.availability.length} days`);

  // Booking lifecycle
  const created = await post(`${BASE}/bookings`, { itemId: 'it_labcoat', startDate: '2026-10-20', endDate: '2026-10-22' }).then(j);
  const bk = created.booking;
  check('POST /bookings requests with correct price', bk.status === 'requested' && bk.rentalFee === 9 && bk.total === 19, `total ${bk.total}`);

  const overlap = await post(`${BASE}/bookings`, { itemId: 'it_labcoat', startDate: '2026-10-20', endDate: '2026-10-21' });
  check('double booking rejected (409)', overlap.status === 409, `HTTP ${overlap.status}`);

  const accepted = await patch(`${BASE}/bookings/${bk.id}/accept`).then(j);
  check('PATCH accept', accepted.booking.status === 'accepted');

  const declined = await patch(`${BASE}/bookings/${bk.id}/decline`);
  check('decline of accepted booking rejected (409)', declined.status === 409);

  const paid = await post(`${BASE}/bookings/${bk.id}/pay`, {}).then(j);
  check('POST pay (mock)', paid.booking.status === 'paid');

  const pickup = await post(`${BASE}/bookings/${bk.id}/pickup`, {}).then(j);
  check('POST pickup -> active', pickup.booking.status === 'active' && Boolean(pickup.booking.pickupConfirmedAt));

  const ret = await post(`${BASE}/bookings/${bk.id}/return`, {}).then(j);
  check('POST return -> returned', ret.booking.status === 'returned');

  const confirm = await post(`${BASE}/bookings/${bk.id}/confirm-return`, {}).then(j);
  check('POST confirm-return', confirm.booking.status === 'returned' && Boolean(confirm.booking.returnConfirmedAt));

  const cancel = await patch(`${BASE}/bookings/${bk.id}/cancel`);
  check('cancel after return rejected (409)', cancel.status === 409);

  const bookedDays = (await fetch(`${BASE}/items/it_labcoat/availability?year=2026&month=9`).then(j)).availability.filter((d) => d.state === 'booked');
  check('availability reflects confirmed booking', bookedDays.length === 3, `${bookedDays.length} booked days`);

  // Validation
  const badPast = await post(`${BASE}/bookings`, { itemId: 'it_blazer', startDate: '2026-01-01', endDate: '2026-01-02' });
  check('past start date rejected (400)', badPast.status === 400);

  const badItem = await post(`${BASE}/items`, { title: 'X', category: 'other', description: 'd', pricePerDay: 0, deposit: 8, location: '' });
  check('item validation rejects short title / zero price', badItem.status === 400);

  const createdItem = await post(`${BASE}/items`, { title: 'Smoke Bike Pump', category: 'other', description: 'Floor pump with gauge', pricePerDay: 2, deposit: 8, location: 'North Campus' }).then(j);
  check('POST /items creates draft', createdItem.item.status === 'draft');

  console.log(`\n${passed} passed, ${failed} failed`);
  server.kill();
  process.exit(failed === 0 ? 0 : 1);
};

run().catch((err) => {
  console.error(err);
  server.kill();
  process.exit(1);
});