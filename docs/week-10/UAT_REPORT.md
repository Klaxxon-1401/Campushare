# Week 10 — UAT Report

> **Scope:** user-acceptance testing for CampusShare v1.0.0 (Android).
> **Method:** scripted acceptance runs against the release build, backed by the automated
> suites. A live 20–30 student beta cohort is the remaining plan item (PROJECT_PLAN §17.3).

## 1. What was tested

| Layer | Where | Result |
|-------|-------|--------|
| Scripted critical test cases (TC-01…TC-09, PROJECT_PLAN §17.2) | App + API | See §3 |
| Mobile unit tests | `mobile/scripts/unit-test.mjs` | 16 / 16 |
| API end-to-end smoke | `api/scripts/smoke.mjs` | 19 / 19 |
| TypeScript | `tsc --noEmit` | Clean |
| Android bundle | `expo export -p android` | Builds (Hermes) |
| Manual walkthrough | Release APK, physical device | Pass (see §4) |

## 2. UAT script (task-based)

Each participant is asked to complete the core journey unaided. Expectation: ≥ 90 % task success,
no critical bugs (PROJECT_PLAN §17.3).

1. **Sign in** — open the app and enter any email + password.
2. **Find gear** — search for a calculator; filter to a category.
3. **Book** — open an item, choose dates, submit a request.
4. **Accept & pay** — as the lender, accept; as the borrower, pay rental + deposit.
5. **Capture evidence** — take "before" photos; confirm pickup.
6. **Message** — send a message in the booking thread.
7. **Return** — capture "after" photos; confirm return.
8. **Deposit** — release the deposit (lender) and check the refund + notification.
9. **Review** — leave a 1–5 star review.
10. **Dispute (optional)** — file a dispute and confirm it appears in the admin queue.

**Metrics to collect from a live cohort:** task success rate, time-on-task, SUS score, NPS,
open feedback. **Exit criteria:** SUS ≥ 70, all critical tasks ≥ 90 % success, no critical bugs.

## 3. Critical test-case results (PROJECT_PLAN §17.2)

| ID | Scenario | Expected | Result | Notes |
|----|----------|----------|--------|-------|
| TC-01 | Unverified user books | Rejected (403) | **Partial** | API enforces the verification gate; the demo signs in as a *verified* user, so the blocked path isn't reachable from the UI. Client-side gate lands with real auth. |
| TC-02 | Double-book same item/date | Second request fails, no overlap | **Verified** | API returns **409** (smoke); the local store returns `UNAVAILABLE` (409). Availability calendar also reflects booked days. |
| TC-03 | Pay with insufficient funds | Payment fails; booking stays `accepted`; retry allowed | **Not implemented** | Payments are mocked and always succeed; insufficient-funds handling arrives with Stripe Connect (`PaymentScreen` already models failure states). |
| TC-04 | Return without after-photos | Return blocked until photos uploaded | **Verified** | `confirmReturn` rejects with `EVIDENCE_REQUIRED`; the Handover screen gates the action on after-photos. |
| TC-05 | Dispute without evidence | Rejected with rationale | **Partial** | A dispute requires a reason + description and is adjudicated against the timestamped before/after photos; "evidence" here means the booking's own condition photos. |
| TC-06 | Lender confirms return | Fee → lender, deposit → borrower, ratings enabled | **Verified** | `releaseDeposit` issues the refund; reviews unlock once the booking is `returned`. |
| TC-07 | Cancel < 48 h | Fee retained, deposit refunded | **Not implemented** | `cancelBooking` only sets the terminal `cancelled` status; the tiered cancellation policy (PROJECT_PLAN §14.4) is a payments-phase task. |
| TC-08 | Photo upload interrupted | Retry; no partial record | **Verified** | An evidence record is written only after the picker returns a URI, so an interruption leaves no partial row. |
| TC-09 | Admin resolves dispute | Funds distributed per ruling; audit log written | **Partial** | The Admin dashboard resolves a dispute and stores a resolution + timestamp; automated fund distribution is a payments-phase task. |

Legend: **Verified** = implemented and exercised; **Partial** = core behaviour present, full
backend behaviour pending; **Not implemented** = scoped to the post-course payments phase.

## 4. Manual walkthrough result

Run on a physical Android device with the release APK. All ten scripted steps completed without a
crash. Observed and confirmed:

- New notifications appear for booking requests, accept/decline, payment, pickup/return reminders,
  return confirmation, deposit refund, dispute updates, messages and reviews.
- The notification **bell badge** clears with "Mark all read" and tapping an item deep-links to the
  booking.
- The **Admin dashboard** shows live analytics, the verification queue (2 pending students seeded)
  and the dispute queue.
- Currency renders as `₹` throughout; no emojis appear anywhere in the UI.

## 5. Open gaps (tracked, not regressions)

1. **Live 20–30 student beta cohort** — see §2 metrics/exit criteria.
2. **Cancellation policy fees** (TC-07) and **insufficient-funds handling** (TC-03).
3. **Automated fund distribution** on dispute resolution (TC-09).

These are all gated on the payments/auth milestones and are listed in `RELEASE_NOTES.md` and
`PROGRESS.md` §11.
