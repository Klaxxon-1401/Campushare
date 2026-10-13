#!/usr/bin/env node
/**
 * End-to-end smoke test for the CampusShare API.
 *
 * Build first (`npm run build` / `npx tsc`) then run:
 *   PORT=3210 node scripts/smoke.mjs   (or: npm run smoke)
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

const login = async (email, password = 'campus1234') => {
  const r = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) throw new Error(`login failed for ${email}: HTTP ${r.status}`);
  return (await r.json()).token;
};

const headers = (token) =>
  token ? { 'content-type': 'application/json', authorization: `Bearer ${token}` } : { 'content-type': 'application/json' };

const post = (url, body, token) =>
  fetch(url, { method: 'POST', headers: headers(token), body: JSON.stringify(body ?? {}) });
const patch = (url, token) => fetch(url, { method: 'PATCH', headers: headers(token) });
const del = (url, token) => fetch(url, { method: 'DELETE', headers: headers(token) });
const get = (url, token) => fetch(url, { headers: token ? { authorization: `Bearer ${token}` } : {} });

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

  // --- Tokens: borrower (Devan) and the owner of it_labcoat (Sarah) ---
  const borrower = await login('devan.d@student.university.edu');
  const lender = await login('sarah.m@student.university.edu');

  // Items (public)
  const feed = await j(await get(`${BASE}/items`));
  check('GET /items returns seed listings', feed.items.length >= 5, `${feed.items.length} items`);

  const search = await j(await get(`${BASE}/items?q=calculator`));
  check('GET /items?q=calculator filters', search.items.length >= 1 && search.items.every((i) => i.title.toLowerCase().includes('calculator')));

  const cat = await j(await get(`${BASE}/items?category=fitness`));
  check('GET /items?category=fitness filters', cat.items.length === 2);

  const detail = await j(await get(`${BASE}/items/it_labcoat`));
  check('GET /items/:id', detail.item.id === 'it_labcoat' && detail.item.status === 'published');

  const avail = await j(await get(`${BASE}/items/it_labcoat/availability?year=2026&month=9`));
  check('GET /items/:id/availability', avail.availability.length === 31, `${avail.availability.length} days`);

  // --- Auth guards ---
  const anonBooking = await post(`${BASE}/bookings`, { itemId: 'it_labcoat', startDate: '2026-11-01', endDate: '2026-11-02' });
  check('booking without a token rejected (401)', anonBooking.status === 401, `HTTP ${anonBooking.status}`);

  const anonItem = await post(`${BASE}/items`, { title: 'Anon Item', category: 'other', description: 'x', pricePerDay: 1, deposit: 1, location: 'x' });
  check('item create without a token rejected (401)', anonItem.status === 401, `HTTP ${anonItem.status}`);

  const otherUserBooking = await j(await get(`${BASE}/bookings`, lender));
  check('listBookings is scoped to the token user', Array.isArray(otherUserBooking.bookings));

  // --- Booking lifecycle (borrower requests, lender accepts) ---
  const created = await j(await post(`${BASE}/bookings`, { itemId: 'it_labcoat', startDate: '2026-10-20', endDate: '2026-10-22' }, borrower));
  const bk = created.booking;
  check('POST /bookings requests with correct price', bk.status === 'requested' && bk.rentalFee === 9 && bk.total === 19, `total ${bk.total}`);

  const spoofedList = await j(await get(`${BASE}/bookings?userId=u_sarah`, borrower));
  check('listBookings ignores a spoofed userId', spoofedList.bookings.every((b) => b.borrowerId === 'u_devan'));

  const borrowerCannotAccept = await patch(`${BASE}/bookings/${bk.id}/accept`, borrower);
  check('borrower cannot accept their own request (403)', borrowerCannotAccept.status === 403, `HTTP ${borrowerCannotAccept.status}`);

  const intruderCannotAccept = await patch(`${BASE}/bookings/${bk.id}/accept`, await login('mike.r@student.university.edu'));
  check('unrelated user cannot accept the booking (403)', intruderCannotAccept.status === 403, `HTTP ${intruderCannotAccept.status}`);

  const overlap = await post(`${BASE}/bookings`, { itemId: 'it_labcoat', startDate: '2026-10-20', endDate: '2026-10-21' }, borrower);
  check('double booking rejected (409)', overlap.status === 409, `HTTP ${overlap.status}`);

  const accepted = await j(await patch(`${BASE}/bookings/${bk.id}/accept`, lender));
  check('PATCH accept (by lender)', accepted.booking.status === 'accepted');

  const declined = await patch(`${BASE}/bookings/${bk.id}/decline`, lender);
  check('decline of accepted booking rejected (409)', declined.status === 409);

  const bookerCannotPay = await patch(`${BASE}/bookings/${bk.id}/accept`, lender); // state guard
  check('re-accepting an accepted booking rejected (409)', bookerCannotPay.status === 409);

  const paid = await j(await post(`${BASE}/bookings/${bk.id}/pay`, {}, borrower));
  check('POST pay (mock)', paid.booking.status === 'paid');

  const pickup = await j(await post(`${BASE}/bookings/${bk.id}/pickup`, {}, borrower));
  check('POST pickup -> active', pickup.booking.status === 'active' && Boolean(pickup.booking.pickupConfirmedAt));

  const ret = await j(await post(`${BASE}/bookings/${bk.id}/return`, {}, borrower));
  check('POST return -> returned', ret.booking.status === 'returned');

  const borrowerCannotConfirm = await post(`${BASE}/bookings/${bk.id}/confirm-return`, {}, borrower);
  check('borrower cannot confirm their own return (403)', borrowerCannotConfirm.status === 403, `HTTP ${borrowerCannotConfirm.status}`);

  const confirm = await j(await post(`${BASE}/bookings/${bk.id}/confirm-return`, {}, lender));
  check('POST confirm-return (by lender)', confirm.booking.status === 'returned' && Boolean(confirm.booking.returnConfirmedAt));

  const cancel = await patch(`${BASE}/bookings/${bk.id}/cancel`, borrower);
  check('cancel after return rejected (409)', cancel.status === 409);

  const strangerView = await get(`${BASE}/bookings/${bk.id}`, await login('priya.s@student.university.edu'));
  check('unrelated user cannot read the booking (403)', strangerView.status === 403, `HTTP ${strangerView.status}`);

  const bookedDays = (await j(await get(`${BASE}/items/it_labcoat/availability?year=2026&month=9`))).availability.filter((d) => d.state === 'booked');
  check('availability reflects confirmed booking', bookedDays.length === 3, `${bookedDays.length} booked days`);

  // --- Validation ---
  const badPast = await post(`${BASE}/bookings`, { itemId: 'it_blazer', startDate: '2026-01-01', endDate: '2026-01-02' }, borrower);
  check('past start date rejected (400)', badPast.status === 400);

  const badItem = await post(`${BASE}/items`, { title: 'X', category: 'other', description: 'd', pricePerDay: 0, deposit: 8, location: '' }, borrower);
  check('item validation rejects short title / zero price', badItem.status === 400);

  const createdItem = await j(await post(`${BASE}/items`, { title: 'Smoke Bike Pump', category: 'other', description: 'Floor pump with gauge', pricePerDay: 2, deposit: 8, location: 'North Campus' }, borrower));
  check('POST /items creates draft', createdItem.item.status === 'draft');
  check('created item is owned by the token user', createdItem.item.ownerId === 'u_devan');

  // --- Item ownership ---
  const nonOwnerPatch = await patch(`${BASE}/items/${createdItem.item.id}`, lender);
  check('non-owner cannot edit an item (403)', nonOwnerPatch.status === 403, `HTTP ${nonOwnerPatch.status}`);

  const nonOwnerDelete = await del(`${BASE}/items/${createdItem.item.id}`, lender);
  check('non-owner cannot delete an item (403)', nonOwnerDelete.status === 403, `HTTP ${nonOwnerDelete.status}`);

  const ownerDelete = await del(`${BASE}/items/${createdItem.item.id}`, borrower);
  check('owner can delete their item (200)', ownerDelete.status === 200, `HTTP ${ownerDelete.status}`);

  // --- Draft privacy ---
  const draft = await j(await post(`${BASE}/items`, { title: 'Draft Rock Climbing Rope', category: 'fitness', description: '70m dynamic rope', pricePerDay: 6, deposit: 20, location: 'Sports Complex' }, borrower));
  const publicDrafts = await j(await get(`${BASE}/items?q=climbing`));
  check('drafts are hidden from the public feed', publicDrafts.items.length === 0, `${publicDrafts.items.length} visible`);

  const ownerDrafts = await j(await get(`${BASE}/items?q=climbing&ownerId=u_devan&includeDrafts=true`, borrower));
  check('owner sees their own drafts', ownerDrafts.items.length === 1);
  check('owner draft query is owner-scoped', ownerDrafts.items[0].id === draft.item.id);

  const spoofedDrafts = await j(await get(`${BASE}/items?q=climbing&ownerId=u_sarah&includeDrafts=true`, borrower));
  check('drafts require matching owner', spoofedDrafts.items.length === 0);

  const ownerIdLeak = await j(await get(`${BASE}/items?ownerId=u_devan`));
  check('ownerId query does not leak the owner drafts', ownerIdLeak.items.every((i) => i.status !== 'draft'));

  const anonDraftLeak = await j(await get(`${BASE}/items?ownerId=u_devan&includeDrafts=true`));
  check('anonymous includeDrafts is ignored', anonDraftLeak.items.every((i) => i.status !== 'draft'));

  console.log(`\n${passed} passed, ${failed} failed`);
  server.kill();
  process.exit(failed === 0 ? 0 : 1);
};

run().catch((err) => {
  console.error(err);
  server.kill();
  process.exit(1);
});
