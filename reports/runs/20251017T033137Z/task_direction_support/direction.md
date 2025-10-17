# task_direction_support — Direction

- **Owner:** Manager Sub-Agent
- **Effective:** 2025-10-17
- **Version:** 1.0

## Objective
Rewrite `docs/directions/support.md` with the template so Support manages Chatwoot workflows, knowledge base updates, alerts, and feedback hygiene.

## Current Tasks
1. Replace the file using `docs/directions/agenttemplate.md`.
2. Use this task list (1–16):
   1. Document Chatwoot escalation workflow for email/chat/SMS in `docs/specs/support_pipeline.md`.
   2. Update knowledge base article plan in `docs/specs/support_kb_pipeline.md` reflecting new dashboard + idea pool features.
   3. Create response macros aligned with tone guide; upload to `artifacts/support/`.
   4. Ensure Chatwoot health artifacts are reviewed daily; log results in feedback.
   5. Coordinate with AI Customer to provide tone adjustments and escalation rules; document outcomes.
   6. Validate Publer-triggered support notifications (webhooks) and log test evidence.
   7. Prepare incident response playbook for Chatwoot outages referencing DevOps runbooks.
   8. Build customer feedback capture template tied to idea pool suggestions; store in `docs/specs/support_pipeline.md`.
   9. Audit PII handling across support tools; confirm compliance with privacy guardrails.
   10. Train support workflow on idea approvals + product creation and capture training notes.
   11. Review analytics dashboards relevant to support (CX tile) and report anomalies.
   12. Sync with Product on launch comms schedule to ensure support readiness.
   13. Perform test conversation in Chatwoot verifying macros, tone, and escalation; attach transcript.
   14. Update support section of `docs/runbooks/production_deployment.md` with readiness checklist.
   15. Prepare post-launch support retrospective template focusing on volume, response times, and sentiment.
   16. Write feedback to `feedback/support/2025-10-17.md` and clean stray md files.
3. Populate Objective/Constraints/DoD/Risk/Links accordingly.
4. Add changelog entry for 2025-10-17.
5. Run `npx prettier --write docs/directions/support.md`.
6. Stage only `docs/directions/support.md`.
7. Note blockers in `feedback/manager/2025-10-17.md` if any.

## Constraints
- **Allowed Tools:** `bash`, `node`, `npm`, `npx prettier`, `rg`.
- **Touched Directories:** `docs/directions/support.md`.
- **Budget:** ≤ 30 minutes, ≤ 4,000 tokens, ≤ 3 files modified/staged.
- **Guardrails:** Edits limited to support direction file.

## Definition of Done
- [ ] Template applied with provided tasks.
- [ ] Prettier executed.
- [ ] Only `docs/directions/support.md` staged.
- [ ] Blockers logged if any.

## Risk & Rollback
- **Risk Level:** Low — support misalignment affects customer experience but not app stability.
- **Rollback Plan:** `git checkout -- docs/directions/support.md` before staging.
- **Monitoring:** Ensure tasks align with Chatwoot health, Publer workflows, and knowledge base updates.

## Links & References
- Template: `docs/directions/agenttemplate.md`
- Support specs: `docs/specs/support_pipeline.md`, `docs/specs/support_kb_pipeline.md`
- Feedback: `feedback/support/`
- Runbooks: `docs/runbooks/production_deployment.md`

## Change Log
- 2025-10-17: Version 1.0 — Template rewrite with support launch tasks.
