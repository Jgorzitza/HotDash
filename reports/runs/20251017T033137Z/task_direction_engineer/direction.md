# task_direction_engineer — Direction

- **Owner:** Manager Sub-Agent
- **Effective:** 2025-10-17
- **Version:** 1.0

## Objective

Rewrite `docs/directions/engineer.md` to follow the latest agent template with 15–20 launch-aligned tasks covering AppProvider harness, idea pool UI wiring, Publer workflow polish, dashboard health surfaces, and feedback hygiene.

## Current Tasks

1. Snapshot current `docs/directions/engineer.md` for reference.
2. Apply the template from `docs/directions/agenttemplate.md`.
3. Populate the `Objective` to emphasise shipping Shopify-embedded UI that meets the north star outcomes.
4. Craft 15–20 tasks ordered by blocker removal (AppProvider harness, idea pool, Publer, dashboard) and end with the feedback hygiene reminder.
5. Update `Constraints`, `Definition of Done`, `Risk & Rollback`, and `Links` to reflect launch expectations (CI commands, MCP tools, feature pack assets).
6. Add a changelog entry for 2025-10-17 noting the refresh.
7. Format the file with `npx prettier --write docs/directions/engineer.md`.
8. Stage only the engineer direction file.
9. Log any anomalies to `feedback/manager/2025-10-17.md` if issues arise.

## Constraints

- **Allowed Tools:** `bash`, `node`, `npm`, `npx prettier`, `sed`, `rg` (read-only searches).
- **Touched Directories:** `docs/directions/engineer.md`.
- **Budget:** ≤ 45 minutes, ≤ 5,000 tokens, ≤ 3 files modified/staged.
- **Guardrails:** No edits to other direction files in this task. Do not invent new tooling; align tasks with the manager feature pack content.

## Definition of Done

- [x] `docs/directions/engineer.md` uses the new template sections.
- [x] Task list contains 15–20 actionable items in priority order and ends with the feedback hygiene item.
- [x] Formatting via `npx prettier --write docs/directions/engineer.md`.
- [x] `git diff --stat --cached docs/directions/engineer.md` shows only the expected file.
- [x] Notes (if any) captured in `feedback/manager/2025-10-17.md`.

## Risk & Rollback

- **Risk Level:** Medium (direction drift impacts downstream agents).
- **Rollback Plan:** `git checkout -- docs/directions/engineer.md` before staging if output invalid.
- **Monitoring:** Verify task list maps to plan items T1–T6 and feature pack routes.

## Links & References

- Template: `docs/directions/agenttemplate.md`
- Feature pack UI routes: `integrations/new_feature_20251017T033137Z/manager_agent_pack_v1/06-ui/react_router7_routes.tsx`
- Supabase schemas: `integrations/.../03-database/supabase_schema.sql`
- AppProvider harness context: `tests/unit/components/` (existing tests)
- Feedback target: `feedback/engineer/`

## Change Log

- 2025-10-17: Version 1.0 — Rewrote engineer direction for launch sprint.
