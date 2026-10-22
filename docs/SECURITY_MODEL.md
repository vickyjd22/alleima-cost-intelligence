# Security Model

Demo auth = UI role switcher (NOT authorization). Real: Firebase Auth + custom claims (plantIds/roles), default-deny Firestore rules (see firebase/firestore.rules), sensitive ops in Functions (postLedgerTxn, decideApproval, lockPeriod). canApprove() maker-checker + APR-02 stale-version guard enforced in domain today, Functions tomorrow. App Check + emulator per plan; not yet configured — marked Implemented-Demo.
