# Week 7 — Payments, Deposits & Safe Handover

> **Deliverables (PROJECT_PLAN §14):** mock payments, deposit hold/release, condition-photo
> evidence, and the pickup → return handover loop.

## Status Board

| Deliverable | Artifact | Status | Notes |
|------------|----------|--------|-------|
| Payment screen (UPI / card / wallet) | `src/screens/Payment/PaymentScreen.tsx` | ✅ | Method selector, live price via `PriceSummary`, simulated processing |
| Deposit hold & release | `localStore.payBookingAndCharge` / `releaseDeposit` | ✅ | Rental charged on `accepted → paid`; deposit refunded on clean return |
| Condition-photo evidence | `src/screens/Handover/PhotoCaptureScreen.tsx` | ✅ | `expo-image-picker` camera/gallery, timestamped + note, stage-locked |
| Handover hub | `src/screens/Handover/HandoverScreen.tsx` | ✅ | 6-step checklist, evidence list, money status, role-aware actions |
| Return flow | BookingDetail / Returns / Handover | ✅ | “after” photos required before confirming return; lender releases deposit |
| Cancellation guard | `cancelBooking` | ✅ | Only before `paid` |
| Booking detail rework | `src/screens/Booking/BookingDetailScreen.tsx` | ✅ | Timeline, money status, per-status actions, message/review/dispute entry points |

## Rules implemented

- **Charge on accept:** the borrower pays `rentalFee + deposit` only after the lender accepts.
- **Deposit held, not spent:** shown separately everywhere; released via a `refund` payment record.
- **Stage-locked evidence:** “before” only between `accepted`/`paid`; “after” only while `active`.
- **Photos gate the state machine:** pickup requires before-photos; return requires after-photos;
  deposit release is the lender's explicit action (with the evidence visible).

## Demo path (from seed data)

1. Borrow **TI-84** (`bk_1002`, active) → Returns tab → *Capture after photos & return* →
   photo → confirm return → lending side releases the deposit.
2. New request on any item → lender accepts → borrower pays on the Payment screen →
   handover (before photos → pickup → after photos → return → deposit back).

## Notes for the real backend

Payment primitives above mirror the Stripe flow: `PaymentIntent` (capture rental) and a
held `Transfer`/refund for the deposit. Swapping `localStore` bodies for the Express
endpoints at `POST /bookings/:id/pay` etc. is the integration step (Week 10+).
`POST /bookings/:id/pay` in the API already responds with a mock `payment` record.