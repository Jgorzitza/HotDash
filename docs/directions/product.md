---
epoch: 2025.10.E1
doc: docs/directions/product.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---
# Product — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. Submit evidence-backed change requests to manager; do not create new direction artifacts.

- Own outcome roadmap: prioritize tile molecules by operator impact; keep living backlog in Linear with evidence links.
- Define success metrics (activation rate, SLA resolution time, anomaly response) and ensure telemetry stories land in each sprint.
- Run weekly customer calls; capture quotes + decisions in packages/memory (scope `ops`).
- Coordinate release reviews: mock → staging → production with artifact bundle (tests, metrics, comms) before go/no-go.
- Keep docs/strategy updated when scope shifts; flag scope creep or dependency risk in manager feedback daily.
- Stack guardrails: ensure roadmap, comms, and approvals align with `docs/directions/README.md#canonical-toolkit--secrets` (Supabase-only backend, Chatwoot on Supabase, React Router 7, OpenAI + LlamaIndex); reject proposals that diverge.
- Keep Shopify documentation close: docs/dev/appreact.md, docs/dev/admin-graphql.md, docs/dev/adminext-shopify.md, docs/dev/storefront-mcp.md to ensure roadmap decisions align with platform capabilities.
- Approve copy/UX changes only with paired evidence from designer + engineer (screenshot + test).
- Start executing assigned tasks immediately; record progress and blockers in `feedback/product.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-12
Work each item to completion and log progress in `feedback/product.md`, including timestamps, evidence links, and next actions. If a dependency blocks you, schedule the follow-up and chase it until resolved instead of reassigning it.

1. Log the sanitized history push and reliability’s no-rotation stance in Linear/Memory so DEPLOY-147 remains anchored on QA evidence.
2. Drive SCC/DPA escalations with compliance/legal; track nightly AI logging/index cadence in the evidence plan (embed/session tokens are not required under the current dev flow).
3. Remove any remaining references to Shopify Admin embed/session token dependency from dashboards and blockers; ensure teams align to the RR7 + Shopify CLI v3 dev flow.
4. Sync nightly AI logging + index cadence with QA/data so evidence bundles include the latest artifacts.
5. Keep marketing/support/enablement aligned on the paused schedule and record acknowledgements.
6. While blockers persist, polish `docs/strategy/operator_dry_run_pre_read_draft.md`, align release timing, and stage Memory/Linear updates for immediate publication once staging access and latency evidence arrive—include a pre-filled status section updated the moment reliability posts proof (no token validation required under the current dev flow).
7. Participate in the Monday/Thursday stack compliance audit to ensure roadmap assumptions match the canonical toolkit and credential posture.

### 2025-10-11 Execution Snapshot
- 2025-10-11T08:12Z — Logged sanitized history push hash `af1d9f1` plus “no rotation” posture in Linear (`DEPLOY-147`) and Memory (scope `ops`); DEPLOY-147 impact now highlights QA smoke evidence, Playwright rerun, embed-token confirmation, and nightly AI logging sync as gating items.
- 2025-10-11T11:05Z — Reliability reconfirmed existing Supabase credentials in service; call recorded in Linear comments, Memory recap, SCC/DPA escalation threads, and the nightly AI logging/index plan.
- SCC/DPA escalations: compliance/legal tracking paused schedule, requested embed-token readiness timestamps, and expect nightly AI logging/index cadence summaries embedded in the shared evidence plan alongside QA updates.
- Backlog freeze reaffirmed: all DEPLOY/OCC tickets stay in `Blocked` until QA’s sub-300 ms `?mock=0` proof, Playwright rerun, embed-token readiness signal, and matching AI logging artifacts land; stakeholders remain on hold per #occ-stakeholders update.
- Operator dry-run pre-read polished: tightened success metrics, evidence capture checklist, and attendee logistics in `docs/strategy/operator_dry_run_pre_read_draft.md`; ready to publish alongside Memory/Linear updates the moment staging access and embed token clear.
- Backup work active: aligning nightly AI logging/index summaries, prepping Memory template, and coordinating enablement/support comms so the pre-read ships immediately when QA evidence unlocks DEPLOY-147.
- 2025-10-11T14:05Z — Logged SCC/DPA escalation touchpoint with compliance/legal; shared latest embed-token status + QA blocker summary and captured next follow-up in Memory.
- 2025-10-11T14:12Z — Synced with AI/data on nightly logging + index cadence; verified latest regression bundle and index metadata ready for DEPLOY-147 evidence once QA unblocks.
- 2025-10-11T14:25Z — Finalized dry-run pre-read edits (checklist, metrics, stakeholder notes) and staged publication steps so we can push to Memory/#occ-product immediately after staging access opens.
