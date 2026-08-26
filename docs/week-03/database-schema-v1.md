# Database Schema v1.0 — Firestore

> **Week 3 deliverable** · Based on PROJECT_PLAN §9
> **Database:** Cloud Firestore (NoSQL)
> **Reference:** `design/design.md` for design tokens, `docs/week-02/requirements-specification.md` for field requirements

---

## 1. Collections Overview

```
users/
  {userId}/
    - name: string
    - campusEmail: string
    - studentId: string (hashed)
    - verificationStatus: 'pending' | 'verified' | 'rejected'
    - role: 'student' | 'admin'
    - rating: number
    - reviewCount: number
    - stripeCustomerId: string
    - createdAt: timestamp
    - updatedAt: timestamp

items/
  {itemId}/
    - ownerId: ref → users/{userId}
    - title: string
    - category: 'academic' | 'clothing' | 'electronics' | 'fitness' | 'other'
    - description: string
    - pricePerDay: number
    - deposit: number
    - status: 'draft' | 'published' | 'booked' | 'inactive'
    - location: string
    - createdAt: timestamp
    - updatedAt: timestamp

item_photos/
  {photoId}/
    - itemId: ref → items/{itemId}
    - url: string (Firebase Storage path)
    - kind: 'primary' | 'gallery' | 'condition'
    - order: number
    - createdAt: timestamp

availability/
  {availabilityId}/
    - itemId: ref → items/{itemId}
    - date: timestamp (day-level granularity)
    - state: 'open' | 'booked' | 'blocked'
    - createdAt: timestamp

bookings/
  {bookingId}/
    - itemId: ref → items/{itemId}
    - lenderId: ref → users/{userId}
    - borrowerId: ref → users/{userId}
    - startDate: timestamp
    - endDate: timestamp
    - totalRental: number
    - deposit: number
    - status: 'requested' | 'accepted' | 'paid' | 'active' | 'returned' | 'disputed' | 'cancelled' | 'declined'
    - pickupConfirmedAt: timestamp
    - returnConfirmedAt: timestamp
    - createdAt: timestamp
    - updatedAt: timestamp

condition_photos/
  {photoId}/
    - bookingId: ref → bookings/{bookingId}
    - capturedBy: ref → users/{userId}
    - stage: 'before' | 'after'
    - url: string (Firebase Storage path)
    - capturedAt: timestamp

payments/
  {paymentId}/
    - bookingId: ref → bookings/{bookingId}
    - type: 'rental_fee' | 'deposit_capture' | 'deposit_refund' | 'lender_payout'
    - amount: number
    - stripeIntentId: string
    - status: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'frozen'
    - createdAt: timestamp

disputes/
  {disputeId}/
    - bookingId: ref → bookings/{bookingId}
    - raisedBy: ref → users/{userId}
    - reason: 'damage' | 'missing_item' | 'late_return' | 'other'
    - description: string
    - status: 'open' | 'under_review' | 'resolved_lender' | 'resolved_borrower' | 'rejected'
    - adminNote: string
    - resolutionAmount: number
    - resolvedAt: timestamp
    - createdAt: timestamp

evidence/
  {evidenceId}/
    - disputeId: ref → disputes/{disputeId}
    - kind: 'photo' | 'message'
    - ref: string (Storage path or message ID)
    - submittedBy: ref → users/{userId}
    - createdAt: timestamp

messages/
  {messageId}/
    - bookingId: ref → bookings/{bookingId}
    - senderId: ref → users/{userId}
    - body: string
    - createdAt: timestamp

reviews/
  {reviewId}/
    - bookingId: ref → bookings/{bookingId}
    - fromUserId: ref → users/{userId}
    - toUserId: ref → users/{userId}
    - rating: number (1-5)
    - comment: string
    - createdAt: timestamp

notifications/
  {notificationId}/
    - userId: ref → users/{userId}
    - type: 'booking' | 'payment' | 'return' | 'dispute' | 'reminder'
    - title: string
    - body: string
    - read: boolean
    - createdAt: timestamp
```

---

## 2. Indexes

### Compound Indexes

```javascript
// items collection
{ fieldPath: 'status', order: 'ASCENDING' }
{ fieldPath: 'category', order: 'ASCENDING' }
{ fieldPath: 'location', order: 'ASCENDING' }
{ fieldPath: 'ownerId', order: 'ASCENDING' }

// bookings collection
{ fieldPath: 'itemId', order: 'ASCENDING' }
{ fieldPath: 'status', order: 'ASCENDING' }
{ fieldPath: 'borrowerId', order: 'ASCENDING' }
{ fieldPath: 'status', order: 'ASCENDING' }
{ fieldPath: 'lenderId', order: 'ASCENDING' }
{ fieldPath: 'status', order: 'ASCENDING' }

// availability collection
{ fieldPath: 'itemId', order: 'ASCENDING' }
{ fieldPath: 'date', order: 'ASCENDING' }

// payments collection
{ fieldPath: 'bookingId', order: 'ASCENDING' }
{ fieldPath: 'type', order: 'ASCENDING' }

// messages collection
{ fieldPath: 'bookingId', order: 'ASCENDING' }
{ fieldPath: 'createdAt', order: 'ASCENDING' }

// reviews collection
{ fieldPath: 'toUserId', order: 'ASCENDING' }
{ fieldPath: 'createdAt', order: 'DESCENDING' }

// notifications collection
{ fieldPath: 'userId', order: 'ASCENDING' }
{ fieldPath: 'read', order: 'ASCENDING' }
{ fieldPath: 'createdAt', order: 'DESCENDING' }
```

---

## 3. Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == userId || 
                    request.auth.token.admin == true;
      allow delete: if false; // Soft delete only
    }
    
    // Items collection
    match /items/{itemId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.verificationStatus == 'verified';
      allow update: if request.auth.uid == resource.data.ownerId || 
                    request.auth.token.admin == true;
      allow delete: if request.auth.uid == resource.data.ownerId || 
                    request.auth.token.admin == true;
    }
    
    // Item photos collection
    match /item_photos/{photoId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
    
    // Availability collection
    match /availability/{availabilityId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null;
    }
    
    // Bookings collection
    match /bookings/{bookingId} {
      allow read: if request.auth != null && 
                  (request.auth.uid == resource.data.lenderId || 
                   request.auth.uid == resource.data.borrowerId ||
                   request.auth.token.admin == true);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                    (request.auth.uid == resource.data.lenderId || 
                     request.auth.uid == resource.data.borrowerId ||
                     request.auth.token.admin == true);
    }
    
    // Condition photos collection
    match /condition_photos/{photoId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false; // Immutable after creation
    }
    
    // Payments collection
    match /payments/{paymentId} {
      allow read: if request.auth != null;
      allow create, update: if false; // Server-side only
    }
    
    // Disputes collection
    match /disputes/{disputeId} {
      allow read: if request.auth != null && 
                  (request.auth.uid == resource.data.raisedBy ||
                   request.auth.token.admin == true);
      allow create: if request.auth != null;
      allow update: if request.auth.token.admin == true;
    }
    
    // Evidence collection
    match /evidence/{evidenceId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false; // Immutable after creation
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
    
    // Reviews collection
    match /reviews/{reviewId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false; // Immutable after creation
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if request.auth != null && 
                  request.auth.uid == resource.data.userId;
      allow create: if false; // Server-side only
      allow update: if request.auth.uid == resource.data.userId;
      allow delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 4. Data Flow Examples

### Booking Lifecycle

```
1. Borrower requests booking
   → bookings/{bookingId}.status = 'requested'
   → availability/{date}.state = 'booked' (atomic write)

2. Lender accepts
   → bookings/{bookingId}.status = 'accepted'
   → Notification sent to borrower

3. Borrower pays
   → Stripe PaymentIntent created
   → payments/{paymentId} created (type: 'rental_fee', 'deposit_capture')
   → bookings/{bookingId}.status = 'paid'

4. Pickup + before photos
   → condition_photos/{photoId} created (stage: 'before')
   → bookings/{bookingId}.pickupConfirmedAt = timestamp
   → bookings/{bookingId}.status = 'active'

5. Return + after photos
   → condition_photos/{photoId} created (stage: 'after')
   → bookings/{bookingId}.status = 'returned'
   → Notification sent to lender

6. Lender confirms return
   → bookings/{bookingId}.returnConfirmedAt = timestamp
   → payments/{paymentId} created (type: 'lender_payout')
   → payments/{paymentId} created (type: 'deposit_refund')
   → bookings/{bookingId}.status = 'returned' (final)
   → Reviews enabled
```

### Dispute Flow

```
1. Dispute raised
   → disputes/{disputeId} created (status: 'open')
   → payments affected = 'frozen'

2. Evidence submitted
   → evidence/{evidenceId} created
   → disputes/{disputeId}.status = 'under_review'

3. Admin resolves
   → disputes/{disputeId}.status = 'resolved_lender' | 'resolved_borrower'
   → payments/{paymentId} updated based on ruling
   → disputes/{disputeId}.resolvedAt = timestamp
```

---

## 5. Performance Considerations

### Query Optimization

- **Denormalize** frequently accessed data (e.g., store lender name in bookings)
- **Use composite indexes** for complex queries (e.g., items by category + status)
- **Limit query results** to 20 items max, implement pagination
- **Cache** user profiles and item details client-side

### Storage Optimization

- **Compress images** before upload (max 1MB per photo)
- **Use thumbnails** for list views (200px width)
- **Store originals** only for detail views and evidence
- **Implement cleanup** for orphaned photos

### Write Optimization

- **Batch writes** for related operations (e.g., booking + availability update)
- **Use transactions** for critical operations (e.g., double-booking prevention)
- **Atomic writes** for availability updates to prevent race conditions

---

## 6. Migration Strategy

### v1.0 → Future Versions

- **Add fields** with defaults for existing documents
- **Deprecate fields** gradually, maintain backwards compatibility
- **Use Cloud Functions** for data migrations
- **Version control** schema changes in this document

---

*This schema is designed for Firestore's document model and aligns with the requirements in `docs/week-02/requirements-specification.md` and PROJECT_PLAN §9.*