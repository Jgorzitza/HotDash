# Content Agent Direction

- **Owner:** Manager Sub-Agent
- **Effective:** 2025-10-17
- **Version:** 1.0

## Objective

Drive content operations so Publer launch messaging, idea briefs, approvals alignment, and feedback hygiene are ready for execution and measurable against campaign goals.

## Current Tasks

1. Draft Publer campaign strategy for launch week (channels, cadence) and store in `docs/specs/content_pipeline.md`.
2. Produce five idea briefs (including wildcard) mapped to Supabase idea pool entries; attach link references.
3. Create tone + style guide addendum referencing CEO feedback, stored in `docs/specs/stakeholder_comms.md`.
4. Collaborate with AI Customer agent to define tone-learning prompts and seed examples; document in `feedback/content/2025-10-17.md`.
5. Build approval checklist for content drafts in `docs/specs/approvals_schema.md` (content section) aligned with Publer fields.
6. Generate Publer first-comment templates referencing SEO keywords; store in `docs/specs/seo_backlog.md` cross-links.
7. Prepare launch blog outline summarising control center value; attach to feedback.
8. Produce social asset copy blocks (short, medium, long form) and upload to `artifacts/content/`.
9. Sync with Analytics to capture KPI expectations per content campaign; include summary in feedback.
10. Coordinate with Support to ensure knowledge base updates reference new workflows; log completion.
11. Verify Publer adapter copy surfaces (UI) reflect brand voice; screenshot evidence with annotations.
12. Build idea iteration backlog doc referencing Publer performance metrics for follow-up content.
13. Ensure translation/localisation checklist exists for future markets (if not, note as backlog).
14. Update `docs/specs/content_iteration_backlog.md` with priority, owner, status for each content asset.
15. Run content QA (grammar, clarity) on idea briefs + Publer copy; share tool output (Grammarly, etc.).
16. Write feedback to `feedback/content/2025-10-17.md` and clean stray md files.

## Constraints

- **Allowed Tools:** `bash`, `node`, `npm`, `npx prettier`, `rg`.
- **Touched Directories:** `docs/directions/content.md`.
- **Budget:** ≤ 30 minutes, ≤ 4,000 tokens, ≤ 3 files modified/staged.
- **Guardrails:** Edits limited to content direction file.

## Definition of Done

- [ ] Template applied with tasks and sections.
- [ ] Prettier executed on `docs/directions/content.md`.
- [ ] Only `docs/directions/content.md` staged.
- [ ] Blockers logged in `feedback/manager/2025-10-17.md` if encountered.

## Risk & Rollback

- **Risk Level:** Low — misaligned content reduces launch impact but not system stability.
- **Rollback Plan:** `git checkout -- docs/directions/content.md` before staging.
- **Monitoring:** Ensure direction aligns with idea pool, Publer workflows, and SEO plan.

## Links & References

- Template: `docs/directions/agenttemplate.md`
- Content specs: `docs/specs/content_pipeline.md`, `docs/specs/content_iteration_backlog.md`
- Publer docs: `docs/integrations/social_adapter.md`
- Feedback: `feedback/content/`

## Change Log

- 2025-10-17: Version 1.0 — Template rewrite for launch content ops.
