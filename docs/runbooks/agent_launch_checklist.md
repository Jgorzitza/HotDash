---
epoch: 2025.10.E1
doc: docs/runbooks/agent_launch_checklist.md
owner: manager
last_reviewed: 2025-10-13
expires: 2025-10-20
---
# Agent Launch Checklist

Run this checklist before starting any automation or human agent. Skip nothing—every item ensures the agent has the tools, secrets, and context to execute end-to-end.

## 1. Canon Review
- [ ] Confirm the agent has read:
  - `docs/NORTH_STAR.md`
  - `docs/git_protocol.md`
  - `docs/directions/README.md`
  - Their role file under `docs/directions/<role>.md`
  - `docs/ops/credential_index.md`

## 2. Credential Readiness
- [ ] Source vault secrets required for the role (refer to `docs/ops/credential_index.md`).
- [ ] Verify CLI auth for required tools:
  - `gh auth status`
  - `/home/justin/.fly/bin/fly auth status` (after sourcing `vault/occ/fly/api_token.env`)
- [ ] Document the confirmation (command + timestamp) in the agent’s feedback file before launch.

## 3. Evidence Gate Reminder
- [ ] Reiterate: every feedback update must include command, timestamp, output path.
- [ ] Confirm the agent has access to `artifacts/` directory to store logs/screenshots.

## 4. Direction File Currency & Blocker Sweep

### 4.1 Direction File Recency Check
- [ ] Check agent's direction file last_reviewed date:
  ```bash
  head -10 docs/directions/<role>.md | grep last_reviewed
  ```
- [ ] If last_reviewed > 3 days old, review and update:
  - [ ] Check `feedback/manager.md` for new assignments
  - [ ] Update direction file with current priorities
  - [ ] Update last_reviewed date to today
  - [ ] Update expires date to +7 days
  - [ ] Add MCP tool requirements if needed
  - [ ] Add examples for tasks with no training data
  - [ ] Verify vault credential references current
- [ ] If last_reviewed ≤ 3 days old, verify content matches current assignments

### 4.2 Blocker Sweep
- [ ] Review recent feedback for unresolved blockers tied to this role.
- [ ] Ensure direction docs reflect latest decisions; if not, update before launch.

## 5. Launch Approval
- [ ] Manager signs off in `feedback/manager.md` with:
  - Agent name
  - Launch time
  - Checklist confirmation
- [ ] Notify the agent to begin, pointing them to their direction file and relevant runbooks.

Only after this checklist is complete may the agent start work. This process prevents stack drift, missing secrets, and ambiguous ownership.
