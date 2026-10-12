# Survey 2 — Pricing & Deposit Tolerance

> **Week 3 deliverable** · §15.1 of PROJECT_PLAN
> **Target sample:** 100+ enrolled students · **Format:** Likert + ranking + open text · **Est. time:** 4–6 min
> **Purpose:** Establish price sensitivity per item category and acceptable deposit ranges to inform v1.0 pricing defaults and escrow thresholds.
> **Distribution:** Same channels as Survey 1; can be sent to Survey 1 respondents who opted into follow-up.

---

## Screening & Consent

**S1.** Are you currently an enrolled student at this university?
- Yes → continue
- No → *end of survey*

**S2.** Consent: This anonymous survey helps us set fair rental prices and deposit amounts for a student item-rental app. No personal data is collected. Results are reported only in aggregate.
- I agree → continue · I do not agree → *end of survey*

## Section A — Current Spending Habits

**A1.** In the past 12 months, approximately how much have you spent on items you later used only a few times? *(select one)*
- `₹0` `₹1–25` `₹26–50` `₹51–100` `₹101–200` `₹200+` `Prefer not to say`

**A2.** If you could have rented those items instead of buying, how much would you have been willing to pay per day? *(open text, optional)*

## Section B — Willingness to Pay by Category

*For each item category: "What is the MAXIMUM you would pay per day to rent this item from a verified fellow student?"*

| Item category | Examples | ₹/day options |
|---|---|---|
| Academic | Lab coat, TI-84 calculator, textbooks, drafting tools | `₹1` `₹2` `₹3` `₹4` `₹5` `₹6+` `Wouldn't rent` |
| Clothing | Blazer, graduation outfit, formal dress/suit | `₹2` `₹4` `₹6` `₹8` `₹10` `₹12+` `Wouldn't rent` |
| Electronics | Projector, camera, tripod, portable charger | `₹3` `₹5` `₹8` `₹10` `₹15` `₹20+` `Wouldn't rent` |
| Fitness | Dumbbells, yoga mat, camping gear, sports equipment | `₹1` `₹2` `₹3` `₹4` `₹5` `₹6+` `Wouldn't rent` |

**B1.** *(grid as above — 4 rows, one selection per row)*

**B2.** Which category would you be most price-sensitive about? *(one choice from above)*

**B3.** Is there a category where you'd happily pay more for better quality/condition? *(open text, optional)*

## Section C — Deposit Tolerance

**C1.** For a rental item valued at ₹50, what is the maximum deposit you would be comfortable with? *(select one)*
- `₹5` `₹10` `₹15` `₹20` `₹25` `₹30` `₹40` `₹50` `I wouldn't pay any deposit`

**C2.** For a rental item valued at ₹100, what is the maximum deposit you would be comfortable with? *(select one)*
- `₹10` `₹20` `₹30` `₹40` `₹50` `₹60` `₹75` `₹100` `I wouldn't pay any deposit`

**C3.** If deposits were returned within 48 hours of item return, how would that affect your willingness to pay a higher deposit? *(select one)*
- `I'd be comfortable with a higher deposit` `No change` `I'd still prefer a lower deposit` `Not sure`

**C4.** What would make you trust that a deposit would actually be returned? *(select up to 3)*
- `Clear refund policy shown upfront`
- `Guaranteed return window (e.g., 48h)`
- `Ability to see other users' refund experiences`
- `University backing or oversight`
- `Stripe/PayPal buyer protection`
- `Photo evidence system`
- `Other: ___`

## Section D — Pricing Model Preferences

**D1.** Which pricing model do you prefer for a student rental app? *(select one)*
- `Pay per day only`
- `Pay per day + small service fee`
- `Flat rate per rental (regardless of days)`
- `Negotiable between lender and borrower`

**D2.** Would you be more likely to rent if there were discounts for longer rentals? *(e.g., 5+ days = 10% off)*
- `Yes, much more likely` `Somewhat more likely` `No difference` `Less likely`

**D3.** What's the minimum rental period you'd expect? *(select one)*
- `1 day` `2–3 days` `1 week` `2 weeks` `Flexible — depends on the item`

## Section E — Open Feedback

**E1.** Is there anything about pricing or deposits that would make you NOT use a student rental app? *(open text)*

**E2.** Any other thoughts on how pricing should work? *(open text, optional)*

---

### Analysis Plan (post-collection)

1. **Median WTP per category:** Use B1 responses to set default price-per-day in the app (§9 item schema).
2. **Deposit ceiling:** Use C1/C2 to set maximum deposit fields and suggest replacement-value ratios.
3. **Service fee viability:** If D1 majority prefers "per day + small fee," model 5–10% commission (§20.3).
4. **Segment cuts:** Faculty/school (from Survey 1 linkage) vs. price sensitivity — may reveal category-specific pricing opportunities.
5. **Gate:** If median WTP across all categories < ₹2/day, revisit pricing model before Week 4 design freeze.
6. **Feed into:** Database schema defaults (W3 DB draft), API pricing fields (W3 API draft), and PROJECT_PLAN §14 payment flow refinements.

*Distribution channels: same as Survey 1 (`docs/week-01/distribution-plan.md`). Prioritize respondents who opted into follow-up.*
