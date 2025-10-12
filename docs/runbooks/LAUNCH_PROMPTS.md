# Launch Prompts - Agent & Manager Startup Commands

**Purpose**: Copy-paste startup commands for all agents and manager  
**Owner**: CEO  
**Last Updated**: 2025-10-13

---

## 📁 CRITICAL FILE PATHS

### Manager Files:
```
Startup:  ~/HotDash/hot-dash/docs/runbooks/manager_startup_checklist.md
Shutdown: ~/HotDash/hot-dash/docs/runbooks/manager_shutdown_checklist.md
```

### Agent Files:
```
Startup:  ~/HotDash/hot-dash/docs/runbooks/agent_startup_checklist.md
Shutdown: ~/HotDash/hot-dash/docs/runbooks/agent_shutdown_checklist.md
```

### Workspace Path:
```
~/HotDash/hot-dash/
/home/justin/HotDash/hot-dash/
```

**All startup files contain `cd ~/HotDash/hot-dash` as Step 1** ✅

---

## 🎯 MANAGER LAUNCH PROMPT

### Full Startup:
```
You are the MANAGER agent. Read ~/HotDash/hot-dash/docs/runbooks/manager_startup_checklist.md and execute completely as the manager.
```

### Quick Restart (If Already Oriented):
```
Manager, you've restarted. Execute your startup checklist: ~/HotDash/hot-dash/docs/runbooks/manager_startup_checklist.md
```

---

## 🎯 AGENT LAUNCH PROMPTS (By Agent)

**Format**: `You are <agent>, read this startup document and execute as <agent>`

### Core Development Team:

**Engineer**:
```
You are engineer, read ~/HotDash/hot-dash/docs/runbooks/agent_startup_checklist.md and execute as engineer
```

**QA**:
```
You are qa, read ~/HotDash/hot-dash/docs/runbooks/agent_startup_checklist.md and execute as qa
```

**Data**:
```
You are data, read ~/HotDash/hot-dash/docs/runbooks/agent_startup_checklist.md and execute as data
```

---

### Operations Team:

**Deployment**:
```
You are deployment, read ~/HotDash/hot-dash/docs/runbooks/agent_startup_checklist.md and execute as deployment
```

**Reliability**:
```
You are reliability, read ~/HotDash/hot-dash/docs/runbooks/agent_startup_checklist.md and execute as reliability
```

**Integrations**:
```
You are integrations, read ~/HotDash/hot-dash/docs/runbooks/agent_startup_checklist.md and execute as integrations
```

---

### Product & Design Team:

**Designer**:
```
You are designer, read ~/HotDash/hot-dash/docs/runbooks/agent_startup_checklist.md and execute as designer
```

**Product**:
```
You are product, read ~/HotDash/hot-dash/docs/runbooks/agent_startup_checklist.md and execute as product
```

---

### Support & Enablement:

**AI**:
```
You are ai, read ~/HotDash/hot-dash/docs/runbooks/agent_startup_checklist.md and execute as ai
```

**Chatwoot**:
```
You are chatwoot, read ~/HotDash/hot-dash/docs/runbooks/agent_startup_checklist.md and execute as chatwoot
```

**Enablement**:
```
You are enablement, read ~/HotDash/hot-dash/docs/runbooks/agent_startup_checklist.md and execute as enablement
```

**Support**:
```
You are support, read ~/HotDash/hot-dash/docs/runbooks/agent_startup_checklist.md and execute as support
```

---

### Marketing & Compliance:

**Marketing**:
```
You are marketing, read ~/HotDash/hot-dash/docs/runbooks/agent_startup_checklist.md and execute as marketing
```

**Compliance**:
```
You are compliance, read ~/HotDash/hot-dash/docs/runbooks/agent_startup_checklist.md and execute as compliance
```

**Localization**:
```
You are localization, read ~/HotDash/hot-dash/docs/runbooks/agent_startup_checklist.md and execute as localization
```

---

### Helper Agents:

**Engineer-Helper**:
```
You are engineer-helper, read ~/HotDash/hot-dash/docs/runbooks/agent_startup_checklist.md and execute as engineer-helper
```

**QA-Helper**:
```
You are qa-helper, read ~/HotDash/hot-dash/docs/runbooks/agent_startup_checklist.md and execute as qa-helper
```

---

### Maintenance:

**Git-Cleanup**:
```
You are git-cleanup, read ~/HotDash/hot-dash/docs/runbooks/agent_startup_checklist.md and execute as git-cleanup
```

---

## 🔄 QUICK UPDATE PROMPTS (Agent Already Oriented)

**When you've updated direction files and agent already running**:

```
Manager has provided updated direction, execute
```

**What this does**:
- Agent skips to Step 3 of startup checklist
- Reads `docs/directions/<agent>.md` (START HERE NOW section)
- Executes assigned task immediately
- No full startup needed

---

## 🛑 SHUTDOWN PROMPTS

### Manager Shutdown:
```
Execute your shutdown checklist completely: ~/HotDash/hot-dash/docs/runbooks/manager_shutdown_checklist.md
```

### Agent Shutdown:
```
Provide manager feedback
```

**What this does**:
- Agent opens `~/HotDash/hot-dash/docs/runbooks/agent_shutdown_checklist.md`
- Follows Steps 5-6 (Log Session End + Performance Review)
- Writes to `feedback/<agent>.md` ONLY

---

## 📋 STARTUP CHECKLIST VERIFICATION

Both agent and manager startup checklists contain:

### Step 1 (Navigate):
```bash
cd ~/HotDash/hot-dash
pwd  # Verify correct location
```

**Verified**: ✅ All startup files navigate to workspace first

---

## 🎯 RECOMMENDED AGENT STARTUP ORDER

### Phase 1: Core Blockers (Start These First)
1. Engineer (fixing build + RLS)
2. Data (fixing RLS security)
3. QA (ready to test when build fixed)

### Phase 2: Support Team (Start When Phase 1 Working)
4. Deployment (preparing production)
5. Reliability (verifying RLS)
6. Engineer-Helper (standby for Engineer)

### Phase 3: Design & Integration (Start When UI Ready)
7. Designer (reviewing UI when built)
8. Integrations (monitoring MCP health)
9. QA-Helper (standby for QA)

### Phase 4: Paused (Don't Start Yet)
10-18. AI, Chatwoot, Enablement, Support, Marketing, Product, Compliance, Localization, Git-Cleanup
- All have clear "PAUSED" status in direction files
- Will notify when ready to activate

---

## 🚨 IMPORTANT NOTES

### DO NOT:
❌ Point agents directly to direction files (`docs/directions/<agent>.md`)
❌ Say "You are engineer, execute" without the startup document reference
❌ Skip the startup checklist for first launch

### DO:
✅ Always reference the startup checklist document path
✅ Let agents replace `<your-agent>` with their actual name
✅ Use "Quick Update" prompt only when agent already oriented
✅ Use shutdown prompts to get clean feedback

---

## 📊 QUICK REFERENCE

| Scenario | Prompt |
|----------|--------|
| Manager First Start | `You are the MANAGER agent. Read ~/HotDash/hot-dash/docs/runbooks/manager_startup_checklist.md and execute completely as the manager.` |
| Agent First Start | `You are <agent>, read ~/HotDash/hot-dash/docs/runbooks/agent_startup_checklist.md and execute as <agent>` |
| Quick Update | `Manager has provided updated direction, execute` |
| Agent Shutdown | `Provide manager feedback` |
| Manager Shutdown | `Execute your shutdown checklist completely: ~/HotDash/hot-dash/docs/runbooks/manager_shutdown_checklist.md` |

---

## 🔍 FILE LOCATIONS SUMMARY

```
Workspace:              ~/HotDash/hot-dash/

Manager Startup:        docs/runbooks/manager_startup_checklist.md
Manager Shutdown:       docs/runbooks/manager_shutdown_checklist.md
Manager Directions:     docs/directions/manager.md
Manager Feedback:       feedback/manager.md

Agent Startup:          docs/runbooks/agent_startup_checklist.md
Agent Shutdown:         docs/runbooks/agent_shutdown_checklist.md
Agent Directions:       docs/directions/<agent>.md
Agent Feedback:         feedback/<agent>.md

North Star:             docs/NORTH_STAR.md
Git Protocol:           docs/git_protocol.md
Direction Governance:   docs/directions/README.md
```

---

**Last Updated**: 2025-10-13  
**Maintained By**: Manager  
**Protected By**: CODEOWNERS (requires @Jgorzitza approval)

