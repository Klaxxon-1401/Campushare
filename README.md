# CampusShare

A peer-to-peer **campus equipment rental** platform for students and faculty — same-university
lending with verified identity, photo-backed condition evidence, and money-safe deposits.

> **Project status:** see [`PROGRESS.md`](./PROGRESS.md) for what is built, verified, and pending.

- **Mobile app** — Expo/React Native (Android via Expo/EAS), in `mobile/`
- **API** — Express + TypeScript (in-memory today, Firestore next), in `api/`
- **Docs** — weekly trackers, API contract, project plan in `docs/` + `PROJECT_PLAN.md`

## Repo layout

```
api/                 Express API (types, in-memory store, items & bookings controllers)
mobile/              Expo SDK 57 app (screens, components, hooks, services, navigation)
mobile/src/services/ localStore + api facade  ← swap point for the Firestore backend
docs/week-06..12/    milestone trackers, testing report, release notes
mobile-app-scaffold/ discarded Android Studio blank template (not part of the app)
```

## Quick start — mobile app

```bash
cd mobile
npm install
npm start                 # Expo Dev Server → scan QR in Expo Go / run on emulator
```

The app is fully self-contained: screens read an in-memory store through the `services/api`
facade and demo end-to-end (list, search, book, pay, handover photos, chat, review, dispute).

## Quick start — API

```bash
cd api
npm install
npm run build && npm start    # http://localhost:3000
npm run smoke                  # 19 end-to-end asserts on its own port
```

## Building the Android APK

```bash
cd mobile
npx eas build -p android --profile preview      # cloud build → installable .apk
# or locally:
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease          # needs Android SDK + JDK 17
```

See `docs/week-11-12/RELEASE_NOTES.md` for signing, profiles, and the release checklist.

## Quality gates

```bash
cd mobile && npm run typecheck && npm test       # 16 unit tests, clean types
cd mobile && npx expo export -p android          # Android Hermes bundle compiles
cd api && npm run smoke                          # 19 end-to-end asserts
```

## Milestones

- **Weeks 1–5** — planning, UX, API contract, scaffold (`docs/week-0X`)
- **Week 6** — listings, search/filters, availability calendar, booking module
- **Week 7** — mock payments, deposit hold/release, condition-photo handover
- **Week 8** — per-booking messaging, in-app notifications, admin dashboard
- **Week 9** — reviews, ratings, disputes
- **Week 10** — testing, UAT & security review
- **Weeks 11–12** — Android build config, release notes, user guide, presentation, deployment roadmap

## Documentation

- [`PROGRESS.md`](./PROGRESS.md) — what's built, verified, and pending
- [`docs/week-10/TESTING_REPORT.md`](./docs/week-10/TESTING_REPORT.md) — test layers & results
- [`docs/week-10/UAT_REPORT.md`](./docs/week-10/UAT_REPORT.md) — acceptance testing
- [`docs/week-10/SECURITY_REVIEW.md`](./docs/week-10/SECURITY_REVIEW.md) — security pass
- [`docs/week-11-12/RELEASE_NOTES.md`](./docs/week-11-12/RELEASE_NOTES.md) — build & release
- [`docs/week-11-12/USER_GUIDE.md`](./docs/week-11-12/USER_GUIDE.md) — how to use the app
- [`docs/week-11-12/PRESENTATION.md`](./docs/week-11-12/PRESENTATION.md) — demo script