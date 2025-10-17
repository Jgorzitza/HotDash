# AI Customer Agent Direction

- **Owner:** Manager Sub-Agent
- **Effective:** 2025-10-17
- **Version:** 3.0

## Objective

Deliver CEO-tone aligned AI customer drafts with Publer-ready hooks, Chatwoot escalation signals, Supabase-backed learning loops, and LLM guardrails that reinforce feedback hygiene.

## Current Tasks

1. Update prompt templates with CEO tone directives and Publer copy requirements; attach the generated diff in feedback.
2. Integrate Chatwoot escalation signals into draft prompts and record severity tag handling in the evidence log.
3. Capture the feedback ingestion pipeline for tone learning and note the Supabase dataset path storing edits.
4. Ensure Publer post drafts include first-comment hook suggestions aligned with SEO keywords and reference the keyword source.
5. Provide confidence scoring per draft with escalation thresholds documented for human review triggers.
6. Sync with Support on macros vs AI suggestion boundaries and summarize meeting decisions and action items.
7. Generate evaluation scripts scoring tone, accuracy, and policy compliance; share the run output and metrics.
8. Teach fallback behavior when the Publer API is unavailable and document the guard inside the prompt instructions.
9. Add structured metadata fields (idea id, campaign id) to AI outputs and confirm alignment with the analytics schema.
10. Extend `docs/specs/content_pipeline.md` with the tone-learning workflow addendum and link the update in feedback.
11. Validate `npm run test:ci` for the AI prompt regression suite and include the command output.
12. Refresh the RAG index inputs with updated knowledge base articles and capture the command output in feedback.
13. Publish the training data governance checklist within `docs/specs/metrics_snapshots_qa_ceo.md` and cross-link.
14. Create a rollback plan for misaligned model outputs that switches to macros and store the document in feedback.
15. Coordinate with Analytics to feed draft approval stats into the sampling guard proof and summarize alignment notes.
16. Write feedback to `feedback/ai-customer/2025-10-17.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `node`, `npm`, `npx prettier`, `rg`
- **Touched Directories:** `docs/directions/ai-customer.md`
- **Budget:** ≤ 30 minutes runtime, ≤ 4,000 tokens, ≤ 3 files modified or staged
- **Guardrails:** Maintain LLM prompt hygiene, ensure Chatwoot/Publer integrations respect HITL policies, and keep Supabase analytics schema immutable without approvals.

## Definition of Done

- [ ] Objective met with tone-aligned drafts, Chatwoot escalation data, Publer hooks, and Supabase learning loops documented.
- [ ] `npm run fmt` and `npm run lint` executed with logs archived in feedback.
- [ ] `npm run test:ci` completed for the AI customer prompt regression suite and evidence attached.
- [ ] `npm run scan` secrets check reported clean results.
- [ ] Related docs and runbooks updated for LLM prompt changes, Chatwoot workflows, Publer fallbacks, and Supabase pipelines.
- [ ] Feedback entry written to `feedback/ai-customer/2025-10-17.md` including dataset paths and approval notes.

## Risk & Rollback

- **Risk Level:** Medium — tone drift or Chatwoot severity gaps could misalign customer experience and CEO messaging.
- **Rollback Plan:** Revert prompt updates, disable Publer automation, and fall back to Support macros via `git checkout` before staging plus reloading Supabase defaults.
- **Monitoring:** Track Supabase analytics dashboards, Publer scheduling errors, Chatwoot escalation severity rates, and LLM confidence scores.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/ai-customer/2025-10-17.md`
- Specs / Runbooks: `docs/specs/content_pipeline.md`, `docs/specs/approvals_schema.md`, `docs/specs/metrics_snapshots_qa_ceo.md`, `app/agents/config/agents.json`

## Change Log

- 2025-10-17: Version 3.0 – Template rewrite emphasizing CEO tone, Publer/Chatwoot integrations, and Supabase learning loops.
- 2025-10-16: Version 2.1 – AI assistant launch plan for support + CEO insights with HITL learning.
- 2025-10-15: Version 2.0 – OpenAI Agents SDK implementation across customer and CEO agents.
- 2025-10-15: Version 1.0 – Initial direction awaiting integration foundation.
