# Survey 1 — Demand Validation

> **Week 1 deliverable** · §15.1 of PROJECT_PLAN
> **Target sample:** 200+ enrolled students · **Format:** Likert + open text · **Est. time:** 5–7 min
> **Purpose:** Establish which items students need short-term and how they currently solve it, to validate demand before design freeze (Week 4).
> **Ethics:** Anonymous; consent statement on first page; opt-out anytime. Institutional ethics approval requested where required.

---

## Screening & Consent

**S1.** Are you currently an enrolled student at this university?
- Yes → continue
- No → *end of survey*

**S2.** Consent: This anonymous survey helps us design a student item-rental app. No personal data is collected. Results are reported only in aggregate.
- I agree → continue · I do not agree → *end of survey*

## Section A — Respondent Profile

**A1.** Year of study: `1st` `2nd` `3rd` `4th+` `Postgraduate`

**A2.** Faculty/school: *(dropdown, incl. "Other")*

**A3.** Living situation: `On-campus housing` `Off-campus, ≤15 min from campus` `Off-campus, >15 min` 

**A4.** Monthly discretionary budget: `< ₹25` `₹25–75` `₹75–150` `> ₹150` `Prefer not to say`

## Section B — Current Behavior

**B1.** In the past 12 months, did you ever need an item for a short period but didn't own it? *(Y/N)*
- If **N**, skip to D1.

**B2.** What did you do? *(select one)*
- `Bought it new`
- `Bought it second-hand`
- `Borrowed from a friend/classmate`
- `Rented from a shop/online service`
- `Went without / found a workaround`

**B3.** Roughly what did that cost you, or what would it have cost to buy? *(open text, optional)*

**B4.** When borrowing informally from friends, have you experienced any of these problems? *(select all)*
- `Awkwardness asking`
- `No record of item condition at hand-off`
- `Item returned damaged — dispute over who pays`
- `Item lost / never returned`
- `Couldn't find anyone who owned one`
- `None`

## Section C — Item Demand Grid

*For each item: "How often would you have needed this in the past year?"*
Likert: `Never` `Once` `2–3 times` `4+ times`

| Item category | Examples |
|---|---|
| Academic | Lab coat, TI-84 calculator, textbooks, drafting tools |
| Clothing | Blazer, graduation outfit, formal dress/suit, cultural event attire |
| Electronics | Projector, camera, tripod, portable charger, presentation clicker |
| Fitness | Dumbbells, yoga mat, camping gear, sports equipment (racquet, cleats) |
| Other | Party supplies, tools, luggage for breaks |

**C1.** *(grid as above — 5 rows)*

**C2.** Which single category above would make you most likely to try a rental app? *(one choice)*

**C3.** Is there an item we missed that you'd want to rent short-term? *(open text)*

## Section D — Willingness & Trust Teaser

*(Pricing depth is deferred to Week 3's dedicated pricing survey — here we only measure direction.)*

**D1.** How likely would you be to rent occasional-use items from verified fellow students instead of buying? Likert 1–5 (`Very unlikely` → `Very likely`)

**D2.** What would make you hesitant? *(select up to 3)*
- `Fear of damage charges`
- `Hygiene/cleanliness concerns`
- `Not trusting strangers' photos`
- `Deposit too high / money locked up`
- `Effort of pickup/return`
- `Privacy (students knowing my business)`
- `Nothing — I'd use it` 

**D3.** Would verification (only enrolled students can join) increase your trust? `Yes a lot` `Somewhat` `No difference` `Less trust`

**D4.** *(optional open)* What is the one thing a student rental app MUST get right for you to use it?

---

### Analysis Plan (post-collection)

1. **Demand score per category:** % answering "2–3" or "4+" on C1 × mean D1 likelihood.
2. **Segment cuts:** year of study × living situation vs. demand (A1/A3).
3. **Top hesitations:** rank D2 frequencies → feeds Trust & Safety model (§13) review in Week 3–4.
4. **Persona check:** compare B2/B4 responses against persona hypotheses in `personas/validation-plan.md`.
5. **Gate:** proceed with v1 scope if ≥ 60% of respondents report ≥1 unmet short-term need (B1=Y) AND mean D1 ≥ 3.0. Otherwise revisit scope at Week 2 review.

*Distribution channels and quotas: see `../distribution-plan.md`.*
