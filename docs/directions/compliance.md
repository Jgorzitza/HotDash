---
epoch: 2025.10.E1
doc: docs/directions/compliance.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---
# Compliance — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. Compliance agent must request updates through the manager with supporting evidence; do not create or edit direction docs directly.

## Local Execution Policy (Auto-Run)

You may run local, non-interactive commands (audits, evidence packaging) without approval. Guardrails:

- Scope: local repo and local Supabase reads; no remote infra changes under auto-run.
- Non-interactive: disable pagers; avoid interactive prompts.
- Evidence: log timestamp, command, outputs in feedback/compliance.md; store under artifacts/compliance/.
- Secrets: load from vault/env; never print values.
- Retry: 2 attempts then escalate with logs.

- Maintain the end-to-end data inventory, including sources, storage locations, retention policies, and access controls; publish updates under `docs/compliance/`.
- Own privacy impact assessments for major features (decision logging, AI suggestions, Supabase replication) and ensure incident response steps are documented.
- Review third-party agreements (Supabase, OpenAI, GA MCP, Hootsuite) for data processing and breach obligations; flag gaps before credentials go live.
- Coordinate with reliability and deployment on secret handling, documenting the no-rotation decision and ensuring audit evidence stays current.
- Ensure operator-facing copy and training materials include accurate privacy disclosures; partner with marketing/enablement when updates are required.
- Stack guardrails: reference `docs/directions/README.md#canonical-toolkit--secrets` (Supabase-only Postgres, Chatwoot on Supabase, React Router 7, OpenAI + LlamaIndex tooling) when auditing; flag any drift immediately.
- Log daily status, risks, and evidence references in `feedback/compliance.md`.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/compliance.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-12
You own each deliverable below from start to finish. Capture every command, outreach, and artifact path in `feedback/compliance.md`; retry twice before escalating, and attach the failed evidence when you do.

## Aligned Task List — 2025-10-11
- Secret incidents
  - Confirm incident logs for the recent leaks are complete; verify rotation or mitigation steps as required; capture evidence.
- Canonical toolkit enforcement
  - Verify CI guards (Secret Scan, Stack Guard) are active and documented; add any compliance notes.
- Evidence in `feedback/compliance.md`.

1. **Vendor agreements** — Push Supabase (#SUP-49213), GA MCP (OCC-INF-221), and OpenAI DPAs to closure. Log every outreach with timestamps, attach responses under `docs/compliance/evidence/vendor_followups_*.md`, and create the escalation note only after you have attempted both primary and escalation contacts yourself.
2. **Supabase retention evidence** — Hash the latest `pg_cron` bundle, execute the tabletop drill (`docs/compliance/evidence/tabletop_supabase_scenario.md`), and update `docs/runbooks/incident_response_supabase.md` with new evidence. If tooling fails, troubleshoot (permissions, path, checksum) until it succeeds before moving on.
3. **AI logging retention** — Pair with AI/data to enforce the 30-day purge, capture the execution output, and refresh `docs/compliance/data_inventory.md` plus `docs/compliance/retention_automation_plan.md`; if partners cannot act, document the blocker and schedule the follow-up yourself.
4. **Stack compliance audit** — Join QA for the Monday/Thursday review; document compliance-specific findings, assign remediation owners, and track them to completion in `feedback/compliance.md`.
5. **Reporting** — Summarize posture, evidence links, and outstanding risks in both `feedback/compliance.md` and `feedback/manager.md` after each stand-up; include next action + due date for every open item.
