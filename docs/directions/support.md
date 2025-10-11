---
epoch: 2025.10.E1
doc: docs/directions/support.md
owner: manager
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-17
---
# Support — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. Support must not produce or edit direction documents; submit evidence-backed change requests via manager.

## Local Execution Policy (Auto-Run)

You may run local, non-interactive commands and scripts without approval. Guardrails:

- Scope: local repo and local Supabase; no remote infra changes under auto-run. Status checks are fine.
- Non-interactive: disable pagers; avoid interactive prompts.
- Evidence: log timestamp, command, outputs in feedback/support.md; store under artifacts/support/.
- Secrets: load from vault/env; never print values.
- Tooling: npx supabase for local; git/gh with --no-pager; prefer rg else grep -nE.
- Retry: up to 2 attempts; then escalate with logs.

- Maintain playbooks for operator escalations; map each CX tile action to internal SOP and escalation ladder.
- Ensure Chatwoot templates stay current; review daily with AI/engineer and log updates in Memory (scope `ops`).
- Train support reps on dashboard workflows; capture Q&A and file tickets for confusing states.
- Gather operator feedback; funnel critical gaps into product backlog with evidence (screenshots, timestamps).
- Monitor integrations post-release; alert reliability if errors breach thresholds or SLAs slip.
- Stack guardrails: ensure every playbook references the canonical toolkit (`docs/directions/README.md#canonical-toolkit--secrets`)—Supabase backend, Chatwoot on Supabase, React Router 7, OpenAI/LlamaIndex posture; remove legacy tool references.
- For customer workflows, coordinate with docs/dev/storefront-mcp.md and consult docs/dev/webpixels-shopify.md before deploying tracking scripts.
- Keep feedback/support.md updated with incidents, resolution time, and follow-up tasks.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/support.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-10
Own each item to completion—do not wait for other teams to close loops. Log the command, artifact, or outreach (with timestamp) for every task in `feedback/support.md`, and follow up until blockers clear.

## Aligned Task List — 2025-10-11
- Rehearsal flow
  - Use RR7 + CLI v3 for Admin walkthroughs; no token capture. Keep operator job aids aligned.
- Gold replies
  - Coordinate with Data for webhook endpoint + schema; capture evidence of sample submission.
- Evidence
  - Log timestamp, commands, and artifacts in `feedback/support.md`.

1. **Chatwoot shared inbox** — Configure customer.support@hotrodan.com in Chatwoot (IMAP/SMTP or API). Update `docs/runbooks/cx_escalations.md` and `docs/runbooks/shopify_dry_run_checklist.md` with the flow, attach screenshots/logs, and confirm routing works end-to-end.
2. **Gold reply workflow** — Partner with Data to finalize the Supabase gold-reply schema. Document the approval checklist in `docs/runbooks/support_gold_replies.md` (new file), including how to flag responses, sanitize content, and submit to Supabase via webhook. Capture a sample approved reply.
3. **Webhook readiness** — Coordinate with Integrations-Chatwoot to expose the webhook endpoint. Verify you can send an approved reply payload and see it land in Supabase; record evidence plus follow-up steps for ongoing usage.
4. **Template refresh** — Audit existing Chatwoot templates/macros against the new LlamaIndex ingestion scope. Update or retire any references to Zoho or legacy tools, log diffs, and store curated examples for AI under `packages/memory/logs/ops/`.
5. **Operator enablement** — Refresh operator checklists and Q&A templates to reflect Chatwoot automation + manual override instructions. Align scheduling with Enablement/Marketing and ensure each outstanding question has an owner/date.
6. **Audit cadence** — Participate in Monday/Thursday stack compliance review with QA/manager, focusing on support tooling, email compliance, and chatbot oversight. Document findings in `feedback/support.md`.
