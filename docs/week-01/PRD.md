# CampusShare — Product Requirements Document (PRD)

> **Week 1 deliverable** · Planning & Requirements phase
> **Source of truth:** [`PROJECT_PLAN.md`](../../PROJECT_PLAN.md) v1.0
> **Status:** Draft for team review
> **Document owner:** Product lead

---

## 1. Product Overview

CampusShare is a campus-only, peer-to-peer short-term rental mobile app that lets verified students lend and rent items they use rarely — lab coats, blazers, sunglasses, calculators, dumbbells — instead of buying them.

Trust is engineered through four pillars:

| Pillar | Mechanism |
|--------|-----------|
| Campus-only access | Institutional email / student ID verification before any transaction |
| Monetary accountability | Rental fee + refundable deposit held in escrow via Stripe |
| Photographic evidence | Timestamped, watermarked before/after condition photos |
| Structured disputes | Time-boxed evidence window and admin ruling process |

- **Platforms:** iOS 16+, Android 10+
- **Pilot:** Single campus
- **Timeline:** 12 weeks (see PROJECT_PLAN §18)

## 2. Problem Statement

Students routinely buy items used rarely or once (₹20–₹120 per purchase). Informal borrowing among friends has no accountability: no condition record at hand-off, no agreed terms, no recourse for damage or loss. Generic marketplaces lack institutional identity verification, deposit escrow, photo evidence, and an embedded dispute process.

**Value proposition:** cut spending on occasional-use items while making peer borrowing safer and evidence-based than any open marketplace.

## 3. Goals & Objectives

### Goals
- **G1** Reduce student spending via affordable short-term rentals.
- **G2** Make P2P borrowing safe through verification, deposits, and photo evidence.
- **G3** Deliver a usable, trustworthy mobile experience students adopt.
- **G4** Maintain a fully auditable lifecycle: listing → booking → rental → return → refund.

### Success metrics (SMART)
| # | Objective | Target |
|---|-----------|--------|
| O1 | Verified accounts | 100% of transacting users |
| O2 | Photo coverage | ≥ 99% of completed rentals have before+after photos |
| O3 | Deposit turnaround | Returned or disputed within 48h of return confirmation |
| O4 | Verification onboarding | ≤ 5 minutes |
| O5 | Listing creation | ≤ 3 minutes from first photo |
| O6 | Booking + payment | ≤ 5 minutes |
| O7 | Pilot adoption | ≥ 300 active users, ≥ 500 listings in first 12 weeks |
| O8 | App quality | ≥ 90% automated test pass; 0 critical bugs at release |
| O9 | Satisfaction | UAT mean ≥ 4.0 / 5.0; SUS ≥ 70 |

## 4. Target Users & Personas

Full personas in [`personas/validation-plan.md`](personas/validation-plan.md) (validation hypotheses included).

| Persona | Role | Primary need | Key fear |
|---------|------|--------------|----------|
| **Riya**, 19–22 | Borrower | Cheap, quick rental; item matches photos | Hidden damage charges |
| **Marcus**, 21–24 | Lender | Easy listing; item returns intact; predictable payout | Theft or damage |
| **Dr. Chen**, 35–55 | Admin | Simple queues; fair auditable outcomes | Time burden, messy disputes |

## 5. Scope

### In scope (v1.0)
Registration & verification · listings with photos/pricing/availability · search & filters · booking with availability check · Stripe payments + deposit escrow · before/after condition photos · return confirmation · disputes with evidence · push notifications · in-app messaging · ratings/reviews · admin dashboard (verification queue, dispute queue, analytics).

### Out of scope (v1.0)
Multi-campus support · delivery/shipping · insurance · long-term contracts · in-app wallet · offline-first sync.

### Assumptions & constraints
Single-campus pilot · users own smartphones + cards · campus IT provides email domain whitelist or ID lookup · Stripe/Firebase available in region · 12 weeks, ~3–4 developers.

## 6. Requirements Summary

Complete tables live in PROJECT_PLAN §6. Summary:

- **21 Functional Requirements (FR-01…FR-21)** spanning registration/verification, listing CRUD, search, booking lifecycle, payments/escrow, photos, returns, disputes, notifications, messaging, reviews, admin queues, cancellation.
- **10 Non-Functional Requirements (NFR-01…NFR-10)**: 99.5% uptime; p95 < 300ms reads / < 800ms writes; cold start < 3s; 10k users / 5k concurrent scale; TLS + at-rest encryption; GDPR-style privacy with hashed student IDs; SUS ≥ 4.0/5 usability target; no data loss with upload retry; full financial audit log; iOS 16+/Android 10+.

**MVP cut-line (if capacity forces it):** messaging, analytics dashboard widgets, and review comments are first candidates to defer; verification, bookings, escrow, photos, and disputes are non-negotiable (they are the trust model).

## 7. User Flows (critical paths)

```
Verify:   Register → OTP to campus email → [optional ID photo review] → verified badge
Rent:     Search/filter → Item detail + calendar → Request dates → Lender accepts
          → Pay fee+deposit → Pickup + BEFORE photos → Rental period
          → Return + AFTER photos → Lender confirms → Fee→lender, Deposit→borrower
Dispute:  Raised ≤48h post-return → funds frozen → evidence ≤72h → admin ruling ≤5 days
```

State machines: booking `requested→accepted→paid→active→returned` (+`disputed`, `cancelled`, `declined`); dispute `open→under_review→resolved_lender|resolved_borrower|rejected`. Details: PROJECT_PLAN §11.4–11.7.

## 8. Release Criteria (v1.0 exit)

1. All FR-01…FR-14 implemented and passing integration tests (TC-01…TC-09 green).
2. Zero critical bugs; SUS ≥ 70 from UAT (20–30 students); critical tasks ≥ 90% success.
3. Security pass complete: Firestore rules reviewed, OWASP ZAP baseline clean.
4. Legal/compliance sign-off on data retention and university policy.

## 9. Risks (top 3 for this phase)

| Risk | Mitigation now (Week 1) |
|------|--------------------------|
| R2 Damage disputes | Validate evidence-flow design in interviews this week |
| R3 Low adoption | Demand survey (200+) informs launch categories & pricing signals |
| R5 Campus IT won't verify emails | Probe IT contact early; ID-photo fallback already scoped |

Full register: PROJECT_PLAN §19 (v1 risk freeze lands Week 2).

## 10. Open Questions

1. Which exact email domain(s)/lookup endpoint does Campus IT expose? *(owner: team lead, due W1)*
2. Is Stripe Connect available in our deployment country for lender payouts? *(due W2)*
3. Do we require ID-photo review for all users or only flagged ones? *(interviews will inform)*
4. Commission model post-pilot: 5–10% on rental fee only? *(deferred to budget review)*

## 11. Traceability

PRD sections map 1:1 to PROJECT_PLAN: problem (§2), goals (§3), scope (§4), personas (§5), requirements (§6), flows (§11, §12, §14), risks (§19). Any conflict resolves in favor of PROJECT_PLAN.md until v1.1.
