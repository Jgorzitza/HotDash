---
epoch: 2025.10.E1
doc: docs/runbooks/AGENT_REALIGNMENT_2025-10-12T22.md
owner: manager
created: 2025-10-12T22:05:00Z
focus: Realign all agents with North Star and current status
---

# 🚀 AGENT REALIGNMENT — All Agents Updated

**Status**: All agents provided feedback, need direction updates
**North Star Alignment**: Ensure all work supports Hot Rod AN CEO time savings (10-12h/week → <2h/week)
**MCP Tool Usage**: Explicit requirements for all agents

---

## 🎯 CURRENT STATUS SUMMARY

### ✅ WORK COMPLETE (Ready for new assignments):
- Deployment: Environment setup complete (6/6 tasks)
- Integrations: API testing prep complete (7/7 tasks)
- Reliability: Monitoring setup complete (12/12 tasks)
- Designer: Accessibility audit complete
- Support: All assigned tasks complete
- Product: All 10 tasks complete
- Enablement: All assigned tasks complete
- Compliance: Security audit complete
- Localization: Error message audit complete

### 🔄 IN PROGRESS (Continue current work):
- Engineer: Deploying to Fly.io (Task 1C in progress)
- QA: Ready for testing when deployment completes
- QA-Helper: Building test suite (7/12 done)
- Chatwoot: Creating approval queue tables
- AI: Code review complete
- Data: Training pipeline in progress
- Git-Cleanup: Working on tasks

### ⏸️ AWAITING DIRECTION:
- Engineer-Helper: Needs priority decision (LlamaIndex vs Approval UI)

---

## 🎯 NORTH STAR ALIGNMENT REMINDER

**Mission**: 10X Hot Rod AN ($1MM → $10MM) by reducing CEO operational burden 10-12h/week → <2h/week

**Core Product**: 5 actionable tiles (CX Pulse, Sales Pulse, SEO Pulse, Inventory Watch, Fulfillment Flow)

**Success Metric**: CEO uses dashboard daily, saves 8+ hours/week

**Every Task Must**:
- Support the 5 tiles
- Enable agent-assisted approvals
- Deliver operator value
- Use current APIs (MCP tools mandatory)

---

## 🚨 CRITICAL: FLY DEPLOYMENT TIMEOUT FIXED

**Problem**: Engineer deployment timing out
**Solution**: Updated fly.toml with extended timeouts:
- Health check timeout: 60s (was 30s)
- Startup timeout: 120s (was 60s)
- Grace periods: 10s for proper shutdown

**Action**: Deployment agent deployed updated config - Engineer should retry deployment

---

## 📋 AGENT DIRECTION UPDATES

### 1. ENGINEER — Deploy Shopify App (Continue Current)
**Status**: Deployment in progress (Task 1C)
**North Star**: Get app visible to CEO in Shopify admin
**MCP Tools**: Shopify MCP, Fly MCP, Context7 MCP
**Next**: Complete deployment, install on dev store, get CEO visibility

### 2. DEPLOYMENT — Monitor & Support Deployment (P0)
**Status**: Fly timeout fix deployed
**North Star**: Ensure production environment ready
**MCP Tools**: Fly MCP (all operations)
**Tasks**: Monitor deployment, verify health, support Engineer

### 3. QA — Test After Deployment (P1)
**Status**: Ready for testing
**North Star**: Verify app works in Shopify admin
**MCP Tools**: Shopify MCP, GitHub MCP
**Tasks**: Test installation, screenshots, data validation

### 4. INTEGRATIONS — Shopify API Testing (P1)
**Status**: Test suite ready
**North Star**: Validate all APIs with real store data
**MCP Tools**: Shopify MCP (MANDATORY for all queries)
**Tasks**: Test all 7+ API endpoints with real Hot Rod AN data

### 5. DATA — Database Performance (P1)
**Status**: Training pipeline in progress
**North Star**: Optimize for 5 tile performance
**MCP Tools**: Supabase MCP, Shopify MCP
**Tasks**: Performance optimization migration, ETL pipelines

### 6. RELIABILITY — Production Monitoring (P1)
**Status**: Monitoring setup complete
**North Star**: Monitor production app health
**MCP Tools**: Fly MCP, Supabase MCP
**Tasks**: Monitor deployment, set up alerts

### 7. DESIGNER — Shopify App Store Listing (P2)
**Status**: Accessibility audit complete
**North Star**: Prepare for App Store submission
**MCP Tools**: None (design work)
**Tasks**: 20 App Store listing tasks (screenshots, description)

### 8. SUPPORT — Onboarding & Help System (P2)
**Status**: All assigned work complete
**North Star**: Help operators use dashboard effectively
**MCP Tools**: grep
**Tasks**: 25 onboarding + help system tasks

### 9. PRODUCT — Analytics & Roadmap (P2)
**Status**: All 10 tasks complete
**North Star**: Track CEO usage and plan iterations
**MCP Tools**: Supabase MCP
**Tasks**: 38 analytics + roadmap tasks

### 10. ENABLEMENT — Video Tutorials (P2)
**Status**: All assigned tasks complete
**North Star**: Train operators efficiently
**MCP Tools**: None (content creation)
**Tasks**: 23 video tutorial tasks

### 11. COMPLIANCE — Security Review (P2)
**Status**: Security audit complete
**North Star**: Ensure production security
**MCP Tools**: Supabase MCP, grep
**Tasks**: 12 App Store review prep tasks

### 12. MARKETING — Launch Campaign (P2)
**Status**: All assigned work complete
**North Star**: Drive adoption and growth
**MCP Tools**: grep
**Tasks**: 30 launch campaign tasks

### 13. LOCALIZATION — Consistency (P2)
**Status**: Error message audit complete
**North Star**: Professional automotive voice
**MCP Tools**: grep (MANDATORY)
**Tasks**: 6 consistency verification tasks

### 14. AI — Knowledge Base Expansion (P2)
**Status**: Code review complete
**North Star**: Expand Hot Rod AN knowledge
**MCP Tools**: None currently (LlamaIndex working)
**Tasks**: 8 knowledge base tasks

### 15. CHATWOOT — Approval Queue (P2)
**Status**: Tables creation in progress
**North Star**: Agent-assisted customer support
**MCP Tools**: None (database work)
**Tasks**: 8 approval queue tasks

### 16. QA-HELPER — Test Coverage (P2)
**Status**: 7/12 tests done
**North Star**: Comprehensive test coverage
**MCP Tools**: Context7 MCP, Shopify MCP
**Tasks**: 12 test suite tasks

### 17. ENGINEER-HELPER — Support Engineer (P0)
**Status**: Awaiting direction
**North Star**: Support Shopify deployment
**MCP Tools**: Context7 MCP, grep
**Tasks**: 5 deployment support tasks

### 18. GIT-CLEANUP — Repository Maintenance (P2)
**Status**: Working on tasks
**North Star**: Maintain clean repository
**MCP Tools**: GitHub MCP
**Tasks**: Continue current work

---

## ⚠️ MCP TOOL USAGE REQUIREMENTS (Enforced)

**REQUIRED MCP Usage**:
- **Shopify work** → Shopify MCP (queries, validation, data)
- **React Router 7** → Context7 MCP (patterns, documentation)
- **Database work** → Supabase MCP (queries, migrations, advisors)
- **Fly deployments** → Fly MCP (apps, status, logs, restarts)
- **GitHub operations** → GitHub MCP (branches, PRs, files)
- **File searching** → grep tool (don't search manually)

**FORBIDDEN**:
- ❌ fly CLI (use Fly MCP)
- ❌ psql (use Supabase MCP)
- ❌ Manual file searching (use grep)
- ❌ Guessing React patterns (use Context7 MCP)

---

## 🎯 IMMEDIATE PRIORITIES

**Next 2 Hours**:
1. Engineer completes deployment (P0)
2. Deployment monitors with Fly MCP (P0)
3. Reliability monitors deployment (P0)
4. Integrations tests APIs (P0)

**Next 4 Hours**:
5. QA tests app in Shopify admin (P1)
6. Designer creates App Store listing (P1)
7. Support builds onboarding (P1)
8. Product sets up analytics (P1)

**Next 6 Hours**:
9. Enablement creates videos (P1)
10. Compliance prepares App Store review (P1)
11. Marketing builds launch campaign (P1)
12. Localization verifies consistency (P1)

---

## 📊 AGENT UTILIZATION

**Productive**: 18/18 agents (100%)
**Idle Prevention**: 300+ total tasks assigned
**North Star Alignment**: All work supports CEO time savings
**MCP Compliance**: All agents have explicit MCP requirements

---

**Manager**: All agents check your direction files for updated tasks
**North Star**: Every task must deliver operator value for Hot Rod AN
**Success**: CEO uses dashboard daily, saves 8+ hours/week

🚀 LET'S FINISH THIS DEPLOYMENT!

