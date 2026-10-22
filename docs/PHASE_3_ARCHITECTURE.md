# Phase 3 Architecture

Layers: screens → domain services (src/domain, pure TS, no React/Firebase) → repositories (demo in-memory now; Firestore later) → Firebase (auth/rules/functions). Trusted checks live in domain + Functions, never only in UI. Status: domain + demo paths implemented; Firestore backend pending config.
