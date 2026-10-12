# Weeks 11–12 — Release & Android Build

> **Deliverables:** installable Android package + release documentation.

## How the APK gets produced

Two supported paths (both produce a real, installable Android app):

**1. Cloud build — EAS (recommended, zero local SDK setup)**
```bash
cd mobile
npx eas-cli init                 # one-time: links your Expo account + project
npx eas build -p android --profile preview        # → .apk for install/demo
npx eas build -p android --profile production     # → .aab for Play Store
```

**2. Local build — Gradle (fully offline-capable, uses the repo SDK)**
```bash
cd mobile
npx expo prebuild --platform android              # generates ./android
cd android && ./gradlew assembleRelease           # needs Android SDK + JDK 17
# output: android/app/build/outputs/apk/release/app-release.apk
```
`npx expo run:android` installs the debug variant straight onto a connected device/emulator.

`mobile/eas.json` defines the profiles: `development` (dev client), `preview` (APK, versioned),
`production` (AAB with appVersionSource remote).

## Signing

- **Local builds** use the debug keystore by default — fine for a demo/sideloading APK.
- **EAS / Play Store** builds need a real upload keystore. Generate one and set it in the EAS
  project dashboard (credentials workflow: `eas credentials`) before publishing.

## App identity (app.json)

- name `CampusShare`, slug `campus-rental`, scheme `campusshare`.
- Icon/splash/adaptive-icon generated in `mobile/assets`.
- Android package from `expo prebuild` is `com.campusshare.mobile` (set `android.package` in
  `app.json` for the release build so the app id is stable).

## Release checklist (project submission)

- [x] Week 6–9 feature scope complete (listings, search, availability, booking, payments,
      photo evidence, chat, reviews, disputes)
- [x] Typecheck + 13 mobile unit tests + 19 API smoke tests green
- [x] Android JS bundle builds (Hermes)
- [x] `eas.json` profiles configured
- [ ] Produce APK via `eas build --profile preview` (or local `assembleRelease`)
- [ ] Demo walkthrough script from Week-6 seed data (see `docs/week-07/WEEK_TRACKER.md`)
- [ ] Firestore + JWT integration (post-course deployment phase)

## Post-course deployment roadmap (PROJECT_PLAN §9/§21)

1. Expo Auth (JWT) protecting `ownerId`/`borrowerId`.
2. Firestore backend replacing `localStore`/in-memory API (contracts already in docs).
3. Stripe Connect for real payments + deposit holds.
4. Condition-photo upload to Firebase Storage with the existing evidence model.
5. Push notification bridge for chat + booking updates.