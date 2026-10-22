# Data Integrity Strategy

Ledger keyed by idempotency key: retry returns original outcome (tested). Posted movements immutable; corrections via reversals. Issue/transfer checks available balance (negative-stock policy pending). Locked-period guard with redirect message. Firestore transactions + server timestamps reserved for backend step.
