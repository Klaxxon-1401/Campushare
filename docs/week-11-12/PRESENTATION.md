# Weeks 11–12 — Presentation & Demo Script

> Slide outline plus a click-by-click live demo script for the CampusShare v1.0.0 Android build.
> Total slot: ~8 minutes (≈3 min pitch + 4 min demo + Q&A).

## A. Slide deck outline

| # | Slide | Key points |
|---|-------|------------|
| 1 | **Title** | CampusShare — peer-to-peer campus equipment rental. Team, course, date. |
| 2 | **Problem** | Students buy single-use gear (lab coats, calculators, blazers); generic marketplaces lack campus trust and deposit safety. |
| 3 | **Solution** | Same-university lending with verified identity, photo-backed condition evidence, and money-safe deposits. |
| 4 | **Target users** | Borrower (budget-conscious), Lender (occasional monetizer), Campus admin (trust & disputes). |
| 5 | **How it works** | `request → accept → pay → pickup (before photos) → active → return (after photos) → deposit released → review`. |
| 6 | **Demo** | Live walkthrough (see §B). |
| 7 | **Architecture** | Expo/RN client ↔ `services/api` facade ↔ (today) in-memory store / (next) Express + Firestore; swap point is one file. |
| 8 | **Trust & safety** | Verification banner, before/after photos, deposit escrow, dispute console, 409 anti-double-booking. |
| 9 | **Quality** | 16 mobile unit tests, 19 API smoke tests, clean types, Hermes bundle, signed APK. |
| 10 | **Roadmap** | Auth (JWT), Firestore, Stripe Connect, photo storage, push notifications. |
| 11 | **Q&A** | See §C. |

## B. Live demo script (release APK, ~4 minutes)

Seed state at launch: signed-in user **Devan D**; three bookings — a **requested** lab coat, an
**active** TI-84, and a **completed** drafting kit (with payments, photos and a chat thread);
plus notification activity and 2 students awaiting verification.

**0:00 — Sign in**
- Open the app → **Get started** → **Log in** → any email + password → **Devan D**.

**0:30 — Discover & book**
- Home: type `calculator` → open **TI-84 Graphing Calculator**.
- Show the **availability calendar** (booked days in red).
- Tap **Book this item**, pick dates, show the live **price breakdown** (`₹`), submit → request.

**1:15 — Bookings & lifecycle**
- **Bookings** tab: show the **Requested**, **Active** and **Completed** segments.
- Open the **completed Drafting Kit** booking → timeline, **rental payment + deposit refund**,
  before/after photos, and the **message thread**.

**2:00 — Return with evidence**
- Open the **active TI-84** booking → **Handover** / **Returns**.
- Capture or select an **after photo** → **Confirm return**.
- Point out: the return is **blocked without after-photos**.

**2:45 — Notifications**
- Back to Home → tap the **bell**. Show the feed (payment, return, deposit, message).
- Tap an item → it deep-links to the booking. Tap **Mark all read** → badge clears.

**3:15 — Admin console**
- **Profile → Admin dashboard**: overview tiles (items, active rentals, **revenue ₹**, deposits
  held, open disputes, pending KYC).
- **Verification queue**: **Approve** Nikhil Verma → count updates.
- **Dispute queue**: resolve a case with a resolution note.

**3:45 — Close**
- **Profile**: show currency is `₹` and the app is emoji-free (Feather icons). Wrap to roadmap.

## C. Q&A prep

| Likely question | Answer |
|-----------------|--------|
| Is the money real? | Not yet — payments are mocked. Stripe Connect with server-authoritative deposit holds is the next milestone. |
| What stops a fake user? | In production: campus-email verification + JWT; the API already has a verification gate and strict auth rate limiting. |
| What if two people book the same dates? | The server rejects the overlap with **409** — never double-booked. |
| How are disputes settled? | Against the timestamped before/after condition photos, via the admin console. |
| Does data persist? | Not in the demo (in-memory); Firestore with at-rest encryption is planned. |
| Why not emojis? | Consistent Feather iconography and a clean, professional visual language. |

## D. One-line summary

**CampusShare turns under-used campus gear into safe, trusted, same-university rentals — with
evidence-backed handovers and deposit protection, shipped as an installable Android app.**
