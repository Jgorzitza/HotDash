# task_direction_ai_customer — Direction

- **Owner:** Manager Sub-Agent
- **Effective:** 2025-10-17
- **Version:** 1.0

## Objective
Rewrite `docs/directions/ai-customer.md` with the template so the AI customer agent delivers tone-aligned drafts, learning loops, Publer/Chatwoot integrations, and feedback hygiene.

## Current Tasks
1. Overwrite the file using `docs/directions/agenttemplate.md`.
2. Use this task list (1–16):
   1. Update prompt templates to include CEO tone directives and Publer copy requirements; attach diff.
   2. Integrate Chatwoot escalation signals into draft prompts, ensuring severity tags recorded.
   3. Capture feedback ingestion pipeline for tone learning; log dataset path in feedback.
   4. Ensure Publer post drafts include first-comment hook suggestions aligned with SEO keywords.
   5. Provide confidence scoring per draft with thresholds requiring human escalation; document logic.
   6. Sync with Support to surface macros vs AI suggestions boundaries; record meeting notes.
   7. Generate evaluation scripts measuring tone/accuracy/policy scores; attach run results.
   8. Teach fallback behavior when Publer API unavailable; add guard to prompt instructions.
   9. Add structured metadata to AI outputs for analytics pipeline (idea id, campaign id); confirm schema alignment.
   10. Document tone-learning workflow in `docs/specs/content_pipeline.md` addendum.
   11. Validate `npm run test:ci` for AI prompt regression suite and record logs.
   12. Refresh RAG index inputs with updated knowledge base articles; capture command output.
   13. Publish training data governance checklist in `docs/specs/metrics_snapshots_qa_ceo.md` section.
   14. Create rollback plan for misaligned model outputs (switch to macros) and store in feedback.
   15. Coordinate with Analytics to feed draft approval stats into sampling guard proof; note alignment.
   16. Write feedback to `feedback/ai-customer/2025-10-17.md` and clean stray md files.
3. Populate Objective/Constraints/DoD/Risk/Links referencing LLM tooling, Chatwoot, Publer, Supabase.
4. Add changelog entry for 2025-10-17.
5. Run `npx prettier --write docs/directions/ai-customer.md`.
6. Stage only `docs/directions/ai-customer.md`.
7. Log blockers in `feedback/manager/2025-10-17.md` if any.

## Constraints
- **Allowed Tools:** `bash`, `node`, `npm`, `npx prettier`, `rg`.
- **Touched Directories:** `docs/directions/ai-customer.md`.
- **Budget:** ≤ 30 minutes, ≤ 4,000 tokens, ≤ 3 files modified/staged.
- **Guardrails:** Limit edits to ai-customer direction file.

## Definition of Done
- [ ] Template applied with provided tasks.
- [ ] Prettier executed.
- [ ] Only `docs/directions/ai-customer.md` staged.
- [ ] Blockers logged if any.

## Risk & Rollback
- **Risk Level:** Medium — tone misalignment impacts customer experience.
- **Rollback Plan:** `git checkout -- docs/directions/ai-customer.md` prior to staging.
- **Monitoring:** Ensure tasks align with tone learning, Publer drafts, and Chatwoot flows.

## Links & References
- Template: `docs/directions/agenttemplate.md`
- Prompts & pipelines: `docs/specs/content_pipeline.md`, `docs/specs/approvals_schema.md`
- Feedback: `feedback/ai-customer/`

## Change Log
- 2025-10-17: Version 1.0 — Template rewrite with AI customer launch tasks.
