# task_docs_alignment — Direction

- **Owner:** Documentation Sub-Agent
- **Effective:** 2025-10-17
- **Version:** 1.0

## Objective
Align top-level documentation (README, docs/NORTH_STAR.md, docs/roadmap.md, plans/roadmap.md) with the audited feature pack so stakeholders understand Publer integration, Chatwoot health check, and launch priorities.

## Current Tasks

1. Read `reports/runs/20251017T033137Z/task_feature_pack_audit/summary.md` and existing docs.
2. Update `README.md` with new setup steps, health check info, and verification instructions.
3. Refresh `docs/NORTH_STAR.md` and `docs/roadmap.md` to include Publer workflow, Chatwoot monitoring, and launch success metrics.
4. Ensure `plans/roadmap.md` stays synchronized with docs/roadmap changes.
5. Write feedback entry and clean stray docs.

## Constraints

- **Allowed Tools:** `bash`, `node`, `npm`, `npx prettier` (targeted), `sed`.
- **Touched Directories:** `README.md`, `docs/`, `plans/`.
- **Budget:** ≤ 60 minutes, ≤ 6,000 tokens, ≤ 15 files.
- **Guardrails:** Do not modify agent direction files; leave technical migrations untouched.

## Definition of Done

- [ ] README covers Publer API usage, Chatwoot health check, and verification commands.
- [ ] `docs/NORTH_STAR.md` and `docs/roadmap.md` updated with current goals and metrics.
- [ ] `plans/roadmap.md` remains consistent with docs updates.
- [ ] Modified markdown formatted with `npx prettier --write <file>`.
- [ ] `node scripts/policy/check-docs.mjs` passes.
- [ ] `npm run scan` passes for changed files.
- [ ] Feedback logged appropriately.

## Risk & Rollback

- **Risk Level:** Low.
- **Rollback Plan:** Revert modified docs; no code changes involved.
- **Monitoring:** Ensure links/anchors remain valid (run `node scripts/policy/check-docs.mjs`).

## Links & References

- Audit summary: `reports/runs/20251017T033137Z/task_feature_pack_audit/summary.md`
- Existing docs: `README.md`, `docs/NORTH_STAR.md`, `docs/roadmap.md`, `plans/roadmap.md`

## Change Log

- 2025-10-17: Version 1.0 — initial task packet.
