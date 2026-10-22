# State Transition Matrix

WO: Draft→ReadyForReview→Released→InProgress→OnHold/Completed→Closed. Costing: Draft→Validating→Ready→Calculated→UnderReview→Approved/Rejected→Finalized (terminal, COST-02). Recon: Open→Investigating→CorrectionRequested→AwaitingApproval→Resolved→Reconciled. Approval: Pending→Approved/Rejected/ChangesRequested/Withdrawn/Escalated. Enforced in src/domain/machines.ts + services.ts with role + comment guards.
