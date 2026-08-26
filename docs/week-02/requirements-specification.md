# CampusShare — Requirements Specification v1.0

> **Week 2 deliverable** · Formalization of PROJECT_PLAN §6
> **Status:** Draft for team review before scope freeze
> **MoSCoW legend:** M = Must · S = Should · C = Could · W = Won't (v1)
> **Traceability:** Links to PROJECT_PLAN modules (§11) and Week 1 personas

---

## 1. Document Purpose

This document converts PROJECT_PLAN §6 into a prioritized, testable specification. Every requirement has explicit acceptance criteria. **M** priority requirements must pass before v1.0 release; the scope freeze document locks this list.

---

## 2. Priority Model

| Priority | Meaning | Release rule |
|----------|---------|-------------|
| **Must** | Non-negotiable for v1.0 | Fails release gate if broken |
| **Should** | Expected in v1.0; may defer to v1.1 only with team vote | 1 deferral max if capacity impossible |
| **Could** | Nice-to-have; include only if ahead of schedule by Week 9 | No deferral cost |
| **Won't** | Excluded from v1.0 | No work until v2 scoping |

---

## 3. Functional Requirements

### 3.1 User Registration & Verification (§11.1)

| ID | Requirement | Priority | Acceptance Criteria | Module |
|----|-------------|----------|---------------------|--------|
| FR-01 | User registers with campus email + student ID | M | Form accepts email + ID; duplicate email rejected; campus domain validated server-side | M1 |
| FR-02 | System verifies user against campus records before any transaction | M | Unverified users blocked from booking/listing/messaging; verified badge shown on profile | M1 |

### 3.2 Item Listing (§11.2)

| ID | Requirement | Priority | Acceptance Criteria | Module |
|----|-------------|----------|---------------------|--------|
| FR-03 | Verified user creates listing with title, category, description, photos, price/day, deposit, availability | M | Listing persists; all required fields enforced; category from approved enum | M2 |
| FR-04 | Listing requires ≥ 1 primary photo before publishing | M | Publish button disabled until photo uploaded | M2 |

### 3.3 Search & Browse (§11.4)

| ID | Requirement | Priority | Acceptance Criteria | Module |
|----|-------------|----------|---------------------|--------|
| FR-05 | Users search items by keyword + filter by category | M | Results update in ≤ 500ms; empty state shown when no matches | M4 |
| FR-06 | User views item details, lender rating, availability calendar | M | Detail page loads in ≤ 1s; calendar shows open/booked/blocked dates | M4 |

### 3.4 Booking Lifecycle (§11.4)

| ID | Requirement | Priority | Acceptance Criteria | Module |
|----|-------------|----------|---------------------|--------|
| FR-07 | User requests booking for a date range; system validates availability | M | Overlapping bookings rejected; date range validated (no past, no > 30 days) | M4 |
| FR-08 | Lender accepts or declines a booking request | M | Notification sent on decision; declined bookings closed immediately | M4 |
| FR-09 | System calculates total = (pricePerDay × days) + deposit | M | Calculation matches display on item detail; rounding consistent | M5 |

### 3.5 Payment & Deposit (§11.5)

| ID | Requirement | Priority | Acceptance Criteria | Module |
|----|-------------|----------|---------------------|--------|
| FR-10 | Borrower pays rental fee + deposit via Stripe at booking acceptance | M | Stripe PaymentIntent created; payment succeeds before booking progresses to `paid` | M5 |
| FR-11 | System holds deposit in escrow until return confirmation | M | Deposit not released on card; visible in payment record as `frozen` | M5 |

### 3.6 Condition Photos (§11.3)

| ID | Requirement | Priority | Acceptance Criteria | Module |
|----|-------------|----------|---------------------|--------|
| FR-12 | At pickup, borrower captures "before" condition photos; timestamped server-side | M | ≥ 1 photo uploaded; server timestamp embedded; watermark applied | M3 |
| FR-13 | At return, borrower captures "after" condition photos; lender confirms return | M | ≥ 1 "after" photo; lender must confirm before funds released | M6 |

### 3.7 Return & Fund Release (§11.5–11.6)

| ID | Requirement | Priority | Acceptance Criteria | Module |
|----|-------------|----------|---------------------|--------|
| FR-14 | On confirmed return: rental fee transferred to lender; deposit refunded to borrower | M | Fee visible in lender payout within 24h; deposit refund initiated within 48h of confirmation | M5/M6 |

### 3.8 Disputes (§11.7)

| ID | Requirement | Priority | Acceptance Criteria | Module |
|----|-------------|----------|---------------------|--------|
| FR-15 | Either party raises dispute within 48h of return | M | Dispute button visible ≤ 48h post-return; funds frozen immediately on raise | M7 |
| FR-16 | Admin reviews dispute evidence and rules | M | Admin can view before/after photos + messages; ruling changes booking status | M7 |

### 3.9 Notifications (§11.8)

| ID | Requirement | Priority | Acceptance Criteria | Module |
|----|-------------|----------|---------------------|--------|
| FR-17 | System sends push notifications for booking, payment, return, dispute events | M | Notification delivered for each state change in booking lifecycle | M8 |
| FR-18 | Lender and borrower exchange in-app messages for a booking | S | Messages persist; participants = booking lender + borrower only; no spam filtering needed v1 | M8 |

### 3.10 Ratings & Reviews

| ID | Requirement | Priority | Acceptance Criteria | Module |
|----|-------------|----------|---------------------|--------|
| FR-19 | Users rate and review each other after completed rental | S | Rating 1–5 + optional text; only after confirmed return; both parties can rate once | M4 |

### 3.11 Admin

| ID | Requirement | Priority | Acceptance Criteria | Module |
|----|-------------|----------|---------------------|--------|
| FR-20 | Admin dashboard lists pending verifications and disputes | M | Dashboard loads in ≤ 2s; queues filterable; bulk actions supported | M7 |
| FR-21 | Users cancel booking before pickup per cancellation policy | M | Policy enforced (see §14.4); cancellation logged with reason | M4 |

---

## 4. Non-Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| NFR-01 | 99.5% uptime for core API | M | Monitoring confirms over 30-day window; PagerDuty alert on breach |
| NFR-02 | API p95 < 300ms reads, < 800ms writes | M | k6 load test at 5k concurrent confirms latency targets |
| NFR-03 | Mobile cold start < 3s; screen navigation < 300ms | S | Profiled on mid-range Android device (Pixel 6a or equivalent) |
| NFR-04 | Support 10k registered users, 5k concurrent | S | Firestore + API scaled to handle at 2× expected load |
| NFR-05 | Auth via Firebase Auth; TLS 1.2+ in transit; encryption at rest | M | No plaintext PII in logs; Firebase AppCheck enabled; SSL Labs A grade |
| NFR-06 | GDPR-style: data minimization, right to delete, 12-month retention | M | Account deletion request processed within 72h; retention policy documented |
| NFR-07 | SUS ≥ 4.0/5.0 in UAT | M | UAT with 20–30 students; mean score ≥ 4.0 |
| NFR-08 | No data loss; photo uploads retried automatically | M | Simulated network failure on upload: retry succeeds; no partial records in DB |
| NFR-09 | Every financial and dispute action logged | M | Audit trail queryable for any booking; logs immutable (append-only) |
| NFR-10 | iOS 16+ and Android 10+ compatible | M | E2E tests pass on both minimum OS versions |

---

## 5. Requirement → Module Matrix

| Module | §11 Reference | FR IDs | NFR IDs |
|--------|---------------|--------|---------|
| M1 — User Verification | §11.1 | FR-01, FR-02 | NFR-05, NFR-06 |
| M2 — Item Listing | §11.2 | FR-03, FR-04 | NFR-08 (photo upload retry) |
| M3 — Condition Photos | §11.3 | FR-12, FR-13 | NFR-08 |
| M4 — Search & Booking | §11.4 | FR-05, FR-06, FR-07, FR-08, FR-19, FR-21 | NFR-02, NFR-03, NFR-04 |
| M5 — Payment & Deposit | §11.5 | FR-09, FR-10, FR-11, FR-14 | NFR-09 |
| M6 — Return Confirmation | §11.6 | FR-13, FR-14 | — |
| M7 — Disputes & Admin | §11.7 | FR-15, FR-16, FR-20 | NFR-09 |
| M8 — Notifications & Messaging | §11.8 | FR-17, FR-18 | NFR-03 |

---

## 6. MVP Cut-Line (if capacity forces it)

**Non-negotiable (the trust model):** FR-01–FR-14, FR-15–FR-16, FR-17, FR-20–FR-21 + NFR-05, NFR-06, NFR-08, NFR-09.

**First deferral candidates (if capacity is tight by Week 9):**
1. FR-18 (messaging) — could use external link in v1.1
2. FR-19 (reviews) — valuable but not blocking trust model
3. NFR-03 (mobile perf targets) — aim for them but may be optimization pass

**Won't ship without team vote:** Any FR with priority M is release-gated; deferral requires written justification + risk acceptance.

---

## 7. Changes from PROJECT_PLAN §6

| Change | Rationale |
|--------|-----------|
| FR-18 downgraded to S | Messaging is valuable but not core trust model; can launch with off-app contact in v1 |
| FR-19 downgraded to S | Reviews support trust long-term but booking lifecycle works without them in v1 |
| NFR-07 kept M | SUS target is a project goal (G3); UAT gate protects adoption |
| NFR-03 kept S (not M) | Cold start target achievable; 300ms nav is a stretch target, not release gate |

---

## 8. Open

Pending survey results (Week 1 survey closed pending analysis):
- Demand scores per category may shift FR-05 filter options
- Trust barrier findings may elevate FR-18 (messaging) to M if anonymity drives adoption
