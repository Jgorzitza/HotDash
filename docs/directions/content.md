# Content Direction

- **Owner:** Content Agent
- **Effective:** 2025-10-18
- **Version:** 2.1

## Objective

Current Issue: #105

Deliver production-ready content and approvals-ready copy. Today: finalize launch notes + rollback messaging and ensure key UI microcopy aligns with HITL.

## Tasks

1. Draft/publish launch notes with rollback/risk sections; link HITL checklist.
2. Review and refresh UI microcopy (approvals/drawer/dashboard) for clarity and consistency.
3. Partner with AI-Customer/Ads/SEO to sync messaging; list decisions + owners.
4. Write feedback to `feedback/content/2025-10-18.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`, `codex exec`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `app/fixtures/content/**`, `docs/specs/content_pipeline.md`, `docs/runbooks/ai_agent_review_checklist.md`, `docs/design/**`, `feedback/content/2025-10-18.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** No publishing without HITL approval; maintain tone guidelines.

## Definition of Done

- [ ] Fixtures + specs updated for production cadence
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci` (relevant suites) green
- [ ] `npm run scan`
- [ ] Docs/runbooks updated for new workflows
- [ ] Feedback entry completed with evidence
- [ ] Contract test passes

## Autonomy Mode (Do Not Stop)

- If blocked > 15 minutes, record blocker and continue with next queued task. Do not idle.
- Keep changes within Allowed paths; attach logs and drafts.

## Fallback Work Queue (aligned to NORTH_STAR)

1. Content upgrades (Tier‑0 safe edits) — docs/specs/hitl/content-upgrades\*
2. SEO briefs pipeline artifacts — docs/specs/content_pipeline.md
3. Support KB pipeline prep (dev) — docs/specs/support_pipeline.md
4. Approvals microcopy and UX notes — docs/design/approvals_microcopy.md
5. Draft comms for A/B harness experiments (with Product)
6. Alt‑text heuristics and examples catalog
7. Copy micro‑edits policy (tone, length, links)
8. Content pipeline backlog triage templates
9. H1/H2 style guide and linting rules (docs)
10. Troubleshooting playbook for SEO content issues

## Contract Test

- **Command:** `jq '. | length >= 3' app/fixtures/content/idea-pool.json`
- **Expectations:** Fixture file contains >=3 scenarios (launch, evergreen, wildcard) with required fields.

## Risk & Rollback

- **Risk Level:** Low — Incorrect copy is caught by HITL, but delays launches.
- **Rollback Plan:** Revert fixture updates, restore previous copy docs, notify CEO.
- **Monitoring:** Content approvals queue, engagement metrics from analytics tiles.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/content/2025-10-18.md`
- Specs / Runbooks: `docs/specs/content_pipeline.md`

## Change Log

- 2025-10-18: Version 2.1 – Launch notes + HITL linkage
- 2025-10-17: Version 2.0 – Production alignment for fixtures + briefs
- 2025-10-15: Version 1.0 – Initial launch planning
