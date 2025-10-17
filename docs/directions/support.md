# Support Direction

- **Owner:** Manager Sub-Agent
- **Effective:** 2025-10-17
- **Version:** 1.3

## Objective

Empower Support to run Chatwoot workflows, keep the knowledge base current, monitor alerts, and maintain feedback hygiene so launch operations stay evidence-driven and escalation-ready.

## Current Tasks

1. Document the Chatwoot escalation workflow for email, chat, and SMS in `docs/specs/support_pipeline.md`, capturing triggers, response targets, and escalation contacts.
2. Update the knowledge base article plan in `docs/specs/support_kb_pipeline.md` to reflect the new dashboard and idea pool features with owners and publishing cadence.
3. Create response macros aligned with the tone guide and upload them to `artifacts/support/` with naming conventions and usage notes.
4. Review Chatwoot health artifacts daily and log the results, issues, and remediation evidence in `feedback/support/2025-10-17.md`.
5. Coordinate with the AI Customer partner to refine tone adjustments and escalation rules, then document the agreed updates and share-outs.
6. Validate Publer-triggered support notifications (webhooks) end-to-end and record test evidence plus webhook payloads in `feedback/support/2025-10-17.md`.
7. Prepare the incident response playbook for Chatwoot outages, referencing the relevant DevOps runbooks and paging paths.
8. Build the customer feedback capture template tied to idea pool suggestions and store it within `docs/specs/support_pipeline.md`.
9. Audit PII handling across support tools, confirming compliance with privacy guardrails and logging findings plus mitigation steps.
10. Train the support workflow on idea approvals and product creation, capturing training notes, questions, and follow-ups.
11. Review support-facing analytics dashboards (CX tile and related views) and report anomalies or blockers to the manager with evidence.
12. Sync with Product on the launch communications schedule to confirm support readiness, noting dependencies and support messaging.
13. Perform a test conversation in Chatwoot verifying the macros, tone, and escalation path; attach the transcript to team artifacts.
14. Update the support section of `docs/runbooks/production_deployment.md` with the readiness checklist and handoff signals.
15. Prepare the post-launch support retrospective template focusing on volume, response times, sentiment, and actionable insights.
16. Write feedback to feedback/support/2025-10-17.md and clean stray md files.

## Constraints

- **Allowed Tools:** `bash`, `node`, `npm`, `npx prettier`, `rg`
- **Touched Directories:** `docs/directions/support.md`
- **Budget:** ≤ 30 minutes runtime, ≤ 4,000 tokens, ≤ 3 files modified or staged
- **Guardrails:** Limit edits to the support direction file; escalate missing decisions via `reports/manager/ESCALATION.md`; never commit secrets or vault contents.

## Definition of Done

- [ ] Objective satisfied with documented Chatwoot workflows, KB updates, alerting routines, and feedback hygiene.
- [ ] `npm run fmt`, `npm run lint`, `npm run test:ci`, and `npm run scan` completed with logs linked in the PR description.
- [ ] Supporting specs, runbooks, artifacts, transcripts, and webhook evidence updated as referenced in the task list.
- [ ] Feedback entry updated in `feedback/support/2025-10-17.md` with blockers and validation notes.

## Risk & Rollback

- **Risk Level:** Low — misalignment impacts customer experience but not platform stability.
- **Rollback Plan:** `git checkout -- docs/directions/support.md` prior to staging or revert PR if published.
- **Monitoring:** Track Chatwoot health dashboards, Publer notification logs, knowledge base freshness metrics, and feedback hygiene entries.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/support/2025-10-17.md`
- Specs: `docs/specs/support_pipeline.md`, `docs/specs/support_kb_pipeline.md`
- Runbooks: `docs/runbooks/production_deployment.md`, `docs/directions/manager-headless.md`
- Templates & Artifacts: `artifacts/support/`, `reports/manager/ESCALATION.md`

## Change Log

- 2025-10-17: Version 1.3 – Template rewrite with Chatwoot workflow ownership, KB plan updates, alerts, and feedback hygiene tasks.
- 2025-10-16: Version 1.2 – Support intelligence launch plan (KB ingest, RAG, triage).
- 2025-10-15: Version 1.1 – Support KB ingestion and Chatwoot design updates.
- 2025-10-15: Version 1.0 – Initial placeholder.
