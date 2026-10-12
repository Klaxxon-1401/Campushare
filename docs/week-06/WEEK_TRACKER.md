# Week 6 — Implementation Tracker

> **Phase:** Week 6 of 12 (PROJECT_PLAN §18)
> **Deliverables:** Item listing, search & filters, item detail, availability calendar, booking module

---

## Status Board

| Deliverable | Artifact | Status | Notes |
|------------|----------|--------|-------|
| Build scaffold fixed | `mobile/index.js`, `babel.config.js`, `assets/*`, `app.json` | ✅ | Entry point, babel preset, generated icons/splash; removed unused `expo-router` plugin (app uses React Navigation) |
| Domain model | `mobile/src/types/` | ✅ | Shared `Item`, `Booking`, `AvailabilityDay`, `PriceBreakdown` types |
| Date & money utils | `mobile/src/utils/` | ✅ | Calendar math, inclusive-day pricing, formatting |
| Data service | `mobile/src/services/` | ✅ | `localStore` (in-memory, async) + `api` facade so Firestore HTTP swap is single-file |
| Data hooks | `mobile/src/hooks/` | ✅ | `useItems`, `useItem`, `useBookings` |
| Shared components | `mobile/src/components/` | ✅ | `ItemCard`, `SearchBar`, `CategoryChips`, `AvailabilityCalendar`, `PriceSummary`, `ScreenHeader`, `EmptyState` |
| Home feed | `HomeFeedScreen` | ✅ Rebuilt | Real data, category filter, search deep-link, refresh — duplicated bottom nav removed |
| Search & filters | `SearchResultsScreen` | ✅ | Debounced search, category + location chips |
| Item detail | `ItemDetailScreen` | ✅ | Owner info, condition note, read-only availability, book CTA / edit for owner |
| Listing wizard | `CreateListingScreen` | ✅ | 3-step (details → photo/pricing → review), validation, suggested rates/deposits, edit mode |
| My listings | `MyListingsScreen` | ✅ | Draft vs published, pause/publish/delete |
| Booking request | `BookingRequestScreen` | ✅ | Range selection on calendar, conflict detection, live price |
| Booking detail | `BookingDetailScreen` | ✅ | Status timeline, actions per role/status, mock pay |
| Bookings tab | `BookingsScreen` | ✅ | Borrowing/Lending segments |
| Returns + Profile tabs | — | ✅ | Placeholders wired; returns lists due-back rentals, profile links the rest, center “+” tab opens wizard |
| Navigation | `AppNavigator` | ✅ | Typed routes, 5 tabs w/ raised Create button |
| **API: items** | `api/src/controllers/items.ts` | ✅ | Real in-memory CRUD, search/filter/pagination, availability |
| **API: bookings** | `api/src/controllers/bookings.ts` | ✅ | State machine, double-booking prevention, mock payment/pickup/return |
| API smoke tests | `api/scripts/smoke.mjs` (`npm run smoke`) | ✅ | 19 asserts green |

---

## How to run

**Mobile (Expo)** — from `mobile/`:
```
npm start          # Expo Dev Server (Android via Expo Go / EAS)
npm run typecheck  # tsc --noEmit
```
The app is fully self-contained for now: screens read from the in-memory
`localStore` through the `services/api.ts` facade, so it demoes end-to-end
without a backend.

**API** — from `api/`:
```
npm run build && npm start           # http://localhost:3000
npm run smoke                        # spins up its own instance on :3210
```

---

## Booking rules implemented (PROJECT_PLAN §10/§14)

- A booking **request** immediately reserves its date range (pending hold) —
  overlapping requests for the same item are rejected with 409.
- Only owners can accept/decline; the state machine guards every transition
  (`requested → accepted → paid → active → returned`, cancellable before `paid`).
- Price = `pricePerDay × days` (both endpoints inclusive) + a separately-listed
  refundable deposit. Max rental period 30 days; start date cannot be in the past.
- `GET /items/:id/availability?year&month` returns day-level `open|booked|blocked`
  used to drive the calendar.

## Known limitations (next milestones)

- **Auth**: no real JWT — `ownerId`/`borrowerId` are stubbed to `u_dev`.
- **Payments**: `POST /bookings/:id/pay` is a mock (Stripe = Week 7).
- **Photos**: listings use category placeholders; camera capture = Week 7 (condition
  photo UX is spec'd in `docs/week-03/condition-photo-ux.md`).
- **Persistence**: API and mobile stores are in-memory; Firestore migration is the
  End-of-Week-6 integration step.
- **Messages**: not yet built (Week 8) — `Messages` tab folded into Bookings/Profile.
- Expo build/APK: not produced this week; `npm run android` via Expo/EAS is the path.