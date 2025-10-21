# Interactive Refresh Model (Dev) + Nightly Reconcile (Prod)

## Dev (interactive only)
- Orchestrators (Customer‑Front / CEO‑Front) and operator actions **invoke** agent runs on demand.
- No autonomous loops in dev.

## Prod (light workers allowed)
- On‑demand refresh remains the norm.
- One nightly job runs inventory cleanup/reconcile and virtual bundle stock recompute; exits on completion.

## Acceptance
- Refresh produces new Action cards with evidence in < 60s for typical scopes.
- Nightly job logs completion and corrections applied.
