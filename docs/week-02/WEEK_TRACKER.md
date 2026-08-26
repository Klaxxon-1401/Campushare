# Week 2 — Planning & Requirements Tracker

> **Phase:** Week 2 of 12 (PROJECT_PLAN §18)
> **Deliverables:** Requirements spec, scope freeze, risk register v1

---

## Status Board

| Deliverable | Artifact | Status | Notes |
|------------|----------|--------|-------|
| Requirements Specification | [`requirements-specification.md`](requirements-specification.md) | ✅ Draft complete | MoSCoW + acceptance criteria; FR-18/FR-19 downgraded to S per MVP analysis |
| Scope Freeze | [`scope-freeze.md`](scope-freeze.md) | ✅ Draft complete | Awaiting team sign-off |
| Risk Register v1 | [`risk-register-v1.md`](risk-register-v1.md) | ✅ Complete | 15 risks; 8 at score ≥ 12; R3 + R5 flagged active |
| Campus IT feasibility confirmation | *(external)* | ☐ Pending | **Critical:** Must confirm by end of Week 3 — R5 blocker |
| Stripe Connect region check | *(external)* | ☐ Pending | Must confirm by end of Week 3 |

---

## Key Decisions Made

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| FR-18 (messaging) downgraded to S | Not core trust model; can launch with off-app contact if needed | Minor UX friction in v1 |
| FR-19 (reviews) downgraded to S | Reviews support long-term trust but booking lifecycle works without them | Slower reputation signal in early community |
| NFR-03 (mobile perf) kept S not M | 300ms nav is a stretch target on mid-range devices; 99.5% uptime is the priority | Risk of slightly slower UX acceptable |
| MVP cut-line drawn at req spec §6 | Non-negotiable items clearly defined to prevent scope drift | Team knows exactly what to cut if behind schedule |

---

## Exit Criteria (Week 2 complete)

- [ ] Requirements spec reviewed by all team members; change requests addressed.
- [ ] Scope freeze document signed by ≥ 2 team members.
- [ ] Risk register v1 reviewed; mitigation owners confirmed.
- [ ] Campus IT feasibility answer obtained OR escalation path documented.
- [ ] Stripe Connect region availability confirmed.

---

## Carry-over into Week 3

Per PROJECT_PLAN §18, Week 3 = **Design phase — wireframes, UI mockups, survey on pricing (Survey 2)**.

| Item | Priority | Owner |
|------|----------|-------|
| Campus IT email verification answer → if no, activate ID-card fallback path design | High | Team lead |
| Stripe Connect availability → if unavailable, research alternative payout method | High | Backend lead |
| Survey 2 — Pricing instrument (§15.1): "Willingness-to-pay per category; deposit tolerance. Sample: 100+." | High | Product lead |
| Wireframes for Home feed, Item detail, Booking flow, Listing wizard | High | Mobile lead |
| Database schema v1 draft (§9, PROJECT_PLAN) — Firestore collections | High | Backend lead |
| API contract v1 draft (§10, PROJECT_PLAN) — OpenAPI/Swagger | High | Backend lead |
| Condition photo UX mockup + watermark overlay spec | Medium | Mobile lead |
| Trust & Safety model walkthrough (§13) — present to team for Week 4 design freeze gate | Medium | Product lead |
