# Persona Validation Plan

> **Week 1 deliverable** · derived from PROJECT_PLAN §5
> **Method:** Each persona carries falsifiable hypotheses. Evidence from Survey 1 (`../surveys/survey-1-demand.md`) and interviews (`../interviews/user-interview-guide.md`) is mapped back to each hypothesis.
> **Outcome:** Each hypothesis marked ✅ confirmed / ❌ refuted / ⚠️ revised at the Week 2 review. Refutations trigger persona rewrites before design freeze (Week 4).

---

## Persona 1 — "Riya", Budget-Conscious Borrower

**Profile:** 19–22, second year, high tech comfort, needs lab coat for one lab week and blazer for one interview.

| # | Hypothesis | Evidence source | Threshold |
|---|-----------|-----------------|-----------|
| R-H1 | Students report ≥1 unmet short-term item need in past 12 months | Survey B1 | ≥ 60% answer Yes |
| R-H2 | Buying new is the dominant fallback when borrowing informally fails | Survey B2 | "Bought new" ≥ 30% |
| R-H3 | Fear of hidden damage charges is a top-3 hesitation | Survey D2 | `Fear of damage charges` in top 3 |
| R-H4 | Verification increases willingness to rent | Survey D3 | ≥ 50% say "Yes a lot"/"Somewhat" |
| R-H5 | Borrowers want fast onboarding — under ~5 minutes to first transaction | Interview Q6/Q12 | Mentioned by ≥ half of borrower-profile interviewees |

**Kill signal:** If R-H1 falls below 40%, the core demand premise weakens → escalate to Week 2 scope review.

## Persona 2 — "Marcus", Occasional-Monetizer Lender

**Profile:** 21–24, owns rarely-used items (graphing calculator), wants side income without risk of loss.

| # | Hypothesis | Evidence source | Threshold |
|---|-----------|-----------------|-----------|
| M-H1 | A meaningful share of students own items used < 5×/year they'd consider renting out | Survey C1 + B4 | ≥ 25% report owning such an item |
| M-H2 | Damage/theft anxiety blocks informal lending today | Survey B4 + Interviews Q4/Q7 | `Item returned damaged` or `lost` cited by ≥ 30% of those who lent informally |
| M-H3 | Deposit escrow + photo proof materially raise listing willingness | Interview Q8/Q9 | Positive reaction from majority of lender-profile interviewees |
| M-H4 | Listing friction is the main adoption barrier for lenders | Interview Q11 | Mentioned unprompted by ≥ half |

**Kill signal:** If M-H1 < 10%, supply side is thin → consider seeding listings via campus clubs/partnerships (feeds Risk R3 mitigation).

## Persona 3 — "Dr. Chen", Campus Administrator

**Profile:** 35–55, student affairs, low-medium tech, accountable for student wellbeing and conduct.

| # | Hypothesis | Evidence source | Threshold |
|---|-----------|-----------------|-----------|
| D-H1 | Admins support a platform only if disputes are auditable and time-boxed | Admin interviews Q7–Q9 analog | Stated as requirement by all admin participants |
| D-H2 | Admins will not accept heavy operational load — queues must be simple | Admin interviews | Explicit concern raised by ≥ 1 admin; design must cap daily review burden |
| D-H3 | Institutional email verification is acceptable and expected | Admin interviews + Survey D3 | No strong objection from admins |

**Note:** Admin sample is small (1–2); treat findings as directional, not statistical.

---

## Validation Workflow

1. **Collect:** Run survey + interviews per distribution plan (`../distribution-plan.md`).
2. **Tag:** Every interview note tagged with persona ID + hypothesis number.
3. **Score:** At end of Week 1 / start of Week 2, fill the table below.

| Hypothesis | Status | Key evidence | Action if refuted |
|-----------|--------|--------------|-------------------|
| R-H1 | ☐ | | |
| R-H2 | ☐ | | |
| R-H3 | ☐ | | |
| R-H4 | ☐ | | |
| R-H5 | ☐ | | |
| M-H1 | ☐ | | |
| M-H2 | ☐ | | |
| M-H3 | ☐ | | |
| M-H4 | ☐ | | |
| D-H1 | ☐ | | |
| D-H2 | ☐ | | |
| D-H3 | ☐ | | |

4. **Feed forward:** Confirmed hypotheses lock into Week 2 requirements spec; revisions update PROJECT_PLAN §5 personas to v1.1 with a changelog entry.
