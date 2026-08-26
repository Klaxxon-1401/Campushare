# Trust & Safety Model Walkthrough

> **Week 3 deliverable** · §13 of PROJECT_PLAN
> **Purpose:** Present to team for Week 4 design freeze gate
> **Reference:** `design/design.md` for visual trust signals, `docs/week-02/requirements-specification.md` for requirements

---

## 1. Trust Model Overview

CampusShare's trust model is built on **four pillars** that work together to create a safe, accountable rental experience:

1. **Campus-only access** — Every user verified against institutional records
2. **Monetary accountability** — Payments and deposits held in escrow
3. **Photographic evidence** — Timestamped before/after condition photos
4. **Structured disputes** — Clear, auditable resolution process

```
┌─────────────────────────────────────────────────┐
│                 TRUST MODEL                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐    ┌─────────────┐            │
│  │  CAMPUS     │    │  MONETARY   │            │
│  │  VERIFICATION│   │  ESCROW     │            │
│  │             │    │             │            │
│  │ • Email OTP │    │ • Deposits  │            │
│  │ • Student ID│    │ • Fees      │            │
│  │ • Admin     │    │ • Refunds   │            │
│  │   review    │    │ • Payouts   │            │
│  └─────────────┘    └─────────────┘            │
│                                                 │
│  ┌─────────────┐    ┌─────────────┐            │
│  │  PHOTO      │    │  DISPUTE    │            │
│  │  EVIDENCE   │    │  RESOLUTION │            │
│  │             │    │             │            │
│  │ • Before/   │    │ • 48h window│            │
│  │   after     │    │ • Evidence  │            │
│  │ • Timestamp │    │ • Admin     │            │
│  │ • Watermark │    │   ruling    │            │
│  └─────────────┘    └─────────────┘            │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 2. Pillar 1: Campus-Only Access

### 2.1 Verification Flow

```
┌─────────────────────────────────┐
│ Registration                    │
│ • Campus email + student ID     │
│ • Password (min 8 chars)        │
├─────────────────────────────────┤
│ Email Verification              │
│ • OTP sent to campus email      │
│ • 6-digit code                  │
│ • 15-minute expiry              │
├─────────────────────────────────┤
│ Profile Completion              │
│ • Name, phone (optional)        │
│ • Profile photo (optional)      │
├─────────────────────────────────┤
│ Verification Status: PENDING    │
│ • Can browse items              │
│ • Cannot book, list, or message │
├─────────────────────────────────┤
│ Admin Review (if flagged)       │
│ • ID card photo upload          │
│ • Manual review within 24h      │
├─────────────────────────────────┤
│ Verification Status: VERIFIED   │
│ • Full access to all features   │
│ • Green badge on profile        │
└─────────────────────────────────┘
```

### 2.2 Visual Design (Trust Signals)

**Verification Badge:**
- Green shield icon (16px)
- "Verified" text in green (#27AE60)
- Appears next to user name everywhere

**"University Verified Only" Banner:**
- Green background (#2ECC71 at 10% opacity)
- Shield icon + text
- Prominent in header and registration screens

**Unverified State:**
- Gray badge with "Pending Verification"
- Limited access indicators
- Clear path to complete verification

### 2.3 Security Measures

- **Email domain whitelist:** Only `@university.edu` accepted
- **OTP expiration:** 15 minutes
- **Rate limiting:** 3 OTP requests per hour
- **ID verification:** Manual review for flagged accounts
- **Admin queue:** Priority processing for verification requests

---

## 3. Pillar 2: Monetary Accountability

### 3.1 Payment Flow

```
┌─────────────────────────────────┐
│ Booking Accepted                │
│ • Lender accepts request        │
│ • Payment due within 24h        │
├─────────────────────────────────┤
│ Payment Processing              │
│ • Stripe PaymentIntent created  │
│ • Fee + deposit charged         │
│ • Funds held in escrow          │
├─────────────────────────────────┤
│ Rental Period                   │
│ • Item in borrower's possession │
│ • Deposit frozen in escrow      │
├─────────────────────────────────┤
│ Return Confirmed                │
│ • Lender confirms return        │
│ • Fee transferred to lender     │
│ • Deposit refunded to borrower  │
│ • 48h refund guarantee          │
├─────────────────────────────────┤
│ Dispute (if raised)             │
│ • Funds frozen immediately      │
│ • Evidence collection           │
│ • Admin ruling                  │
└─────────────────────────────────┘
```

### 3.2 Visual Design (Money Flow)

**Payment Confirmation:**
- Green checkmark with "Payment Secure"
- Breakdown: Rental fee + Deposit = Total
- Stripe badge for credibility

**Escrow Status:**
- "Deposit Held in Escrow" with lock icon
- Countdown: "Refund within 48h of return"
- Progress bar showing refund timeline

**Refund Confirmation:**
- Green success message
- Refund amount and timeline
- Transaction ID for records

### 3.3 Security Measures

- **Stripe integration:** PCI-compliant payments
- **Escrow system:** Deposits held until return confirmed
- **Refund guarantee:** 48-hour automatic refund
- **Chargeback protection:** Photo evidence for disputes
- **Audit trail:** All financial actions logged

---

## 4. Pillar 3: Photographic Evidence

### 4.1 Photo Capture Flow

```
┌─────────────────────────────────┐
│ Pickup (Before Photos)          │
│ • Minimum 1 photo required      │
│ • Recommended: 3 photos         │
│ • Front, back, damage zones     │
├─────────────────────────────────┤
│ Watermark Applied               │
│ • User name + timestamp         │
│ • Server-generated time         │
│ • Verification badge            │
├─────────────────────────────────┤
│ Upload to Firebase Storage      │
│ • Immutable after upload        │
│ • Hash verification             │
│ • Backup to cloud               │
├─────────────────────────────────┤
│ Return (After Photos)           │
│ • Same angles as before         │
│ • Side-by-side comparison       │
│ • Damage detection highlights   │
├─────────────────────────────────┤
│ Lender Review                   │
│ • Compare before/after          │
│ • Confirm return or raise issue │
└─────────────────────────────────┘
```

### 4.2 Visual Design (Evidence)

**Watermark Overlay:**
- Bottom-left corner
- Semi-transparent black background
- White text: Name, timestamp, verification badge
- Visible but not obtrusive

**Photo Comparison:**
- Side-by-side layout
- Clear "Before" / "After" labels
- Zoom capability for detail
- Difference highlights (future: AI damage detection)

**Evidence Locker:**
- Organized by booking
- Chronological order
- Searchable and filterable
- Exportable for disputes

### 4.3 Security Measures

- **Immutable storage:** No delete/replace after upload
- **Hash verification:** SHA-256 checksums
- **Server timestamp:** Prevents client-side manipulation
- **Access control:** Only booking participants can view
- **Retention:** 12 months, then archived

---

## 5. Pillar 4: Structured Disputes

### 5.1 Dispute Flow

```
┌─────────────────────────────────┐
│ Dispute Raised (≤48h post-return)│
│ • Reason: damage, missing, late │
│ • Description + evidence        │
│ • Funds frozen immediately      │
├─────────────────────────────────┤
│ Evidence Collection (72h)       │
│ • Both parties submit evidence  │
│ • Photos, messages, timestamps  │
│ • Clear deadline                │
├─────────────────────────────────┤
│ Admin Review (≤5 business days) │
│ • Side-by-side photo comparison │
│ • Message thread review         │
│ • Evidence evaluation           │
├─────────────────────────────────┤
│ Ruling                          │
│ • Resolved in favor of lender   │
│ • Resolved in favor of borrower │
│ • Rejected (insufficient evidence)│
├─────────────────────────────────┤
│ Fund Distribution               │
│ • Deposit retained/refunded     │
│ • Fee still paid to lender      │
│ • Resolution amount deducted    │
├─────────────────────────────────┤
│ Appeal (1 round)                │
│ • New evidence required         │
│ • Final admin decision          │
└─────────────────────────────────┘
```

### 5.2 Visual Design (Disputes)

**Dispute Button:**
- Red/orange warning color
- "Raise Dispute" text with flag icon
- 48-hour countdown visible
- Clear eligibility criteria

**Evidence Submission:**
- Photo upload with guidance
- Message thread reference
- Text description field
- Deadline countdown

**Admin Dashboard:**
- Priority queue with severity levels
- Side-by-side evidence view
- Decision buttons with confirmation
- Rationale text field

### 5.3 Security Measures

- **48-hour window:** Prevents stale disputes
- **72-hour evidence:** Clear deadlines prevent delays
- **5-day admin review:** Timely resolution
- **1 appeal only:** Prevents abuse
- **Audit trail:** All decisions logged

---

## 6. Visual Trust Signals

### 6.1 Trust Badges

| Badge | Design | Meaning |
|-------|--------|---------|
| **Verified** | Green shield + checkmark | Email/ID verified |
| **Trusted Lender** | Gold star + rating | 5+ successful rentals |
| **Responsive** | Lightning bolt | <1h average response time |
| **Deposit Protected** | Lock icon | Funds in escrow |

### 6.2 Trust Indicators

**On Item Cards:**
- Lender verification badge
- Rating stars
- "Condition Verified" tag
- Deposit amount displayed

**On Booking Flow:**
- "Secure Payment" badge
- "Deposit Protected" message
- "Refund Guaranteed" promise
- Clear cancellation policy

**On Profile:**
- Verification status prominent
- Rental history count
- Average rating
- Response time

### 6.3 Trust-Building Copy

**Registration:**
- "Join a verified community of students"
- "Only university students can join"
- "Your identity is protected"

**Booking:**
- "Pay securely with Stripe"
- "Your deposit is held in escrow"
- "Full refund within 48 hours of return"

**Returns:**
- "Return confirmed by lender"
- "Deposit refunded to your card"
- "Thank you for using CampusShare"

---

## 7. Risk Mitigation

### 7.1 Identified Risks

| Risk | Mitigation | Status |
|------|-----------|--------|
| **Theft/loss** | Deposit escrow + verified identity + disputes | Implemented |
| **Damage disputes** | Before/after photos + evidence chain | Implemented |
| **Low adoption** | Trust signals + campus verification | In progress |
| **Photo tampering** | Immutable storage + server timestamp | Implemented |
| **Double-booking** | Atomic availability writes | Implemented |
| **Payment bypass** | Stripe-only + server validation | Implemented |

### 7.2 Security Measures

- **Firebase Auth:** Secure authentication
- **Firestore Rules:** Role-based access control
- **Stripe:** PCI-compliant payments
- **TLS:** Encryption in transit
- **AppCheck:** Prevent abuse

---

## 8. Week 4 Design Freeze Requirements

### 8.1 Must Be Confirmed

- [ ] Verification flow finalized (email OTP + optional ID review)
- [ ] Payment flow finalized (Stripe + escrow + refund)
- [ ] Photo capture flow finalized (before/after + watermark)
- [ ] Dispute flow finalized (48h + evidence + admin ruling)
- [ ] Trust signals defined (badges, indicators, copy)
- [ ] Security measures documented (auth, storage, payments)

### 8.2 Design Deliverables

- [ ] All wireframes reviewed and approved
- [ ] Design system finalized (`design/design.md`)
- [ ] Component library started
- [ ] Trust signal components designed
- [ ] Animation/motion spec defined

### 8.3 Technical Deliverables

- [ ] Database schema v1 approved
- [ ] API contract v1 approved
- [ ] Security rules reviewed
- [ ] Performance requirements confirmed
- [ ] Testing strategy defined

---

## 9. Sign-Off

| Name | Role | Date | Signature |
|------|------|------|-----------|
| | Team Lead | | |
| | Product Lead | | |
| | Backend Lead | | |
| | Mobile Lead | | |

---

*This walkthrough presents the complete trust model for Week 4 design freeze. All four pillars must be implemented to launch a safe, accountable rental platform.*