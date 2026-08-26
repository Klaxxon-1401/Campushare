# Week 3 — Design Phase Tracker

> **Phase:** Week 3 of 12 (PROJECT_PLAN §18)
> **Deliverables:** Wireframes, DB schema, API contract, pricing survey, trust model walkthrough

---

## Status Board

| Deliverable | Artifact | Status | Notes |
|------------|----------|--------|-------|
| Survey 2 — Pricing | [`survey-2-pricing.md`](survey-2-pricing.md) | ✅ Complete | WTP per category, deposit tolerance, pricing model preferences |
| Wireframe Specs | [`wireframe-specs.md`](wireframe-specs.md) | ✅ Complete | 6 key screens with component specs |
| Database Schema v1 | [`database-schema-v1.md`](database-schema-v1.md) | ✅ Complete | Firestore collections, indexes, security rules |
| API Contract v1 | [`api-contract-v1.md`](api-contract-v1.md) | ✅ Complete | OpenAPI spec, 30+ endpoints, error handling |
| Condition Photo UX | [`condition-photo-ux.md`](condition-photo-ux.md) | ✅ Complete | Camera interface, watermark, comparison view |
| Trust & Safety Walkthrough | [`trust-safety-walkthrough.md`](trust-safety-walkthrough.md) | ✅ Complete | 4-pillar model, visual signals, risk mitigation |

---

## Key Decisions Made

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| Firestore schema uses references | Relational integrity for bookings/payments | Requires client-side joins for complex queries |
| API uses URL versioning (/v1/) | Clear version control, backwards compatible | Longer URLs |
| Watermark applied client-side | Faster capture, user preview | Server-side finalization for tamper proof |
| 48h dispute window | Prevents stale disputes, faster resolution | Tight window for slow responders |
| 1 appeal only | Prevents abuse, faster resolution | Less recourse for legitimate cases |

---

## Exit Criteria (Week 3 complete)

- [ ] Survey 2 distributed and collecting responses (target: 100+)
- [ ] All wireframes reviewed by mobile lead
- [ ] Database schema reviewed by backend lead
- [ ] API contract reviewed by backend lead
- [ ] Trust & safety model presented to team
- [ ] Week 4 design freeze gate requirements documented

---

## Carry-over into Week 4

Per PROJECT_PLAN §18, Week 4 = **Design — wireframes, UI mockups (from prototype), database schema, API contract, trust/safety design, prototype walkthrough**.

| Item | Priority | Owner |
|------|----------|-------|
| **Design Freeze Gate:** Confirm all Week 3 requirements (§8.1) | High | All |
| Wireframe → UI mockups (hi-fi) in Figma/design tool | High | Mobile lead |
| Design system implementation (colors, typography, components) | High | Mobile lead |
| Prototype walkthrough with team (all screens) | High | Mobile lead |
| Trust & safety visual design (badges, indicators) | High | Mobile lead |
| Survey 2 results analysis | Medium | Product lead |
| Campus IT email verification answer (R5 risk) | High | Team lead |
| Stripe Connect region availability (R4 risk) | High | Backend lead |
| Project scaffold setup (Week 5 prep) | Medium | Backend lead |

---

## Risk Review

| # | Risk | Score | Status | Action |
|---|------|-------|--------|--------|
| R3 | Low adoption | 15 | Active | Survey 1 results pending; trust signals designed |
| R5 | Campus IT email verification | 15 | Active | Must confirm by end of Week 4 |
| R8 | Team capacity | 12 | Active | Wireframes + schema completed; ready for implementation |

---

## Files Created This Week

```
docs/week-03/
├── WEEK_TRACKER.md              ← This file
├── survey-2-pricing.md          ← Pricing & deposit tolerance survey
├── wireframe-specs.md           ← 6 key screen wireframes
├── database-schema-v1.md        ← Firestore schema + security rules
├── api-contract-v1.md           ← OpenAPI specification
├── condition-photo-ux.md        ← Photo capture flow + watermark
└── trust-safety-walkthrough.md  ← Trust model for Week 4 freeze
```

---

*Week 3 complete. Ready for Week 4 design freeze.*