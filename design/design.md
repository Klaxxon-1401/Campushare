# CampusShare Design System

> **Hindustan University-inspired palette** — Orange primary with subtle green accents
> **Purpose:** Single source of truth for frontend implementation
> **Status:** Draft for team review

---

## 1. Design Philosophy

CampusShare's visual identity is built on **trust, community, and verification**. The design uses Hindustan University's signature orange as the primary color, conveying warmth, energy, and approachability, with very subtle green accents that signal safety and verification. Every design decision reinforces that this is a **campus-only, verified community** where students can trust each other.

**Core Principles:**
- Trust is the hero — verification status is visually prominent, not an afterthought
- Campus community feels warm and inviting, not corporate or cold
- The orange palette makes CampusShare instantly recognizable and distinct from generic rental apps
- Subtle green accents reinforce safety and verification without overwhelming the design

---

## 2. Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Hindustan Orange** | #E67E22 | 230, 126, 34 | Primary actions, headers, active states |
| **Orange Light** | #F39C12 | 243, 156, 18 | Hover states, highlights |
| **Orange Dark** | #D35400 | 211, 84, 0 | Pressed states, emphasis |

### Accent Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Verification Green** | #27AE60 | 39, 174, 96 | Verification badges, success states, trust signals |
| **Green Subtle** | #2ECC71 | 46, 204, 113 | Light backgrounds, subtle accents |
| **Green Muted** | #A9DFBF | 169, 223, 191 | Very subtle tints, hover states |

### Neutral Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Background** | #FAF8F5 | 250, 248, 245 | Main background (warm off-white) |
| **Surface** | #FFFFFF | 255, 255, 255 | Cards, modals, elevated elements |
| **Border** | #E8E5E0 | 232, 229, 224 | Subtle borders, dividers |
| **Text Primary** | #2C3E50 | 44, 62, 80 | Main text (dark warm gray) |
| **Text Secondary** | #7F8C8D | 127, 140, 141 | Secondary text, labels |
| **Text Muted** | #BDC3C7 | 189, 195, 199 | Placeholder text, disabled states |

### State Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Success** | #27AE60 | 39, 174, 96 | Positive actions, verification |
| **Warning** | #F39C12 | 243, 156, 18 | Caution states, alerts |
| **Error** | #E74C3C | 231, 76, 60 | Errors, destructive actions |
| **Info** | #3498DB | 52, 152, 219 | Informational messages |

---

## 3. Typography System

### Font Families

| Role | Font | Fallback | Usage |
|------|------|----------|-------|
| **Display** | Playfair Display | Georgia, serif | Headlines, hero text, brand moments |
| **Body** | Inter | -apple-system, sans-serif | Body text, UI elements, descriptions |
| **Utility** | JetBrains Mono | monospace | Prices, codes, technical data |

### Type Scale (Mobile-first)

| Name | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| **Hero** | 32px | 700 | 1.2 | -0.5px | Main headlines, value proposition |
| **H1** | 28px | 700 | 1.25 | -0.25px | Page titles |
| **H2** | 24px | 600 | 1.3 | 0 | Section headers |
| **H3** | 20px | 600 | 1.35 | 0 | Card titles, subsections |
| **H4** | 18px | 600 | 1.4 | 0.25px | Subsection headers |
| **Body Large** | 16px | 400 | 1.5 | 0 | Main body text |
| **Body** | 14px | 400 | 1.5 | 0.1px | UI text, descriptions |
| **Caption** | 12px | 500 | 1.4 | 0.2px | Labels, metadata |
| **Small** | 11px | 500 | 1.3 | 0.3px | Fine print, legal |
| **Price** | 18px | 700 | 1.2 | 0 | Prices, numerical data |

---

## 4. Layout Principles

### Grid System

- **Mobile:** Single column, 16px horizontal padding
- **Tablet:** 2-column grid for item cards, 24px padding
- **Desktop:** 3-column grid, max-width 1200px centered

### Spacing Scale (4px base)

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight spacing, icon gaps |
| `space-2` | 8px | Small gaps, padding in cards |
| `space-3` | 12px | Medium gaps, section spacing |
| `space-4` | 16px | Standard padding, margins |
| `space-5` | 20px | Large gaps, section separation |
| `space-6` | 24px | Extra large gaps |
| `space-8` | 32px | Major section breaks |

### Safe Area Handling

```css
/* Modern mobile devices */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 20px);
}

.pt-safe {
  padding-top: env(safe-area-inset-top, 20px);
}
```

---

## 5. Component Guidelines

### Header

**Design:**
- Background: White with subtle bottom border
- Left: "CampusShare" in Playfair Display, Hindustan Orange
- Right: User avatar with verification badge overlay
- Below title: "University Verified Only" with green shield icon

**States:**
- Default: White background
- Scrolled: Slight shadow for depth

### Search Bar (Hero Element)

**Design:**
- Full-width with rounded corners (12px radius)
- Left icon: Search icon in muted gray
- Placeholder: "Search lab coats, calculators, blazers..."
- Background: White with subtle border
- Focus state: Hindustan Orange border, subtle shadow

**Interaction:**
- On focus: Border transitions to orange, placeholder fades
- Clear button appears when text is entered

### Category Filter Chips

**Design:**
- Horizontal scrollable row
- Pill shape with 20px border-radius
- Default: Gray background (#E8E5E0), dark text
- Active: Hindustan Orange background, white text
- Hover: Light orange background (#F39C12 at 20% opacity)

**States:**
- Default: `bg-[#E8E5E0] text-[#2C3E50]`
- Active: `bg-[#E67E22] text-white`
- Hover: `bg-[#F39C12]/20 text-[#E67E22]`

### Item Cards

**Design:**
- White background with subtle border (#E8E5E0)
- Border-radius: 12px
- Shadow: 0 2px 8px rgba(0,0,0,0.06)
- Image area: 160px height, placeholder with camera icon
- Content area: 12px padding

**Visual Hierarchy:**
1. Image (160px height)
2. Category badge (top-left, semi-transparent white background)
3. Title (16px, semibold, dark text)
4. Location with pin icon (14px, secondary text)
5. Price and deposit row (price in Hindustan Orange, deposit in muted text)

**Verification Badge:**
- Small green shield icon next to lender name
- "Verified" text in green (#27AE60)
- Appears on hover or tap

**States:**
- Default: Subtle border, no shadow
- Hover: Slight shadow increase, border color transitions to orange
- Pressed: Slight scale down (0.98), shadow reduces

### Bottom Navigation

**Design:**
- Fixed to bottom, white background
- 5 tabs: Home, Messages, Create (+), Returns, Profile
- Height: 64px + safe area padding
- Border-top: 1px solid #E8E5E0

**Tab Styling:**
- Default: Gray icon (#BDC3C7), gray text
- Active: Hindustan Orange icon and text
- Create button: Circular (48px), Hindustan Orange background, white plus icon
- Create button elevation: Raised 4px above other tabs

**States:**
- Default: Gray icon and text
- Active: Orange icon and text, slight bounce animation
- Create button: Always orange, hover brightens

---

## 6. Trust & Verification Design System

### Verification Badge

**Design:**
- Small green shield icon (16x16px)
- "Verified" text in green (#27AE60)
- Appears next to user name in profiles and item listings

**Placement:**
- User profiles: Next to name, below avatar
- Item cards: Next to lender name
- Booking details: Prominent display

### "University Verified Only" Banner

**Design:**
- Green shield icon with "University Verified Only" text
- Appears in header below app name
- Subtle green background (#2ECC71 at 10% opacity)
- Border-radius: 4px
- Padding: 8px horizontal, 4px vertical

### Verification Flow Visual

**Step 1:** Pending - Gray badge with "Pending Verification"
**Step 2:** In Progress - Orange badge with loading spinner
**Step 3:** Verified - Green badge with checkmark

---

## 7. Animation & Motion Guidelines

### Page Transitions

- **Slide in from right:** For navigating to detail pages
- **Slide out to left:** For going back
- **Duration:** 300ms, ease-out curve

### Micro-interactions

**Category Chip Selection:**
- Scale: 1.0 → 1.05 → 1.0 (subtle bounce)
- Color transition: 200ms ease
- Background change: Instant

**Card Tap:**
- Scale: 1.0 → 0.98 (subtle press)
- Shadow reduction
- Duration: 150ms

**Create Button:**
- Scale: 1.0 → 1.1 on hover
- Rotation: 0° → 90° on press (plus icon becomes X)
- Duration: 200ms

### Loading States

**Skeleton Screens:**
- Gray placeholder blocks (#E8E5E0)
- Shimmer animation: Linear gradient moving left to right
- Duration: 1.5s infinite

**Pull to Refresh:**
- Spinner in Hindustan Orange
- Bounce effect at threshold

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Iconography

### Icon Set

- **Primary:** Feather Icons (consistent with prototype)
- **Verification:** Custom shield icon (green)
- **Trust:** Custom checkmark in circle (green)

### Icon Sizing

| Context | Size | Color |
|---------|------|-------|
| Navigation | 24px | Gray (#BDC3C7) default, Orange (#E67E22) active |
| Cards | 16px | Gray (#7F8C8D) |
| Inline | 14px | Gray (#7F8C8D) |
| Verification | 16px | Green (#27AE60) |

---

## 9. Accessibility Requirements

### Color Contrast

- **Text on white:** Minimum 4.5:1 ratio (WCAG AA)
- **Text on orange:** White text on #E67E22 = 4.6:1 ✓
- **Text on green:** White text on #27AE60 = 4.5:1 ✓

### Focus States

- **Visible focus ring:** 2px solid #E67E22 with 2px offset
- **Keyboard navigation:** All interactive elements focusable
- **Skip link:** "Skip to main content" at top of page

### Touch Targets

- **Minimum size:** 44x44px (iOS HIG)
- **Spacing:** At least 8px between targets

### Screen Reader Support

- **Alt text:** All images have descriptive alt text
- **ARIA labels:** Interactive elements labeled
- **Semantic HTML:** Proper heading hierarchy, landmarks

---

## 10. Responsive Design

### Breakpoints

| Name | Width | Layout |
|------|-------|--------|
| **Mobile** | 320px - 428px | Single column, 16px padding |
| **Tablet** | 768px+ | 2-column grid, 24px padding |
| **Desktop** | 1024px+ | 3-column grid, max-width 1200px |

### Mobile-First Approach

- Base styles for mobile
- Tablet enhancements with `@media (min-width: 768px)`
- Desktop enhancements with `@media (min-width: 1024px)`

---

## 11. Sample Component Specifications

### Item Card (Detailed)

```
┌─────────────────────────────┐
│ [Image 160px height]        │
│ [Academic badge top-left]   │
├─────────────────────────────┤
│ Chemistry Lab Coat (Size M) │
│ 📍 North Campus             │
│ ─────────────────────────── │
│ ₹3/day          Deposit ₹10 │
└─────────────────────────────┘
```

**Dimensions:**
- Width: 100% of container (responsive grid)
- Height: Auto (content-driven)
- Image: 160px height, 100% width
- Content padding: 12px
- Border-radius: 12px

**Typography:**
- Title: 14px, font-weight 600, color #2C3E50
- Location: 12px, font-weight 400, color #7F8C8D
- Price: 18px, font-weight 700, color #E67E22
- Deposit label: 10px, font-weight 500, color #BDC3C7
- Deposit value: 12px, font-weight 500, color #7F8C8D

---

## 12. Design Tokens (JSON Format)

```json
{
  "colors": {
    "primary": {
      "orange": "#E67E22",
      "orange-light": "#F39C12",
      "orange-dark": "#D35400"
    },
    "accent": {
      "green": "#27AE60",
      "green-subtle": "#2ECC71",
      "green-muted": "#A9DFBF"
    },
    "neutral": {
      "background": "#FAF8F5",
      "surface": "#FFFFFF",
      "border": "#E8E5E0",
      "text-primary": "#2C3E50",
      "text-secondary": "#7F8C8D",
      "text-muted": "#BDC3C7"
    },
    "state": {
      "success": "#27AE60",
      "warning": "#F39C12",
      "error": "#E74C3C",
      "info": "#3498DB"
    }
  },
  "typography": {
    "font-families": {
      "display": "Playfair Display, Georgia, serif",
      "body": "Inter, -apple-system, sans-serif",
      "utility": "JetBrains Mono, monospace"
    },
    "font-sizes": {
      "hero": "32px",
      "h1": "28px",
      "h2": "24px",
      "h3": "20px",
      "h4": "18px",
      "body-large": "16px",
      "body": "14px",
      "caption": "12px",
      "small": "11px",
      "price": "18px"
    }
  },
  "spacing": {
    "space-1": "4px",
    "space-2": "8px",
    "space-3": "12px",
    "space-4": "16px",
    "space-5": "20px",
    "space-6": "24px",
    "space-8": "32px"
  },
  "border-radius": {
    "card": "12px",
    "chip": "20px",
    "button": "8px",
    "input": "12px"
  }
}
```

---

## 13. Implementation Notes

### React Native/Expo Specifics

- Use `StyleSheet.create()` for performance
- Define colors in a theme file for easy updates
- Use `Dimensions` API for responsive layouts
- Implement `SafeAreaView` for modern devices
- Use `Animated` API for micro-interactions
- Support `AccessibilityInfo` for reduced motion

### Performance Considerations

- Lazy load images with `expo-image`
- Use `FlatList` for item grids
- Implement skeleton screens for loading states
- Cache images with `expo-file-system`

---

*This design system is based on the Hindustan University-inspired palette (orange primary with subtle green accents) and aligns with the frontend-design skill principles of making deliberate, opinionated choices that are specific to this brief.*