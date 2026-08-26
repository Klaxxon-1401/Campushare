# Hi-Fi UI Mockup Specifications

> **Week 4 deliverable** · Polished designs from wireframes
> **Reference:** `design/design.md` for tokens, `docs/week-03/wireframe-specs.md` for layout structure
> **Platform:** React Native (Expo) · Mobile-first

---

## 1. Registration/Login Screens

### 1.1 Welcome/Onboarding Screen

```
┌─────────────────────────────────┐
│                                 │
│   [CampusShare Logo]            │
│   Orange + Green                │
│                                 │
│   "Rent from fellow students"   │
│   "Verified. Safe. Affordable." │
│                                 │
│   [Illustration: Students]      │
│   (Campus community image)      │
│                                 │
├─────────────────────────────────┤
│                                 │
│   [Get Started]                 │
│   Orange button, white text     │
│                                 │
│   Already have an account?      │
│   [Log In]                      │
│   Orange text link              │
│                                 │
└─────────────────────────────────┘
```

**Design Specs:**
- Background: White (#FFFFFF)
- Logo: Centered, 80px height
- Headline: 24px, Playfair Display, #2C3E50
- Subheadline: 16px, Inter, #7F8C8D
- Illustration: 200px height, centered
- Button: Full width, 48px height, #E67E22, border-radius 8px
- Link: 14px, #E67E22, underline on hover

### 1.2 Registration Screen

```
┌─────────────────────────────────┐
│ [Back Arrow]    Create Account  │
├─────────────────────────────────┤
│                                 │
│ "Join CampusShare"              │
│ "Rent from verified students"   │
│                                 │
│ [University Verified Only]      │
│ Green badge with shield icon    │
│                                 │
├─────────────────────────────────┤
│                                 │
│ Campus Email                    │
│ [input: you@university.edu]     │
│                                 │
│ Student ID                      │
│ [input: S1234567]              │
│                                 │
│ Password                        │
│ [input: ••••••••]              │
│ Strength: ●●●○○                │
│                                 │
│ Confirm Password                │
│ [input: ••••••••]              │
│                                 │
├─────────────────────────────────┤
│                                 │
│ [Create Account]                │
│ Orange button, full width       │
│                                 │
│ By signing up, you agree to     │
│ Terms of Service and Privacy    │
│ Policy                          │
│                                 │
└─────────────────────────────────┘
```

**Design Specs:**
- Header: Back arrow (24px, #2C3E50) + "Create Account" (16px, #2C3E50)
- Headline: 24px, Playfair Display, #2C3E50
- Subheadline: 14px, Inter, #7F8C8D
- Trust badge: Green background (#2ECC71 at 10%), green text (#27AE60), 12px
- Input labels: 12px, #7F8C8D
- Inputs: 48px height, border 1px #E8E5E0, border-radius 8px
- Password strength: 5 dots, filled = #27AE60, empty = #E8E5E0
- Button: Full width, 48px, #E67E22, white text
- Terms: 12px, #7F8C8D, centered

### 1.3 OTP Verification Screen

```
┌─────────────────────────────────┐
│ [Back Arrow]    Verify Email    │
├─────────────────────────────────┤
│                                 │
│ [Email Icon]                    │
│ Orange circle with envelope     │
│                                 │
│ "Check your email"              │
│ "We sent a 6-digit code to      │
│  you@university.edu"            │
│                                 │
├─────────────────────────────────┤
│                                 │
│ [○] [○] [○] [○] [○] [○]       │
│                                 │
│ Code expires in 14:32           │
│                                 │
│ [Resend Code]                   │
│ Orange text link                │
│                                 │
├─────────────────────────────────┤
│                                 │
│ [Verify]                        │
│ Orange button, full width       │
│                                 │
└─────────────────────────────────┘
```

**Design Specs:**
- Icon: 64px circle, #E67E22 background, white envelope icon
- Headline: 20px, Playfair Display, #2C3E50
- Subheadline: 14px, Inter, #7F8C8D
- OTP boxes: 48px × 48px, border 2px #E8E5E0, border-radius 8px
- Active box: Border #E67E22, background white
- Filled box: Background #E67E22, white text
- Timer: 14px, #7F8C8D
- Resend: 14px, #E67E22

### 1.4 Verification Pending Screen

```
┌─────────────────────────────────┐
│ [Home Icon]    Verification     │
├─────────────────────────────────┤
│                                 │
│ [Clock Icon]                    │
│ Orange circle with clock        │
│                                 │
│ "Verification in progress"      │
│ "We're reviewing your student   │
│  ID. This usually takes <24h."  │
│                                 │
├─────────────────────────────────┤
│                                 │
│ [Status Timeline]               │
│ ✓ Email verified                │
│ ● Student ID submitted          │
│ ○ Account approved              │
│                                 │
├─────────────────────────────────┤
│                                 │
│ "You can browse items while     │
│  waiting for verification."     │
│                                 │
│ [Browse Items]                  │
│ Orange button, full width       │
│                                 │
└─────────────────────────────────┘
```

**Design Specs:**
- Icon: 64px circle, #F39C12 background (warning), white clock icon
- Headline: 20px, Playfair Display, #2C3E50
- Subheadline: 14px, Inter, #7F8C8D
- Timeline: Vertical line with circles (completed: green check, current: orange dot, upcoming: gray circle)
- Text: 14px, #7F8C8D
- Button: Full width, 48px, #E67E22

---

## 2. Login Screen

```
┌─────────────────────────────────┐
│ [Back Arrow]    Welcome Back    │
├─────────────────────────────────┤
│                                 │
│ [CampusShare Logo]              │
│                                 │
│ "Log in to your account"        │
│                                 │
├─────────────────────────────────┤
│                                 │
│ Email                           │
│ [input: you@university.edu]     │
│                                 │
│ Password                        │
│ [input: ••••••••]              │
│ [Show]                          │
│                                 │
│ [Forgot password?]              │
│ Orange text link, right-aligned │
│                                 │
├─────────────────────────────────┤
│                                 │
│ [Log In]                        │
│ Orange button, full width       │
│                                 │
│ Don't have an account?          │
│ [Sign Up]                       │
│ Orange text link                │
│                                 │
└─────────────────────────────────┘
```

**Design Specs:**
- Logo: 60px height, centered
- Headline: 20px, Playfair Display, #2C3E50
- Input labels: 12px, #7F8C8D
- Inputs: 48px height, border 1px #E8E5E0, border-radius 8px
- Show password: 14px, #7F8C8D, right-aligned
- Forgot password: 14px, #E67E22, right-aligned
- Button: Full width, 48px, #E67E22, white text
- Sign up link: 14px, #E67E22, centered

---

## 3. Home Feed (Refined)

```
┌─────────────────────────────────┐
│ [Header]                        │
│ CampusShare    [Avatar] [Badge] │
│ University Verified Only 🛡️     │
├─────────────────────────────────┤
│ [Search Bar - Hero Element]     │
│ 🔍 Search lab coats, calcs...  │
├─────────────────────────────────┤
│ [Category Chips - Horizontal]   │
│ [All] [Academic] [Clothing] ... │
├─────────────────────────────────┤
│ [Section Header]                │
│ Available Near You              │
│ [See All →]                     │
├─────────────────────────────────┤
│ [Item Grid - 2 columns]        │
│ ┌─────────┐ ┌─────────┐       │
│ │ Card 1  │ │ Card 2  │       │
│ └─────────┘ └─────────┘       │
│ ┌─────────┐ ┌─────────┐       │
│ │ Card 3  │ │ Card 4  │       │
│ └─────────┘ └─────────┘       │
├─────────────────────────────────┤
│ [Bottom Navigation]             │
│ 🏠  💬  ➕  📷  👤             │
└─────────────────────────────────┘
```

**Refinements:**
- Header: Verified badge now green shield (16px)
- Search: Focus state with orange border
- Category chips: Active state with bounce animation
- Section header: "See All" link in orange
- Item cards: Verified badge on lender name
- Bottom nav: Create button raised with shadow

---

## 4. Item Detail (Refined)

```
┌─────────────────────────────────┐
│ [Back Arrow]    [Share] [Flag]  │
├─────────────────────────────────┤
│ [Image Carousel]                │
│ ← → (swipeable)                │
│ [Dot indicators]                │
├─────────────────────────────────┤
│ [Content]                       │
│ Chemistry Lab Coat (Size M)     │
│ 📍 North Campus                 │
│                                 │
│ [Price Row]                     │
│ $3/day          Deposit $10     │
│                                 │
│ [Lender Info]                   │
│ [Avatar] John D. 🛡️ Verified   │
│ ⭐ 4.8 (12 rentals)            │
│                                 │
│ [Availability Calendar]         │
│ [Calendar component]            │
│                                 │
│ [Description]                   │
│ Lab coat used for chemistry...  │
│                                 │
│ [Action Buttons]                │
│ [Request Booking]               │
│ [Message Lender]                │
└─────────────────────────────────┘
```

**Refinements:**
- Image carousel: Smooth swipe with momentum
- Verified badge: Green shield next to lender name
- Rating: Star icon #F39C12
- Calendar: Today highlighted, selected range in orange
- Buttons: Primary orange, secondary orange outline

---

## 5. Booking Flow (Refined)

```
┌─────────────────────────────────┐
│ [Back Arrow]    Booking         │
├─────────────────────────────────┤
│ [Item Summary]                  │
│ [Image] Chemistry Lab Coat      │
│ $3/day × 3 days = $9           │
│ Deposit: $10                    │
├─────────────────────────────────┤
│ [Date Selection]                │
│ Start: [Date Picker]           │
│ End:   [Date Picker]           │
├─────────────────────────────────┤
│ [Price Breakdown]               │
│ Rental fee:    $9.00            │
│ Deposit:      $10.00            │
│ ────────────────────            │
│ Total:        $19.00            │
├─────────────────────────────────┤
│ [Payment Method]                │
│ 💳 Visa •••• 4242              │
│ [Change]                        │
├─────────────────────────────────┤
│ [Terms]                         │
│ ☑ I agree to rental terms       │
├─────────────────────────────────┤
│ [Secure Payment] 🔒             │
│ [Pay $19.00]                    │
└─────────────────────────────────┘
```

**Refinements:**
- Price breakdown: Clear hierarchy, total in orange
- Payment method: Card icon + last 4 digits + "Change" link
- Terms: Custom checkbox with orange check
- Secure badge: Lock icon + "Secure Payment" text
- Button: Full width, 48px, #E67E22

---

## 6. Listing Wizard (Refined)

```
┌─────────────────────────────────┐
│ [Back Arrow]    Create Listing  │
├─────────────────────────────────┤
│ [Step Indicator]                │
│ ① — ② — ③ — ④                │
│ Photos → Details → Pricing →    │
│ Availability                    │
├─────────────────────────────────┤
│ [Step Content]                  │
│ Title                           │
│ [Input: Chemistry Lab Coat]     │
│                                 │
│ Category                        │
│ [Dropdown: Academic ▼]          │
│                                 │
│ Description                     │
│ [Textarea: Lab coat used for    │
│  chemistry labs...]             │
│ Character count: 45/500         │
├─────────────────────────────────┤
│ [Next Button]                   │
└─────────────────────────────────┘
```

**Refinements:**
- Step indicator: Active orange, completed green, upcoming gray
- Inputs: Clear labels, focus states
- Character count: 12px, #BDC3C7
- Button: Full width, 48px, #E67E22

---

## 7. Returns (Refined)

```
┌─────────────────────────────────┐
│ [Back Arrow]    Return Item     │
├─────────────────────────────────┤
│ [Item Summary]                  │
│ [Image] Chemistry Lab Coat      │
│ Due: Today                      │
├─────────────────────────────────┤
│ [Before Photos]                 │
│ 📷 Photo 1  📷 Photo 2  ➕     │
├─────────────────────────────────┤
│ [After Photos]                  │
│ 📷 Photo 1  📷 Photo 2  ➕     │
├─────────────────────────────────┤
│ [Photo Comparison]              │
│ Before      After               │
│ [Image]     [Image]             │
│ ⚠️ New stain detected           │
├─────────────────────────────────┤
│ [Confirm Return]                │
└─────────────────────────────────┘
```

**Refinements:**
- Before/after labels: Clear 12px, #7F8C8D
- Photo comparison: Side-by-side with zoom
- Damage detection: Warning icon + text
- Button: Full width, 48px, #27AE60 (success green)

---

## 8. Profile (Refined)

```
┌─────────────────────────────────┐
│ [Settings Gear]    Profile       │
├─────────────────────────────────┤
│ [Avatar]                        │
│ John Doe 🛡️ Verified           │
│ ⭐ 4.8 (12 rentals)            │
├─────────────────────────────────┤
│ [Stats Row]                     │
│ Listed: 5 | Rented: 3 | Rating: 4.8 │
├─────────────────────────────────┤
│ [Menu Items]                    │
│ 📦 My Listings                  │
│ 📋 My Bookings                  │
│ ⭐ My Reviews                   │
│ 💳 Payment Methods              │
│ ⚙️ Settings                     │
│ ❓ Help                         │
│ 🚪 Log Out                      │
└─────────────────────────────────┘
```

**Refinements:**
- Avatar: 80px circle, orange border
- Verified badge: Green shield, bottom-right
- Stats: 3 columns, numbers prominent
- Menu: Icons + text + chevron
- Log out: Red text, separated from other items

---

## 9. Search Results

```
┌─────────────────────────────────┐
│ [Back Arrow]    Search Results  │
├─────────────────────────────────┤
│ [Search Bar]                    │
│ 🔍 Lab coat                     │
├─────────────────────────────────┤
│ [Category Chips]                │
│ [All] [Academic] [Clothing] ... │
├─────────────────────────────────┤
│ "12 results"                    │
├─────────────────────────────────┤
│ [Item Grid]                     │
│ ┌─────────┐ ┌─────────┐       │
│ │ Card 1  │ │ Card 2  │       │
│ └─────────┘ └─────────┘       │
│ ┌─────────┐ ┌─────────┐       │
│ │ Card 3  │ │ Card 4  │       │
│ └─────────┘ └─────────┘       │
├─────────────────────────────────┤
│ [Bottom Navigation]             │
└─────────────────────────────────┘
```

**Design Specs:**
- Header: Back arrow + "Search Results"
- Search bar: Pre-filled with query
- Category chips: Same as Home Feed
- Results count: 14px, #7F8C8D
- Grid: Same as Home Feed

---

## 10. Empty States

### 10.1 No Items Found

```
┌─────────────────────────────────┐
│ [Search Bar]                    │
├─────────────────────────────────┤
│                                 │
│ [Magnifying Glass Icon]         │
│ Gray, 64px                      │
│                                 │
│ "No items found"                │
│ "Try different keywords or      │
│  check back later."             │
│                                 │
│ [Clear Search]                  │
│ Orange text link                │
│                                 │
└─────────────────────────────────┘
```

### 10.2 No Bookings

```
┌─────────────────────────────────┤
│ [My Bookings]                   │
├─────────────────────────────────┤
│                                 │
│ [Calendar Icon]                 │
│ Gray, 64px                      │
│                                 │
│ "No bookings yet"               │
│ "Browse items and make your     │
│  first rental."                 │
│                                 │
│ [Browse Items]                  │
│ Orange button                   │
│                                 │
└─────────────────────────────────┘
```

---

*All mockups follow the design system in `design/design.md` with Hindustan University-inspired orange palette and subtle green accents.*