# CampusShare — Risk Register v1.0

> **Week 2 deliverable** · Merges PROJECT_PLAN §19 risks + new risks discovered in Week 1
> **Review schedule:** Every 2 weeks; next review end of Week 4 (design freeze gate)

---

## 1. Risk Scoring

| Score | Likelihood | Impact |
|-------|-----------|--------|
| 5 | Very High | Critical — threatens project viability |
| 4 | High | Major — significant schedule/quality impact |
| 3 | Medium | Moderate — recoverable with effort |
| 2 | Low | Minor — manageable |
| 1 | Very Low | Negligible |

**Risk score = Likelihood × Impact.** Top-quartile scores (≥ 12) require active mitigation plan with owner.

---

## 2. Risk Register

| # | Risk | L | I | Score | Category | Mitigation | Owner | Status |
|---|------|---|---|-------|----------|-----------|-------|--------|
| R1 | Theft or item loss | 3 | 4 | 12 | Security | Deposit escrow, verified identity, dispute process (§13) | Mobile lead | Open |
| R2 | Damage disputes | 4 | 3 | 12 | Trust | Before/after photo evidence (§11.3), structured dispute (§11.7) | Mobile lead | Open |
| R3 | Low adoption at launch | 3 | 5 | 15 | Product | Week 1 demand survey validates; launch incentive plan; campus club partnerships | Product lead | **Active** |
| R4 | Stripe/Firebase regional unavailability | 2 | 3 | 6 | Platform | Verify availability Week 3; document backup processors | Backend lead | Open |
| R5 | Campus IT refuses email domain verification | 3 | 5 | 15 | Access | Confirm by Week 3; ID-card photo + admin manual review fallback (§11.1) | Team lead | **Active** |
| R6 | Scope creep beyond freeze | 3 | 3 | 9 | Process | Scope freeze document; change request process (§5); week 4 review gate | Product lead | Open |
| R7 | Payment disputes / chargebacks | 3 | 4 | 12 | Financial | Photo evidence trail, deposit escrow, clear terms (§14) | Backend lead | Open |
| R8 | Team capacity (3–4 devs, 12 weeks) | 4 | 3 | 12 | Schedule | Prioritized backlog; weekly demos; MVP cut-line defined (§5 req spec) | Team lead | **Active** |
| R9 | Data privacy / GDPR non-compliance | 2 | 5 | 10 | Legal | Data minimization (FR-06 NFR); 12-month retention; delete request flow; ethics approval (§16.4) | Backend lead | Open |
| R10 | App store approval delays | 2 | 3 | 6 | Distribution | Submit for review by Week 9; comply with store guidelines early | Mobile lead | Open |
| R11 | Survey sample bias (non-representative) | 3 | 3 | 9 | Research | Distribution plan uses multiple channels; quota monitor; capture demographic cuts | Product lead | Open |
| R12 | Firebase cost overrun at scale | 2 | 3 | 6 | Budget | Use Firestore free tier carefully; set budget alerts; optimize query patterns in Week 6 | Backend lead | Open |
| R13 | Stripe Connect payout delay for lenders | 3 | 3 | 9 | Financial | Use standard 2-day payout initially; document instant payout as future work (§21) | Backend lead | Open |
| R14 | Condition photo tampering / re-upload | 3 | 4 | 12 | Trust | Server timestamp + watermark + immutable storage (§16.5); EXIF stripping + re-embed | Backend lead | Open |
| R15 | Double-booking race condition | 3 | 4 | 12 | Technical | Transactional Firestore writes for availability (§11.4); atomic booking creation | Backend lead | Open |

---

## 3. Top Risks (Score ≥ 12)

| # | Risk | Score | Active mitigation plan | Next review |
|---|------|-------|----------------------|-------------|
| R3 | Low adoption | 15 | W1 demand survey validates demand; launch incentive budget set aside; campus club outreach scheduled Week 2 | End W4 |
| R5 | Campus IT email verification refusal | 15 | Confirm feasibility this week (Week 2); fallback: ID-card photo + admin queue ready to implement | End W3 |
| R1 | Theft/loss | 12 | Deposit escrow + verified identity + dispute process — fully scoped in v1 requirements | End W4 |
| R2 | Damage disputes | 12 | Before/after photo system designed in §11.3; evidence chain immutable | End W4 |
| R7 | Chargebacks | 12 | Photo evidence trail + terms of service drafted alongside payment flow | End W4 |
| R8 | Team capacity | 12 | MVP cut-line defined (req spec §6); weekly demos to catch slippage early | Every 2 weeks |
| R14 | Photo tampering | 12 | Immutable storage + server watermark + timestamp (§16.5) — design Week 3–4 | End W4 |
| R15 | Double-booking race | 12 | Transactional atomicity on availability writes — validated in API design (§10) | End W4 |

---

## 4. Risk Review Log

| Date | Reviewed by | Actions taken | Risks updated |
|------|------------|---------------|---------------|
| Week 2 (this week) | Team | Initial register compiled; R3, R5 flagged active | All created |
| | | *Next review: end of Week 4* | |
