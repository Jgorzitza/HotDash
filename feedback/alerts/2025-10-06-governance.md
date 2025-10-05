---
epoch: 2025.10.E1
doc: feedback/alerts/2025-10-06-governance.md
owner: manager
last_reviewed: 2025-10-06
doc_hash: TBD
expires: 2025-10-13
---
# Governance Broadcast — 2025-10-06

## Summary
- All direction docs now include a shared Canon section (North Star, Git protocol, direction governance, MCP allowlist).
- docs/directions/README.md codifies that only the manager authors/updates direction files.
- Supabase credential check added to CI (`scripts/ci/check-supabase.mjs`) to ensure Memory logs persist outside local fallback.

## Required Action (All Agents)
1. Read docs/directions/README.md and your role direction doc; acknowledge in your role feedback log (e.g., `feedback/qa.md`).
2. Confirm Supabase creds are available in your environment before running e2e flows; CI will block if missing.

## Evidence Links
- Governance doc: docs/directions/README.md
- CI check: scripts/ci/check-supabase.mjs, .github/workflows/tests.yml
