# Direction: manager

> Location: `docs/directions/manager.md`
> Owner: manager (self)
> Version: 1.0
> Effective: 2025-10-15
> Related: `docs/NORTH_STAR.md`, `docs/OPERATING_MODEL.md`, `docs/manager/PROJECT_PLAN.md`

---

## 1) Purpose

Orchestrate all agents, maintain governance docs, enforce gates, and ensure delivery aligns with NORTH_STAR.

## 2) Scope

* **In:** NORTH_STAR, RULES, OPERATING_MODEL, PROJECT_PLAN, agent directions, Issue creation, PR reviews, gate enforcement
* **Out:** Direct code implementation (delegate to agents)

## 3) Daily Rituals

### Startup (docs/runbooks/manager_startup_checklist.md)
- [ ] Align to Star (review NORTH_STAR, RULES, OPERATING_MODEL)
- [ ] Repo & CI Guardrails (Docs Policy, Gitleaks, AI Config)
- [ ] Tools & MCP Health
- [ ] Project status review (feedback sweep, Issues/PRs, blockers)
- [ ] Update agent directions
- [ ] Drift Guard (docs policy, planning TTL, stray files)

### Shutdown (docs/runbooks/manager_shutdown_checklist.md)
- [ ] Review agent feedback logs
- [ ] Verify CI green on main
- [ ] Update PROJECT_PLAN with progress
- [ ] Roll learnings into RULES/directions
- [ ] Planning TTL sweep

## 4) Today's Objective (2025-10-15)

**Priority:** P0 - Project Launch
**Deadline:** 2025-10-17 (2 days)

### Completed:
- ✅ Manager startup checklist executed
- ✅ Security incident resolved (Gitleaks sanitization)
- ✅ Augment Code rules established
- ✅ Agent directions populated

### In Progress:
1. **Create GitHub Issues** - For all agent tasks
   - Dashboard shell (engineer)
   - Approvals Drawer (engineer)
   - Shopify adapter (integrations)
   - Supabase RPC (integrations)
   - Approvals schema (data)
   - Audit schema (data)
   - CI health check (devops)
   - Staging deployment (devops)
   - Acceptance criteria (qa)
   - Test plan template (qa)

2. **Monitor Agent Progress** - Daily feedback review
3. **Gate Enforcement** - Review PRs for DoD compliance
4. **Blocker Resolution** - Unblock agents within 1 hour

### Constraints:
- All Issues must have: Agent, DoD, Acceptance criteria, Allowed paths
- All PRs must pass: Docs Policy, Danger, Gitleaks, AI Config
- No production deployments until staging validated
- HITL enforced for ai-customer

### Next Steps:
1. Create GitHub Issues for all agent tasks (use Task template)
2. Provide staging credentials to integrations and data agents
3. Monitor agent feedback logs daily
4. Review PRs and enforce gates
5. Update PROJECT_PLAN with milestone progress

---

## Changelog

* 1.0 (2025-10-15) — Initial direction: Project launch coordination
