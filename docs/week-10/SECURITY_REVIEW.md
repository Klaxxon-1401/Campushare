# Week 10 — Security Review

> **Scope:** CampusShare v1.0.0 — the Expo/React Native mobile app and the Express/TypeScript API.
> **Change policy:** review only. **No backend code was modified** for this pass; findings are
> recorded as recommendations for the deployment phase.

## 1. Assets & trust boundaries

| Asset | Where | Sensitivity |
|-------|-------|-------------|
| Campus identity (email, student ID) | API `/v1/auth`, seed data | Personal data (PII) |
| Booking + payment records | API store, `localStore` | Financial |
| Condition photos | Device (image picker), evidence records | Evidence / PII in image |
| Dispute case files | API store, `localStore` | Financial / reputational |

Boundaries: app ↔ API (`/v1`), API ↔ data store, admin console ↔ moderation actions.

## 2. Controls present (verified)

| Area | Control | Status |
|------|---------|--------|
| Transport | HTTPS/TLS is expected in production; API binds HTTP locally for dev only | By design |
| Security headers | `helmet()` applied globally | Present |
| CORS | Explicit allow-list from `CORS_ORIGINS`; non-browser tools (no `Origin`) allowed | Present |
| Rate limiting | Global 120 req/min; **auth endpoints 10 req/15 min** | Present |
| Body limits | `express.json` + `urlencoded` capped at 1 MB | Present |
| Parsing safety | `extended: false` — flat bodies only, mitigating parameter/prototype pollution | Present |
| Input validation | Item/booking validation rejects bad types, zero prices, past dates, overlaps | Present |
| Error handling | Central handler; stack traces only logged in non-prod | Present |
| Overbooking | 409 on conflicting ranges — server-side invariant | Present |

## 3. Findings

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| S1 | **No authentication.** `ownerId`/`borrowerId`/`CURRENT_USER` are stubbed; any caller can act as any user. | **High** | Open — gated on the auth milestone |
| S2 | **No authorization/roles.** The admin console (verification, dispute resolution) is reachable by any user in the demo. | **High** | Open — server-side role enforcement pending |
| S3 | **Client-trusted identity in requests.** The app never sends a token that the API verifies. | **High** | Open — same milestone as S1 |
| S4 | **Mock payments.** No real authorization/capture, so no PCI/settlement controls yet. | Medium | Accepted — Stripe Connect planned |
| S5 | **Debug-signed release APK.** Fine for sideloading; not for store distribution. | Medium | Accepted — use EAS/production keystore |
| S6 | **In-memory data.** No encryption at rest or retention policy in the demo store. | Low (demo) | Accepted — Firestore default encryption at rest |
| S7 | **Student ID stored in clear** in seed data. | Low (demo) | Open — hash/shorten IDs at rest (§16.2) |
| S8 | **No App Check / bot protection** on client traffic. | Low | Recommended for production |

No injection, XSS, path-traversal, CSRF (token-less JSON API) or dependency-critical issues were
identified in the current surface. The dominant risks are all **authentication/authorization**,
which are explicitly out of scope for this build (PROJECT_PLAN §16.1).

## 4. Data-protection posture (target)

The design already anticipates the plan's privacy requirements — implement at the Firestore
milestone:

- **Encryption in transit** (TLS 1.2+) and **at rest** (Firestore/Storage default + App Check).
- **PII minimization** — store student IDs hashed; use email only for verification.
- **GDPR-style rights** — export + delete account; anonymize records after 12 months.
- **Financial retention** — keep payment records 24 months.
- **Photo watermarking** to deter silent evidence tampering (evidence model already carries
  timestamps + capturer).

## 5. Prioritized recommendations

1. **Add authentication (S1/S3):** issue short-lived JWTs; verify on every request; derive
   `ownerId`/`borrowerId` from the token, never the body.
2. **Add authorization (S2):** server-side role checks; Firestore security rules as drafted in
   PROJECT_PLAN §16.3 (`items` owner/admin write, `bookings` participants only, etc.).
3. **Add App Check/bot protection (S8)** and tighten the global rate limit in production.
4. **Real payments (S4)** via Stripe Connect with server-authoritative deposit holds.
5. **Harden the store (S6/S7):** Firestore with at-rest encryption, hashed student IDs, retention
   jobs.
6. **Sign for release (S5):** EAS production profile with an upload keystore.

## 6. Threat scenarios considered

- **Malicious borrower** disputes a clean return to reclaim value → adjudicated against
  timestamped before/after photos (evidence model present).
- **Overlapping claims** on one item → rejected server-side with 409 (verified).
- **Credential brute force** → strict auth rate limiting (10/15 min) already in place.
- **Origin spoofing** → CORS allow-list + 403 on unknown origins (verified).
