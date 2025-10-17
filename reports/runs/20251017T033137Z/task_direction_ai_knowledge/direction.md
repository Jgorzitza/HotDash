# task_direction_ai_knowledge — Direction

- **Owner:** Manager Sub-Agent
- **Effective:** 2025-10-17
- **Version:** 1.0

## Objective
Rewrite `docs/directions/ai-knowledge.md` using the template so knowledge ops manages RAG updates, content ingestion, Publer/Chatwoot insights, and feedback hygiene.

## Current Tasks
1. Apply the template from `docs/directions/agenttemplate.md`.
2. Use the following tasks (1–16):
   1. Refresh knowledge base ingestion feed with latest docs (README, North Star, launch plan); attach command output.
   2. Rebuild RAG index (`npm run ai:build-index`) and store artifact path in feedback.
   3. Integrate Publer health artifacts into knowledge embeddings; document mapping.
   4. Add Chatwoot escalation summaries to embeddings with redaction rules.
   5. Produce knowledge taxonomy update in `docs/specs/support_kb_pipeline.md` referencing idea pool.
   6. Validate knowledge base search accuracy via evaluation script; record metrics.
   7. Implement drift detection logging for outdated knowledge entries; attach diff.
   8. Coordinate with Content on tone FAQ ingestion; log meeting notes.
   9. Sync with Support to ensure macros reference knowledge entries; document alignment.
   10. Update knowledge base export to include Publer/Chatwoot best practices; attach proof.
   11. Add versioning metadata to knowledge entries for analytics lineage.
   12. Run `npm run ai:eval` to verify embed quality and share results.
   13. Create rollback plan for knowledge index corruption and document in feedback.
   14. Ensure secrets handled via vault references during ingestion; audit script output.
   15. Publish learning summary in `docs/specs/metrics_snapshots_qa_ceo.md` (knowledge section).
   16. Write feedback to `feedback/ai-knowledge/2025-10-17.md` and clean stray md files.
3. Populate Objective/Constraints/DoD/Risk/Links referencing RAG tooling, Supabase, Publer, Chatwoot.
4. Add changelog entry for 2025-10-17.
5. Run `npx prettier --write docs/directions/ai-knowledge.md`.
6. Stage only `docs/directions/ai-knowledge.md`.
7. Note blockers in `feedback/manager/2025-10-17.md` if any.

## Constraints
- **Allowed Tools:** `bash`, `node`, `npm`, `npx prettier`, `rg`.
- **Touched Directories:** `docs/directions/ai-knowledge.md`.
- **Budget:** ≤ 30 minutes, ≤ 4,000 tokens, ≤ 3 files modified/staged.
- **Guardrails:** Limit edits to ai-knowledge direction file.

## Definition of Done
- [ ] Template applied with provided tasks.
- [ ] Prettier executed.
- [ ] Only `docs/directions/ai-knowledge.md` staged.
- [ ] Blockers logged if any.

## Risk & Rollback
- **Risk Level:** Low — knowledge drift degrades AI accuracy but not platform stability.
- **Rollback Plan:** `git checkout -- docs/directions/ai-knowledge.md` before staging.
- **Monitoring:** Ensure tasks align with knowledge ingestion cadence and analytics metrics.

## Links & References
- Template: `docs/directions/agenttemplate.md`
- Knowledge specs: `docs/specs/support_kb_pipeline.md`, `docs/specs/content_pipeline.md`
- AI scripts: `npm run ai:build-index`, `npm run ai:eval`
- Feedback: `feedback/ai-knowledge/`

## Change Log
- 2025-10-17: Version 1.0 — Template rewrite with AI knowledge launch tasks.
