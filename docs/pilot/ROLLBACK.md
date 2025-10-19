# Pilot Rollback

Scope

- Remove pilot-only artifacts with no runtime impact. Keep artifacts/ evidence for audit.

Steps

1. Delete directories:
   - `packages/pilot/`
   - `scripts/pilot/`
   - `docs/pilot/`
2. Leave `artifacts/pilot/<date>/mcp/*.jsonl` intact for compliance.
3. Revert any PR that introduced pilot docs/scripts if needed (no app/runtime changes).

Verification

- Run: `node scripts/pilot/lint.mjs` (should fail with missing files)
- No changes in production routes or flags.

Notes

- No secrets, no external calls; safe to roll back at any time.
