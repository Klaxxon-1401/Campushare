# Wireframe Specifications — Key Screens

> **Week 3 deliverable** · UI mockups derived from `Campusshare.html` prototype + design system
> **Reference:** `design/design.md` for colors, typography, spacing tokens
> **Platform:** React Native (Expo) · Mobile-first (320–428px)

---

## 1. Home Feed Screen

### Layout Structure

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

### Component Specifications

**Header:**
- Height: 64px + safe area top
- Background: White (#FFFFFF)
- Border-bottom: 1px solid #E8E5E0
- Left: "CampusShare" in Playfair Display, 20px, #E67E22
- Right: User avatar (40px circle) with green verification badge overlay
- Below title: "University Verified Only" with shield icon, 12px, #27AE60

**Search Bar:**
- Height: 48px
- Border-radius: 12px
- Background: White
- Border: 1px solid #E8E5E0
- Left icon: Search (Feather), 20px, #BDC3C7
- Placeholder: "Search lab coats, calculators, blazers...", 14px, #BDC3C7
- Focus state: Border #E67E22, subtle shadow (0 2px 8px rgba(230,126,34,0.15))

**Category Chips:**
- Height: 36px
- Border-radius: 20px (pill shape)
- Horizontal scroll, no scrollbar
- Default: Background #E8E5E0, text #2C3E50
- Active: Background #E67E22, text white
- Spacing between chips: 8px
- Padding: 0 16px

**Item Card:**
- Width: 100% of column (responsive)
- Border-radius: 12px
- Background: White
- Border: 1px solid #E8E5E0
- Shadow: 0 2px 8px rgba(0,0,0,0.06)
- Image area: 160px height, background #E8E5E0
- Category badge: Top-left, semi-transparent white background, 12px padding
- Content padding: 12px
- Title: 14px, font-weight 600, #2C3E50, max 2 lines
- Location: 12px, #7F8C8D with map-pin icon
- Price: 18px, font-weight 700, #E67E22
- Deposit: 12px, #7F8C8D with "Deposit" label

**Bottom Navigation:**
- Height: 64px + safe area bottom
- Background: White
- Border-top: 1px solid #E8E5E0
- 5 tabs with equal spacing
- Icon size: 24px
- Active: #E67E22 icon + text
- Inactive: #BDC3C7 icon + text
- Create button: 48px circle, #E67E22 background, white plus icon, raised 4px

---

## 2. Item Detail Screen

### Layout Structure

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

### Component Specifications

**Image Carousel:**
- Height: 300px
- Background: #E8E5E0
- Dot indicators: 8px circles, active #E67E22, inactive #BDC3C7
- Swipe gesture enabled
- Placeholder: Camera icon with "Add photos" text

**Price Row:**
- Layout: Space between
- Price: 24px, font-weight 700, #E67E22
- "/day" label: 14px, #7F8C8D
- Deposit label: 10px, #BDC3C7, uppercase
- Deposit value: 14px, #7F8C8D

**Lender Info:**
- Avatar: 48px circle with 2px border #E67E22
- Name: 16px, font-weight 600, #2C3E50
- Verification badge: 16px green shield icon + "Verified" text
- Rating: Star icon #F39C12 + rating text

**Availability Calendar:**
- Month view grid
- Available days: White background, #2C3E50 text
- Booked days: #E8E5E0 background, #BDC3C7 text
- Selected range: #E67E22 background, white text
- Today: Border #E67E22

**Action Buttons:**
- Primary: "Request Booking" — Full width, 48px height, #E67E22 background, white text, border-radius 8px
- Secondary: "Message Lender" — Full width, 48px height, white background, #E67E22 border, #E67E22 text, border-radius 8px
- Spacing between buttons: 12px

---

## 3. Booking Flow Screen

### Layout Structure

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
├─────────────────────────────────┤
│ [Terms]                         │
│ ☑ I agree to rental terms       │
├─────────────────────────────────┤
│ [Pay $19.00]                    │
└─────────────────────────────────┘
```

### Component Specifications

**Item Summary:**
- Layout: Horizontal row
- Image: 64px square, border-radius 8px
- Title: 16px, font-weight 600
- Price calculation: 14px, #7F8C8D

**Date Selection:**
- Two date picker fields
- Label: 12px, #7F8C8D
- Value: 16px, #2C3E50
- Border-bottom: 2px solid #E8E5E0
- Focus: Border #E67E22

**Price Breakdown:**
- Layout: Right-aligned rows
- Label: 14px, #7F8C8D
- Value: 14px, #2C3E50
- Total row: 18px, font-weight 700, #E67E22
- Divider: 1px solid #E8E5E0

**Payment Method:**
- Card icon + last 4 digits
- Change button: 14px, #E67E22

**Terms Checkbox:**
- Custom checkbox with #E67E22 check
- Text: 12px, #7F8C8D

**Pay Button:**
- Full width, 48px height
- Background: #E67E22
- Text: White, 16px, font-weight 600
- Border-radius: 8px
- Disabled state: #E8E5E0 background, #BDC3C7 text

---

## 4. Listing Wizard Screen

### Layout Structure

```
┌─────────────────────────────────┐
│ [Back Arrow]    Create Listing  │
├─────────────────────────────────┤
│ [Step Indicator]                │
│ ① — ② — ③ — ④                │
├─────────────────────────────────┤
│ [Step Content]                  │
│ Title                           │
│ [Input field]                   │
│                                 │
│ Category                        │
│ [Dropdown]                      │
│                                 │
│ Description                     │
│ [Textarea]                      │
├─────────────────────────────────┤
│ [Next Button]                   │
└─────────────────────────────────┘
```

### Component Specifications

**Step Indicator:**
- 4 steps: Photos → Details → Pricing → Availability
- Active step: #E67E22 circle with number
- Completed: #27AE60 checkmark
- Upcoming: #E8E5E0 circle
- Connecting lines: #E8E5E0 (completed: #27AE60)

**Input Fields:**
- Height: 48px
- Border: 1px solid #E8E5E0
- Border-radius: 8px
- Padding: 0 12px
- Label: 12px, #7F8C8D, above field
- Focus: Border #E67E22

**Textarea:**
- Min height: 100px
- Same styling as input
- Character count: 12px, #BDC3C7

**Dropdown:**
- Same as input but with chevron icon
- Options: Academic, Clothing, Electronics, Fitness, Other

**Next Button:**
- Full width, 48px height
- Background: #E67E22
- Text: White, 16px, font-weight 600
- Border-radius: 8px

---

## 5. Returns Screen

### Layout Structure

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
├─────────────────────────────────┤
│ [Confirm Return]                │
└─────────────────────────────────┘
```

### Component Specifications

**Before/After Photo Sections:**
- Label: 14px, font-weight 600, #2C3E50
- Photo grid: 3 columns, 8px gap
- Photo placeholder: 80px square, #E8E5E0, camera icon
- Add button: 80px square, dashed border #E67E22, plus icon #E67E22

**Photo Comparison:**
- Side-by-side layout
- Labels: "Before" / "After", 12px, #7F8C8D
- Images: Equal height, 120px
- Border-radius: 8px

**Confirm Return Button:**
- Full width, 48px height
- Background: #27AE60 (success green)
- Text: White, 16px, font-weight 600
- Border-radius: 8px

---

## 6. Profile Screen

### Layout Structure

```
┌─────────────────────────────────┐
│ [Settings Gear]    Profile       │
├─────────────────────────────────┤
│ [Avatar]                        │
│ John Doe 🛡️ Verified           │
│ ⭐ 4.8 (12 rentals)            │
├─────────────────────────────────│
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
└─────────────────────────────────┘
```

### Component Specifications

**Avatar:**
- Size: 80px circle
- Border: 3px solid #E67E22
- Verification badge: Bottom-right, 24px

**Stats Row:**
- 3 equal columns
- Number: 20px, font-weight 700, #2C3E50
- Label: 12px, #7F8C8D
- Divider: Vertical lines, 1px solid #E8E5E0

**Menu Items:**
- Height: 56px
- Layout: Icon (24px, #7F8C8D) + Text (16px, #2C3E50) + Chevron (16px, #BDC3C7)
- Border-bottom: 1px solid #E8E5E0
- Active state: Background #F39C12 at 10% opacity

---

## Navigation Flow

```
Onboarding → Login/Register → [Verification Pending → Status Screen]
Home → Search Results → Item Detail → Booking → Payment
Home → +Create → Listing Wizard → Publish
Returns → Photo Capture → Lender Confirm → Refund
Profile → My Listings / My Bookings / My Reviews
```

---

*All wireframes follow the design system in `design/design.md` with Hindustan University-inspired orange palette and subtle green accents.*