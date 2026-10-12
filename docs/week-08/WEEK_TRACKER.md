# Week 8 — Messaging

> **Deliverables (PROJECT_PLAN §15):** in-app chat between borrower and lender per booking.

## Status Board

| Deliverable | Artifact | Status | Notes |
|------------|----------|--------|-------|
| Conversations list | `src/screens/Messages/ConversationsScreen.tsx` | ✅ | Sorted by recency, unread badges, item context |
| Chat screen | `src/screens/Messages/ChatScreen.tsx` | ✅ | Bubbles, timestamps, auto-scroll, multiline input |
| Per-booking threads | `localStore.ensureConversation` | ✅ | One thread per booking; members = lender + borrower |
| Entry points | Home header badge, BookingDetail, Profile | ✅ | `unreadCount` feeds the Home + Profile badges |
| Read state | `getConversation` | ✅ | Marks thread read for the opener |

## Behavior notes

- Conversations are **scoped to a booking** — no random-user DMs, which keeps lending safer
  on a campus platform.
- Unread counts are per-conversation per-member and badge-visible on Home and Profile.
- Seed data includes threads for the active TI-84 rental and the completed drafting-kit rental,
  so the tab demos immediately.

## Real-backend mapping

Will map to Firestore: `conversations/{id}` (members, lastMessageAt, unreadMap) and
`messages/{conversationId}/{id}` with a security rule that only members may read/write.
Realtime sync arrives with Firestore (Week 10+); the local store is polling-free today.