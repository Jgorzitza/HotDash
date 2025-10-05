---
epoch: 2025.10.E1
doc: docs/directions/README.md
owner: manager
last_reviewed: 2025-10-04
doc_hash: TBD
expires: 2025-10-18
---
# Direction Governance

Direction files are canonical instructions for each agent. To prevent drift:

1. **Manager owned** — only the manager curates `docs/directions/*.md`. Agents must never create or edit direction files.
2. **Canon first** — every direction references:
   - `docs/NORTH_STAR.md`
   - `docs/git_protocol.md`
   - this governance doc (`docs/directions/README.md`)
   - `docs/policies/mcp-allowlist.json`
3. **Change process** — proposed adjustments require:
   - Evidence link (feedback log, metrics) demonstrating need.
   - PR routed to `@manager-team` with summary + impact.
   - Updated hash recorded in `canon.lock`.
4. **Read-only intent** — agents consume their direction, follow linked canon, and log questions in their feedback file (for example `feedback/qa.md`).
5. **Secrets** — Supabase credentials live in CI secrets (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`) and local `.env`; never commit real values to version control.
6. **Audit trail** — manager logs direction updates in `feedback/manager.md` for transparency.

Violations (unauthorized files or edits) are blockers and must be reported immediately.
