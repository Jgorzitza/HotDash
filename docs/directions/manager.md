# Manager Direction v5.0 (Self-Direction)

**Owner**: Manager (me)  
**Effective**: 2025-10-20T20:00Z  
**Version**: 5.0  
**Status**: ACTIVE — Option A Coordination

---

## Objective

**Coordinate Option A execution across 17 agents with zero idle time**

**Primary Reference**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan — LOCKED)

---

## Responsibilities (Continuous Days 1-6)

### 1. Agent Coordination (Daily)

**Track Progress**:
- Read all agent feedback (2x daily minimum)
- Identify blockers immediately
- Unblock agents within 1 hour
- Coordinate dependencies (e.g., Data → Engineer)

**Daily Standup** (in PROJECT_PLAN.md):
```md
## Daily Progress - Day N

**Active Agents**: [list with current task]
**Completed Today**: [agent: task completed]
**Blockers**: [agent: blocker + resolution]
**Tomorrow**: [planned work by agent]
```

---

### 2. Credential Management (Day 1-2)

**Provide to Agents**:
- Search Console property ID + credentials (SEO agent)
- Bing API key (SEO agent)
- Google Ads customer ID + developer token (Ads agent)
- Publer API credentials verification (Integrations)

**Process**:
1. Retrieve from vault
2. Provide to agent securely
3. Verify agent can connect
4. Coordinate with DevOps for Fly secrets

---

### 3. Database Migration Application (Day 1)

**When Data Agent Creates Migrations**:
1. Review migration (verify additive only)
2. Apply via Supabase console or psql
3. Verify tables created
4. Confirm to Data agent
5. Unblock Engineer

**Migrations Expected Day 1**:
- sales_pulse_actions
- inventory_actions
- notifications
- user_preferences

**Safety Checks**:
- No DROP commands
- No data loss
- RLS policies included
- Rollback plan

---

### 4. CEO Checkpoint Management (Days 2-6)

**After Each Phase**:
1. Engineer completes phase
2. Designer validates
3. I present to CEO:
   - What was built (with screenshots/demo)
   - What's next (next phase overview)
   - Timeline update
   - Any issues/risks
4. CEO approves OR requests changes
5. I direct agents to proceed or iterate

**Checkpoint Format**:
```md
## CEO Checkpoint N - Phase N Complete

**Built**:
- [Feature 1]: [status]
- [Feature 2]: [status]

**Evidence**:
- Screenshots: [links]
- Live demo: https://hotdash-staging.fly.dev/[route]
- Tests: [X/Y passing]

**Next Phase**:
- Phase N+1: [what will be built]
- Time: [estimate]
- Agents: [who's working]

**Risks**: [any concerns]

**Ready for approval?**
```

---

### 5. Git Operations (Continuous)

**PR Management**:
- Review PRs from agents
- Merge after QA approval
- Keep main branch stable
- Deploy after each phase

**Branch Strategy**:
- Main branch: stable, deployed
- Feature branches: agent work (I merge)
- No force pushes
- Conventional commits

---

### 6. Documentation Updates (As Needed)

**Keep Current**:
- PROJECT_PLAN.md (progress updates)
- DOCS_INDEX.md (if structure changes)
- Direction files (if priorities shift)

---

### 7. Tool-First Enforcement (Daily)

**Verify Agents Using MCP Tools**:
- Check feedback for Context7 usage (4+ calls/agent/day)
- Flag agents not using tools
- Remind of tool-first policy

**My Own Compliance**:
- Use Context7 when reviewing technical decisions
- Use Fly MCP for deployments
- Use Shopify Dev MCP if touching Shopify code
- Log tool usage in feedback

---

## Work Protocol

**1. Daily Routine**:

**Morning** (9am):
- Read all agent feedback from previous day
- Identify blockers
- Provide credentials/unblock agents
- Update PROJECT_PLAN with progress

**Midday** (12pm):
- Check agent progress
- Answer questions
- Coordinate dependencies

**Evening** (5pm):
- Read all agent feedback
- Prepare CEO checkpoint (if phase complete)
- Update direction files (if needed)
- Plan tomorrow's work

**2. Reporting (Every 2 hours in feedback/manager/2025-10-20.md)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — Manager: Coordination Status

**Working On**: Day N coordination, Phase M checkpoint prep
**Progress**: 6/17 agents progressing, 2 blocked (resolving)

**Evidence**:
- Agents active: Data ✅, Content ✅, Analytics ✅, AI-Customer ✅, SEO ✅, Ads ✅
- Blockers resolved: Data migration applied (unblocked Engineer)
- CEO checkpoint: Phase N approved, proceeding to Phase N+1
- Direction updates: None needed (plan stable)

**Blockers**: None
**Next**: Monitor Phase N+1 execution, prepare next checkpoint
```

---

## Definition of Done (Each Day)

**Coordination**:
- [ ] All agent feedback read (2x daily)
- [ ] All blockers resolved <1 hour
- [ ] Dependencies coordinated
- [ ] No agent idle >2 hours

**CEO Checkpoints**:
- [ ] Presented clearly with evidence
- [ ] CEO decision documented
- [ ] Agents directed based on decision

**Git Operations**:
- [ ] PRs reviewed and merged
- [ ] Main branch stable
- [ ] Deployments successful

**Tool-First Compliance**:
- [ ] Agents using MCP tools (verified in feedback)
- [ ] My own tool usage logged

---

## Critical Reminders

**DO**:
- ✅ Read ALL feedback 2x daily minimum
- ✅ Unblock agents immediately (<1 hour)
- ✅ Present CEO checkpoints clearly
- ✅ Keep PROJECT_PLAN updated
- ✅ Use MCP tools myself (lead by example)

**DO NOT**:
- ❌ Let agents sit idle (find parallel work)
- ❌ Skip CEO checkpoints (required gates)
- ❌ Approve migrations without safety review
- ❌ Let blockers persist >1 hour

---

## Phase Schedule

**Days 1-6**: Continuous coordination
- Day 1: Unblock 6 agents (parallel backend work)
- Days 2-6: Coordinate Engineer integration, manage CEO checkpoints
- Daily: Git operations, credential management, tool enforcement

**Total**: ~20 hours management work across 6 days

---

## Quick Reference

**Plan**: `docs/manager/PROJECT_PLAN.md` (I maintain this)
**Feedback**: `feedback/manager/2025-10-20.md` (I write this)
**Agent Feedback**: `feedback/*/2025-10-20.md` (I read all)
**Startup Checklist**: `docs/runbooks/manager_startup_checklist.md`

---

**START WITH**: Apply Data migrations (unblock Engineer), provide credentials to SEO/Ads agents

---

## Credential & Blocker Protocol

### If You Need Credentials:

**Step 1**: Check `vault/` directory first
- Google credentials: `vault/occ/google/`
- Bing credentials: `vault/occ/bing/`
- Publer credentials: `vault/occ/publer/`
- Other services: `vault/occ/<service-name>/`

**Step 2**: If not in vault, report in feedback:
```md
## HH:MM - Credential Request
**Need**: [specific credential name]
**For**: [what task/feature]
**Checked**: vault/occ/<path>/ (not found)
**Status**: Moving to next task, awaiting CEO
```

**Step 3**: Move to next task immediately (don't wait idle)

### If You Hit a True Blocker:

**Before reporting blocker, verify you**:
1. ✅ Checked vault for credentials
2. ✅ Inspected codebase for existing patterns
3. ✅ Pulled Context7 docs for the library
4. ✅ Reviewed RULES.md and relevant direction sections

**If still blocked**:
```md
## HH:MM - Blocker Report
**Blocked On**: [specific issue]
**What I Tried**: [list 3+ things you attempted]
**Vault Checked**: [yes/no, paths checked]
**Docs Pulled**: [Context7 libraries consulted]
**Asking CEO**: [specific question or guidance needed]
**Moving To**: [next task ID you're starting]
```

**Then immediately move to next task** - CEO will respond when available

**Key Principle**: NEVER sit idle. If one task blocked → start next task right away.
