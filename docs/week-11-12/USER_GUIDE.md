# CampusShare — User Guide

> For students and campus admins using the CampusShare Android app (v1.0.0).
> Written for the demo build, which runs on a self-contained local data store.

## 1. What CampusShare does

CampusShare lets verified students at the same university lend and borrow everyday campus
gear — lab coats, calculators, blazers, drafting kits, sports gear and more — with:

- **Verified identity** in a same-campus trust circle.
- **Photo-backed condition evidence** captured at pickup and return.
- **Money-safe deposits** held during a rental and released on a clean return.
- **Disputes** reviewed against the timestamped photos.

## 2. Signing in (demo)

The demo has no real authentication yet, so **any non-empty email and password** gets you in.

1. Open the app → **Get started**.
2. On **Log in**, type any email (e.g. `devan.d@student.university.edu`) and any password.
3. You enter the app as the seeded user **Devan D**.

> You can also walk the full sign-up flow (**Create account → OTP → verification banner**),
> but the demo lands you on the same seeded account.

## 3. Home & discovery

- **Search bar** at the top — search by title, keyword or category.
- **Category chips** — filter to Academic, Clothing, Electronics, Fitness or Other.
- **Item cards** show the price per day and the deposit.
- The header has three controls: **messages**, **notifications** (bell) and your **avatar**.

Tap an item to see its description, condition note, the lender, and an **availability
calendar** (green = open, red = booked/blocked).

## 4. Booking an item

1. Open an item → **Book this item**.
2. Pick a **start** and **end** date (dates already booked are disabled; max 30 days).
3. Review the live **price breakdown** (rental fee + refundable deposit).
4. Submit the request → the booking starts as **requested**.

The lender **accepts** or **declines**. You can't double-book — if two people request the
same dates, the second request is rejected with a clear message.

## 5. Paying (and the deposit)

Once the lender accepts, open the booking → **Pay now**.

- Choose **UPI**, **Card** or **Wallet** (mock — all succeed instantly).
- The total = **rental fee + deposit**. The deposit is *held*, not spent.
- Your booking moves to **paid** and you get a pickup reminder.

> The deposit is returned to you in full when the lender confirms a clean return.

## 6. Handover photos (condition proof)

Open the booking → **Handover**.

1. At pickup, capture **before photos** (camera or gallery) with an optional note.
2. Confirm pickup → the rental becomes **active**.
3. At return, capture **after photos**, then **confirm return**.

Photos are **stage-locked**: "before" only before pickup, "after" only while active. A return
cannot be completed without after-photos.

## 7. Messaging

Every booking has a private thread. Open the booking → **Message**, or use the **messages**
icon on the Home header. Messages are scoped to that rental.

## 8. Returns & deposits

In **Returns** (tab) or the booking detail:

1. Capture after-photos and **confirm return** → status **returned**.
2. The lender reviews the evidence and **releases the deposit**.
3. You receive the deposit back as a refund and the rental is complete.

## 9. Reviews

After a rental is **returned**, both parties can leave a **1–5 star** rating and a comment —
one review per party per booking. Open **Profile → Reviews** to rate a completed rental or read
reviews you've received.

## 10. Disputes

If something goes wrong (damage, late return, not returned):

1. Open **Profile → Disputes** → **File a dispute**.
2. Pick the rental, choose a reason, and describe what happened.
3. The campus admin reviews the case against the before/after photos.
4. You're notified when it's **resolved**.

## 11. Notifications

Tap the **bell** on the Home header (or **Profile → Notifications**) to see activity:

- Booking requests and accept/decline decisions
- Payment confirmations and pickup/return reminders
- Return confirmations and deposit refunds
- Dispute updates, new messages, and reviews received

Unread items are highlighted; tap one to jump to the relevant booking. Use **Mark all read** to
clear the badge.

## 12. Admin dashboard (demo)

Open **Profile → Admin dashboard** for the campus-admin view:

- **Overview tiles** — items, active rentals, rental revenue (₹), deposits held, open disputes,
  pending verifications.
- **Bookings by status** — a live breakdown.
- **Verification queue** — approve or reject students awaiting verification.
- **Dispute queue** — review a case and enter a resolution.

> Actions apply to the current session only; server-side roles arrive with the Firebase auth
> milestone.

## 13. Managing your own listings

- **Create** (centre + button) → 3-step wizard: details → pricing/deposit → photos.
- **Profile → My Listings** → publish a draft, edit, or delete it.

## 14. Troubleshooting & known limitations

| Symptom | Explanation |
|---------|-------------|
| Data resets when I restart the app | The demo uses an in-memory store; persistence arrives with Firestore. |
| Camera does nothing on an emulator | `expo-image-picker` needs a device/emulator with a camera; use the photo library as a fallback. |
| Prices show `₹` | Currency is Indian Rupees (INR) throughout. |
| Login accepts anything | Real auth/JWT is a post-course task. |
| Payments always succeed | Payments are mocked; Stripe Connect is a post-course task. |
