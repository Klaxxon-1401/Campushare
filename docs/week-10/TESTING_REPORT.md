# Week 10 — Testing & Quality Report

> **Scope:** unit tests on the core logic, typechecks, bundling check, and the API smoke suite.

## Test layers

| Layer | Command | Result |
|-------|---------|--------|
| Mobile pure-logic unit tests | `npm test` (mobile) | ✅ **16/16** — date math, pricing, formatting, activity timestamps |
| Mobile TypeScript check | `npm run typecheck` | ✅ clean |
| Android JS bundle (Hermes) | `npx expo export -p android` | ✅ 2.6 MB bundle |
| API end-to-end smoke | `npm run smoke` (api) | ✅ **19/19** — items, availability, booking state machine, double-booking, validation |

## What the unit tests cover (mobile)

- `daysInclusive`: same-day = 1 day; inclusive endpoints.
- `eachDay` / `overlaps`: adjacent ranges overlap; disjoint don't.
- `addDays` month/leap boundaries.
- `computePrice`: rental fee + deposit breakdown, single-day, zero deposit.
- `formatMoney` / `initials`.
- `timeAgo`: "just now" → minutes → hours → days → short-date fallback (notification feed).

## What the API smoke covers (api)

- Seed listings, search (`q`), category filters, pagination.
- Availability calendar length + booked-day reflection.
- Booking lifecycle: request → accept → pay → pickup → return → confirm,
  including **409 double-booking prevention at the request stage**, illegal transitions,
  past-date rejection, and item draft creation.

## Known issues / risks

1. **No auth yet** — `ownerId`/`borrowerId` stubbed to `u_devan`; JWT is the Week-11 backend task.
2. **Mock payments** — UPI/card/wallet succeed instantly; real Stripe = Week 11 deployment.
3. **In-memory data** — app state resets on restart; AsyncStorage was installed but the loader
   is intentionally deferred to the Firestore migration so there is one source of truth.
4. **Camera on emulator** — `expo-image-picker` requires a real device or emulator camera;
   simulators without camera fall back to the photo library.
5. **`react-native` pinned to 0.86.x** — SDK 57 requires 0.86.2; the repo previously had 0.87.0
   which breaks Metro's polyfill resolution. Do not bump RN independently of Expo.

## Related documents

- [`UAT_REPORT.md`](./UAT_REPORT.md) — acceptance script and critical test-case results.
- [`SECURITY_REVIEW.md`](./SECURITY_REVIEW.md) — security pass and prioritized recommendations.