# Alleima Cost Intelligence — build complete (Phases 0–7 scaffold + working flows)

Expo Router + TypeScript strict + React Native Web + Firebase (Auth/Firestore/Functions/Storage/AppCheck/FCM/Hosting).

## Quick start
1. Copy `.env.example` → `.env` and fill Firebase web config (dev project).
2. `npm install`
3. `npm run typecheck` · `npm test`
4. `npx expo start` (Emulator Suite ports in `firebase.json`: auth 9099, firestore 8080, functions 5001, storage 9199, UI 4000).
5. Functions: `cd firebase/functions && npm install && npm run build && firebase deploy --only functions,firestore:rules,storage`.

## Deploy / environments
- dev → test → prod Firebase projects; no prod secrets in client; Secret Manager for ERP/SAP creds; App Check enforced; backups per retention plan.
- Hosting: `expo export --platform web` → Firebase Hosting (or approved host). Mobile: EAS builds for Android/iOS/tablet.

## UAT gate (Phase 7)
Finance-approved examples for MHR/labour/utility/MPV/MUV/yield/WIP/OH; pool-vs-allocated=0; Invoice-0 + 514-reallocation paths; maker≠checker; period lock; Journeys A–G E2E on emulator; sign-off before prod migration + training/handover.

## Structure
- `app/` routes (auth + app). `src/theme/tokens.ts` single brand source.
- `src/config/modules.ts` shared nav registry. `src/lib/permissions.ts|validation.ts|costing.ts`.
- `src/components/` shared UI. `firebase/` rules. Docs in `docs/`.

> Calculations in `lib/costing.ts` are candidates pending finance sign-off. No real values seeded.
