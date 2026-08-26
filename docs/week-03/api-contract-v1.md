# API Contract v1.0 — OpenAPI Specification

> **Week 3 deliverable** · Based on PROJECT_PLAN §10
> **Base URL:** `https://api.campusshare.app/v1`
> **Format:** REST · JSON · JWT authentication
> **Reference:** `docs/week-03/database-schema-v1.md` for data models

---

## 1. Authentication

All endpoints require `Authorization: Bearer <JWT>` header except auth endpoints.

### JWT Payload

```json
{
  "sub": "userId",
  "email": "student@university.edu",
  "role": "student" | "admin",
  "verificationStatus": "pending" | "verified" | "rejected",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## 2. Endpoints

### 2.1 Auth

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| POST | `/auth/register` | Register with campus email + student ID | `{ email, studentId, password }` | `{ userId, email, verificationStatus }` |
| POST | `/auth/login` | Login, return JWT | `{ email, password }` | `{ token, user }` |
| GET | `/auth/me` | Current user profile | — | `{ user }` |
| POST | `/auth/verify/start` | Begin verification (OTP to campus email) | `{ email }` | `{ message }` |
| POST | `/auth/verify/confirm` | Confirm OTP, mark verified | `{ email, otp }` | `{ user }` |

### 2.2 Items

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| GET | `/items` | Search/filter list | Query: `?q=&category=&location=&page=` | `{ items, pagination }` |
| GET | `/items/:id` | Item detail + availability | — | `{ item, availability }` |
| POST | `/items` | Create listing | `{ title, category, description, pricePerDay, deposit, location, photos[] }` | `{ item }` |
| PATCH | `/items/:id` | Update listing | `{ title?, category?, description?, pricePerDay?, deposit?, location?, status? }` | `{ item }` |
| DELETE | `/items/:id` | Deactivate/delete listing | — | `{ message }` |
| GET | `/items/:id/availability` | Availability calendar | Query: `?month=&year=` | `{ availability[] }` |

### 2.3 Bookings

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| POST | `/bookings` | Request booking (validate availability) | `{ itemId, startDate, endDate }` | `{ booking }` |
| PATCH | `/bookings/:id/accept` | Lender accepts | — | `{ booking }` |
| PATCH | `/bookings/:id/decline` | Lender declines | — | `{ booking }` |
| POST | `/bookings/:id/pay` | Borrower pays fee + deposit (Stripe) | `{ paymentMethodId }` | `{ booking, payment }` |
| POST | `/bookings/:id/pickup` | Confirm pickup + upload before-photos | `{ photos[] }` | `{ booking }` |
| POST | `/bookings/:id/return` | Upload after-photos + mark for lender confirmation | `{ photos[] }` | `{ booking }` |
| POST | `/bookings/:id/confirm-return` | Lender confirms; releases funds + refunds deposit | — | `{ booking, payments[] }` |
| PATCH | `/bookings/:id/cancel` | Cancel per policy | `{ reason }` | `{ booking }` |

### 2.4 Payments

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| POST | `/payments/intent` | Create Stripe PaymentIntent for fee+deposit | `{ bookingId }` | `{ clientSecret, paymentIntentId }` |
| GET | `/payments/:bookingId` | Payment history for a booking | — | `{ payments[] }` |

### 2.5 Disputes

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| POST | `/disputes` | Raise dispute (within 48h of return) | `{ bookingId, reason, description }` | `{ dispute }` |
| GET | `/disputes/:id` | Dispute detail + evidence | — | `{ dispute, evidence[] }` |
| POST | `/disputes/:id/evidence` | Attach evidence | `{ kind, ref }` | `{ evidence }` |
| POST | `/disputes/:id/resolve` | Admin ruling (admin role) | `{ resolution, adminNote, resolutionAmount? }` | `{ dispute }` |

### 2.6 Messaging

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| GET | `/bookings/:id/messages` | List messages | Query: `?limit=&before=` | `{ messages[] }` |
| POST | `/bookings/:id/messages` | Send message | `{ body }` | `{ message }` |

### 2.7 Admin

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| GET | `/admin/verifications` | Pending verification queue | Query: `?page=` | `{ users[], pagination }` |
| POST | `/admin/verifications/:id` | Approve/reject (admin role) | `{ status, reason? }` | `{ user }` |
| GET | `/admin/disputes` | Open disputes queue | Query: `?page=` | `{ disputes[], pagination }` |
| GET | `/admin/analytics` | Usage, revenue, dispute KPIs | Query: `?period=` | `{ analytics }` |

---

## 3. Request/Response Schemas

### User Schema

```json
{
  "id": "string",
  "name": "string",
  "campusEmail": "string",
  "studentId": "string (hashed)",
  "verificationStatus": "pending" | "verified" | "rejected",
  "role": "student" | "admin",
  "rating": 0.0,
  "reviewCount": 0,
  "stripeCustomerId": "string",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

### Item Schema

```json
{
  "id": "string",
  "ownerId": "string (ref → user)",
  "title": "string",
  "category": "academic" | "clothing" | "electronics" | "fitness" | "other",
  "description": "string",
  "pricePerDay": 0.00,
  "deposit": 0.00,
  "status": "draft" | "published" | "booked" | "inactive",
  "photos": ["string (ref → photo)"],
  "location": "string",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

### Booking Schema

```json
{
  "id": "string",
  "itemId": "string (ref → item)",
  "lenderId": "string (ref → user)",
  "borrowerId": "string (ref → user)",
  "startDate": "2026-01-01",
  "endDate": "2026-01-03",
  "totalRental": 9.00,
  "deposit": 10.00,
  "status": "requested" | "accepted" | "paid" | "active" | "returned" | "disputed" | "cancelled" | "declined",
  "pickupConfirmedAt": "2026-01-01T10:00:00Z",
  "returnConfirmedAt": "2026-01-03T15:00:00Z",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

### Payment Schema

```json
{
  "id": "string",
  "bookingId": "string (ref → booking)",
  "type": "rental_fee" | "deposit_capture" | "deposit_refund" | "lender_payout",
  "amount": 0.00,
  "stripeIntentId": "string",
  "status": "pending" | "succeeded" | "failed" | "refunded" | "frozen",
  "createdAt": "2026-01-01T00:00:00Z"
}
```

### Dispute Schema

```json
{
  "id": "string",
  "bookingId": "string (ref → booking)",
  "raisedBy": "string (ref → user)",
  "reason": "damage" | "missing_item" | "late_return" | "other",
  "description": "string",
  "status": "open" | "under_review" | "resolved_lender" | "resolved_borrower" | "rejected",
  "adminNote": "string",
  "resolutionAmount": 0.00,
  "resolvedAt": "2026-01-01T00:00:00Z",
  "createdAt": "2026-01-01T00:00:00Z"
}
```

---

## 4. Error Responses

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid campus email domain"
      }
    ]
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request body or parameters |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (e.g., double-booking) |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 5. Pagination

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max 100) |
| `before` | string | — | Cursor for cursor-based pagination |
| `after` | string | — | Cursor for cursor-based pagination |

### Response Format

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 6. Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Auth endpoints | 10 requests | 15 minutes |
| Read endpoints | 100 requests | 1 minute |
| Write endpoints | 30 requests | 1 minute |
| File upload | 10 requests | 1 minute |

### Response Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

---

## 7. Versioning

- **URL versioning:** `/v1/`, `/v2/`
- **Backwards compatible:** Additive changes only
- **Breaking changes:** New version number
- **Deprecation:** 6-month notice with sunset header

---

## 8. OpenAPI 3.0 Specification

```yaml
openapi: 3.0.3
info:
  title: CampusShare API
  version: 1.0.0
  description: Campus-only peer-to-peer rental platform API
servers:
  - url: https://api.campusshare.app/v1
paths:
  /auth/register:
    post:
      summary: Register with campus email + student ID
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                studentId:
                  type: string
                password:
                  type: string
                  minLength: 8
              required: [email, studentId, password]
      responses:
        '201':
          description: User created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          $ref: '#/components/responses/ValidationError'
        '409':
          $ref: '#/components/responses/Conflict'
```

---

*This API contract aligns with PROJECT_PLAN §10 and the database schema in `docs/week-03/database-schema-v1.md`.*