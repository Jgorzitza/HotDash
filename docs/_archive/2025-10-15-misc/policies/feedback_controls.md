# Feedback and Direction Controls

This repository enforces the documented process:

- Agents write feedback only in their own file under `feedback/<agent>.md` (e.g., engineer → `feedback/engineer.md`, chatwoot → `feedback/chatwoot.md`).
- Direction documents under `docs/directions/` are written only by the Manager.
- PRs must include evidence links (Vitest, Playwright, Lighthouse, metrics, soak when streaming).
- Branch naming must follow `agent/<agent>/<molecule>` or `hotfix/<slug>`.

Automation summary:

Security and evidence hygiene:

- Never commit raw secrets (DSNs, API tokens). Redact with **_REDACTED_** before saving any evidence.
- Do not store session/embed tokens. Use the RR7 + Shopify CLI v3 flow instead of token capture.
- Evidence under artifacts/ must be sanitized; logs containing Redis/Postgres URIs must be redacted or omitted.
- Use vault paths referenced in docs/ops/credential_index.md for any credentials used locally.

1. Evidence Gate: `.github/workflows/evidence.yml` requires evidence references in PR body.
2. Feedback Cadence: `.github/workflows/feedback_cadence.yml` warns if no recent feedback updates.
3. Branch Policy: `.github/workflows/branch_name.yml` enforces branch naming.
4. Drift Watchdog: `.github/workflows/drift_watchdog.yml` guards epoch drift in docs.
5. Direction Guard: `.github/workflows/direction_guard.yml` blocks non-manager edits to `docs/directions/**` unless labeled `approved-by-manager`.

Manual expectations:

- Every feedback entry must contain timestamp, command executed, and output path/screenshot reference.
- Manager posts daily stand-up notes in `feedback/manager.md` using `docs/directions/manager_standup_template.md` by 15:00 UTC.
- Secrets never committed; reference `docs/ops/credential_index.md` and vault locations.
