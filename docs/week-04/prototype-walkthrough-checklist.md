# Prototype Walkthrough Checklist

> **Week 4 deliverable** · Team review of all screens before design freeze
> **Purpose:** Ensure consistency, completeness, and quality across all UI
> **Participants:** All team members (mobile lead, backend lead, product lead)

---

## 1. Walkthrough Overview

**Goal:** Review every screen in the app flow to identify inconsistencies, missing elements, or design issues before design freeze.

**Format:** Screen-by-screen review with team feedback captured in this document.

**Duration:** 2–3 hours (with breaks)

---

## 2. Pre-Walkthrough Setup

### 2.1 Preparation

- [ ] All wireframes printed or displayed on shared screen
- [ ] Design system (`design/design.md`) accessible
- [ ] This checklist loaded on team devices
- [ ] Feedback capture template ready

### 2.2 Roles

| Role | Person | Responsibility |
|------|--------|----------------|
| Facilitator | Product Lead | Guide walkthrough, manage time |
| Reviewer | Mobile Lead | Technical feasibility, design consistency |
| Reviewer | Backend Lead | Data model alignment, API requirements |
| Note-taker | Team Lead | Capture feedback, decisions, action items |

---

## 3. Walkthrough Checklist

### 3.1 Onboarding Flow

#### Welcome Screen
- [ ] Logo displays correctly (Hindustan orange)
- [ ] Headline is clear and compelling
- [ ] "Get Started" button is prominent
- [ ] "Log In" link is visible
- [ ] Illustration loads properly

#### Registration Screen
- [ ] All input fields present (email, student ID, password, confirm)
- [ ] Trust badge ("University Verified Only") is visible
- [ ] Password strength indicator works
- [ ] Terms link is clickable
- [ ] "Create Account" button is full-width

#### OTP Verification Screen
- [ ] Email address is displayed correctly
- [ ] 6 OTP input boxes are present
- [ ] Timer countdown works
- [ ] "Resend Code" link is visible
- [ ] "Verify" button is full-width

#### Verification Pending Screen
- [ ] Status timeline is clear
- [ ] "Browse Items" button is visible
- [ ] Message is reassuring

### 3.2 Login Flow

#### Login Screen
- [ ] Logo displays correctly
- [ ] Email and password inputs are present
- [ ] "Show" password toggle works
- [ ] "Forgot password?" link is visible
- [ ] "Log In" button is full-width
- [ ] "Sign Up" link is visible

### 3.3 Home Feed

#### Header
- [ ] "CampusShare" text is in Playfair Display
- [ ] User avatar is displayed
- [ ] Verification badge is green shield
- [ ] "University Verified Only" text is visible

#### Search Bar
- [ ] Placeholder text is correct
- [ ] Search icon is present
- [ ] Focus state shows orange border

#### Category Chips
- [ ] All categories present (All, Academic, Clothing, Electronics, Fitness)
- [ ] "All" is active by default (orange background)
- [ ] Horizontal scroll works
- [ ] Chip selection changes active state

#### Item Grid
- [ ] Items display in 2-column grid
- [ ] Item cards have correct dimensions
- [ ] Category badges show on images
- [ ] Titles are truncated correctly
- [ ] Location with pin icon is visible
- [ ] Price is in orange, deposit in gray
- [ ] Verified badge shows on lender name

#### Bottom Navigation
- [ ] All 5 tabs present (Home, Messages, Create, Returns, Profile)
- [ ] Home tab is active (orange)
- [ ] Create button is raised and orange
- [ ] Icons are correct sizes

### 3.4 Search Results

#### Header
- [ ] Back arrow is present
- [ ] "Search Results" title is correct

#### Search Bar
- [ ] Pre-filled with search query
- [ ] Clear button works

#### Results
- [ ] Results count is displayed
- [ ] Items display in grid (same as Home Feed)
- [ ] Empty state shows if no results

### 3.5 Item Detail

#### Image Carousel
- [ ] Images load correctly
- [ ] Swipe gesture works
- [ ] Dot indicators show current image

#### Content
- [ ] Title is correct
- [ ] Location with pin icon is visible
- [ ] Price and deposit are displayed correctly

#### Lender Info
- [ ] Avatar is displayed
- [ ] Name is correct
- [ ] Verified badge is green shield
- [ ] Rating with star icon is visible

#### Availability Calendar
- [ ] Calendar displays current month
- [ ] Available days are white
- [ ] Booked days are gray
- [ ] Selected range is orange
- [ ] Today is highlighted

#### Description
- [ ] Text is readable
- [ ] "Show more" works if long

#### Action Buttons
- [ ] "Request Booking" is orange
- [ ] "Message Lender" is orange outline
- [ ] Both buttons are full-width

### 3.6 Booking Flow

#### Item Summary
- [ ] Image is displayed
- [ ] Title is correct
- [ ] Price calculation is correct

#### Date Selection
- [ ] Start date picker works
- [ ] End date picker works
- [ ] Validation prevents past dates

#### Price Breakdown
- [ ] Rental fee is calculated correctly
- [ ] Deposit is displayed
- [ ] Total is in orange

#### Payment Method
- [ ] Card icon is displayed
- [ ] Last 4 digits are shown
- [ ] "Change" link works

#### Terms
- [ ] Checkbox is present
- [ ] Text is readable
- [ ] Link to terms works

#### Pay Button
- [ ] Button shows total amount
- [ ] Button is full-width
- [ ] Secure badge is visible

### 3.7 Listing Wizard

#### Step Indicator
- [ ] All 4 steps are present
- [ ] Current step is orange
- [ ] Completed steps are green
- [ ] Upcoming steps are gray

#### Step Content
- [ ] All input fields are present
- [ ] Labels are correct
- [ ] Character count works
- [ ] Dropdown options are correct

#### Next Button
- [ ] Button is full-width
- [ ] Button is orange
- [ ] Validation works before proceeding

### 3.8 Returns

#### Item Summary
- [ ] Image is displayed
- [ ] Title is correct
- [ ] Due date is shown

#### Before Photos
- [ ] Photos are displayed
- [ ] "Add" button works
- [ ] Photo count is correct

#### After Photos
- [ ] "Add" button works
- [ ] Photo count is correct

#### Photo Comparison
- [ ] Side-by-side layout works
- [ ] Labels are clear
- [ ] Zoom works
- [ ] Damage detection highlights work

#### Confirm Return Button
- [ ] Button is full-width
- [ ] Button is green (success)
- [ ] Confirmation dialog works

### 3.9 Profile

#### Avatar
- [ ] Image is displayed
- [ ] Orange border is visible
- [ ] Verified badge is shown

#### Stats Row
- [ ] All 3 stats are displayed
- [ ] Numbers are correct
- [ ] Labels are readable

#### Menu Items
- [ ] All items present
- [ ] Icons are correct
- [ ] Chevron arrows are visible
- [ ] Active states work

#### Log Out
- [ ] Button is separated from other items
- [ ] Text is red
- [ ] Confirmation dialog works

---

## 4. Consistency Checks

### 4.1 Colors
- [ ] Orange (#E67E22) used for primary actions
- [ ] Green (#27AE60) used for verification/success
- [ ] Gray (#7F8C8D) used for secondary text
- [ ] No random colors outside palette

### 4.2 Typography
- [ ] Playfair Display used for headlines
- [ ] Inter used for body text
- [ ] JetBrains Mono used for prices
- [ ] Font sizes follow type scale

### 4.3 Spacing
- [ ] 4px base unit used
- [ ] Consistent padding (16px horizontal)
- [ ] Consistent margins between sections
- [ ] No cramped or overly spaced elements

### 4.4 Components
- [ ] Buttons have consistent height (48px)
- [ ] Inputs have consistent height (48px)
- [ ] Cards have consistent border-radius (12px)
- [ ] Icons are consistent sizes

---

## 5. Accessibility Checks

### 5.1 Color Contrast
- [ ] White text on orange = 4.6:1 ✓
- [ ] White text on green = 4.5:1 ✓
- [ ] Dark text on white = 14.5:1 ✓
- [ ] Gray text on white = 4.8:1 ✓

### 5.2 Touch Targets
- [ ] All buttons are 44px minimum
- [ ] All inputs are 44px minimum
- [ ] All tappable areas are 44px minimum
- [ ] Spacing between targets is 8px minimum

### 5.3 Focus States
- [ ] All interactive elements have focus ring
- [ ] Focus ring is visible (2px orange)
- [ ] Keyboard navigation works

### 5.4 Screen Reader
- [ ] All images have alt text
- [ ] All buttons have labels
- [ ] All inputs have labels
- [ ] Heading hierarchy is correct

---

## 6. Feedback Capture

### 6.1 Issues Found

| # | Screen | Issue | Severity | Assigned To |
|---|--------|-------|----------|-------------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

**Severity levels:**
- **Critical:** Blocks design freeze
- **Major:** Must fix before implementation
- **Minor:** Can fix during implementation
- **Enhancement:** Nice-to-have for v1.1

### 6.2 Decisions Made

| Decision | Rationale | Date |
|----------|-----------|------|
| | | |
| | | |

### 6.3 Action Items

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| | | | |
| | | | |

---

## 7. Sign-Off

### Walkthrough Complete

| Name | Role | Approved | Date |
|------|------|----------|------|
| | Team Lead | ☐ | |
| | Product Lead | ☐ | |
| | Mobile Lead | ☐ | |
| | Backend Lead | ☐ | |

### Design Freeze Ready

- [ ] All critical issues resolved
- [ ] All major issues assigned
- [ ] Consistency checks passed
- [ ] Accessibility checks passed
- [ ] Team approves design freeze

---

*This checklist ensures all screens are reviewed before design freeze. Complete all items before proceeding to Week 5 implementation.*