# CampusShare — Scope Freeze Document v1.0

> **Week 2 deliverable** · Locks v1.0 scope based on PROJECT_PLAN §4 + Week 2 Requirements Spec
> **Status:** Pending team sign-off
> **Rule:** Any scope addition after sign-off requires a formal change request + team vote.

---

## 1. Scope Freeze Definition

This document formalizes what v1.0 **will** and **will not** include. Once signed, this is the baseline scope for the 12-week build. Additions require a change request approved by ≥ 2 team members; removals require documented justification.

---

## 2. In Scope (v1.0)

| # | Feature | FR IDs | Required by |
|---|---------|--------|-------------|
| 1 | Campus email + student ID registration | FR-01 | Week 5 (§18) |
| 2 | Email OTP verification; verified badge on profile | FR-02 | Week 5 |
| 3 | Item listing (title, category, description, photos, price/day, deposit, availability calendar) | FR-03, FR-04 | Week 6 |
| 4 | Keyword search + category filter | FR-05 | Week 6 |
| 5 | Item detail page (photos, pricing, lender rating, calendar) | FR-06 | Week 6 |
| 6 | Booking request with availability validation | FR-07, FR-08 | Week 6 |
| 7 | Stripe PaymentIntent for fee + deposit | FR-09, FR-10, FR-11 | Week 7 |
| 8 | Deposit escrow held until return confirmed | FR-11 | Week 7 |
| 9 | Before/after condition photo capture with watermark + server timestamp | FR-12, FR-13 | Week 7 |
| 10 | Return confirmation + fund release (fee → lender, deposit → borrower) | FR-14 | Week 7–8 |
| 11 | Dispute raise (≤ 48h post-return) + fund freeze | FR-15 | Week 8 |
| 12 | Admin dispute resolution with evidence | FR-16, FR-20 | Week 8 |
| 13 | Push notifications for booking, payment, return, dispute events | FR-17 | Week 8 |
| 14 | Booking cancellation per policy (§14.4) | FR-21 | Week 8 |
| 15 | In-app messaging scoped to bookings | FR-18 | Week 8 |
| 16 | Ratings and reviews post-rental | FR-19 | Week 8 |

### Non-functional scope (in v1.0)

| # | NFR | Target |
|---|-----|--------|
| 1 | Firebase Auth + TLS + at-rest encryption | NFR-05 |
| 2 | GDPR: data minimization, delete rights, 12-month retention | NFR-06 |
| 3 | Photo upload retry (no data loss) | NFR-08 |
| 4 | Full financial + dispute audit trail | NFR-09 |
| 5 | iOS 16+ and Android 10+ support | NFR-10 |
| 6 | 99.5% API uptime | NFR-01 |
| 7 | API p95 < 300ms reads / < 800ms writes | NFR-02 |
| 8 | SUS ≥ 4.0/5.0 in UAT | NFR-07 |

---

## 3. Explicitly Out of Scope (v1.0)

| # | Feature | Confirmed rationale | PLAN §4.2 ref |
|---|---------|---------------------|--------------|
| 1 | Multi-campus / cross-institution support | Single campus pilot first | §4.2 |
| 2 | Item delivery / shipping | In-person pickup only | §4.2 |
| 3 | Insurance integration | Too complex for v1; deposits cover | §4.2 |
| 4 | Long-term rental contracts | v1 = short-term only | §4.2 |
| 5 | In-app wallet / balance | Deposits returned directly to card | §4.2 |
| 6 | Offline-first sync | Complex for 12-week timeline | §4.2 |
| 7 | AI photo damage comparison | Future work (§21) | §21 |
| 8 | Smart locker / kiosk handoff | Future work (§21) | §21 |
| 9 | Analytics dashboard beyond basic admin KPIs | Complex analytics deferred | §10.7 |
| 10 | Localization / multi-language | Not enough time; English only | §21 |

---

## 4. Scope Change Control Process

1. Change request submitted as a GitHub issue with: description, rationale, FR ID proposed, impact estimate.
2. Reviewed in next team standup; requires ≥ 2 approvals to proceed.
3. If approved: new FR added to requirements spec with priority, update this document's §2.
4. If a new FR displaces existing work: either a v1.0 FR is downgraded to S/C/W, or the timeline extends.
5. Any change impacting Week 9+ schedule flagged immediately.

---

## 5. Assumptions (confirmed at freeze)

| Assumption | Status |
|-----------|--------|
| Single-campus pilot | ✅ Confirmed |
| Campus IT provides email domain whitelist or lookup | ☐ Pending — must confirm by Week 3 |
| Stripe Connect available in deployment country | ☐ Pending — must confirm by Week 3 |
| Users own iOS/Android smartphones + credit/debit card | ✅ Assumed per §4.3 |
| 12-week timeline, ~3–4 developers | ✅ Confirmed |
| Firebase + Stripe available in region | ✅ Assumed; verify Week 3 |

---

## 6. Sign-Off

| Name | Role | Date | Signature |
|------|------|------|-----------|
| | Team Lead | | |
| | Backend Lead | | |
| | Mobile Lead | | |
| | Product Lead | | |
