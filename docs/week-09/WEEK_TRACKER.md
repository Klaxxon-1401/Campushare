# Week 9 — Reviews, Ratings & Dispute Protection

> **Deliverables (PROJECT_PLAN §16):** post-rental ratings with photo-backed dispute handling.

## Status Board

| Deliverable | Artifact | Status | Notes |
|------------|----------|--------|-------|
| Write review | `src/screens/Reviews/ReviewsScreen.tsx` | ✅ | 1–5 stars + comment, one review per party per booking |
| Reviews about you | same screen | ✅ | Received reviews listed with star breakdown |
| Pending reviews queue | same screen | ✅ | Completed rentals not yet reviewed get surfaced |
| File dispute | `src/screens/Disputes/DisputesScreen.tsx` | ✅ | Reason chips (damage/late/not-returned/other), booking picker |
| Dispute list + status | same screen | ✅ | open / under-review / resolved with resolution text |
| Evidence tie-in | localStore | ✅ | Disputes reference the booking's timestamped condition photos |

## Rules implemented

- Reviews **only after `returned`**; both parties can review each other independently.
- **One review per party per booking** (duplicate rejected).
- A dispute is **open → under-review → resolved**; only one open dispute per booking.
- The deposit stays held while a dispute is open — resolution determines the refund/payout
  in the future payment milestone.

## Trust model

Ratings feed the lender's `ownerRating` shown on item cards. Disputes are reviewed against
the before/after condition photos captured in the Week-7 handover — that chain is the reason
photos are stage-locked and timestamped.