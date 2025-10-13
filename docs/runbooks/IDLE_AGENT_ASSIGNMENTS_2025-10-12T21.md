---
epoch: 2025.10.E1
doc: docs/runbooks/IDLE_AGENT_ASSIGNMENTS_2025-10-12T21.md
owner: manager
created: 2025-10-12T21:10:00Z
expires: 2025-10-13
---

# Idle Agent Work Assignments — Oct 12, 21:10 UTC

**Purpose**: Assign productive work to 12 idle agents  
**Priority**: All work aligned to launch readiness (Oct 13-15)  
**Requirement**: ALL agents must use MCP tools where applicable

---

## 🎯 P1 - URGENT WORK (Start Immediately)

### 1. QA Agent — Final Pre-Launch Validation (45-60 min)

**Task**: Complete final validation before production deployment

**Commands**:
```bash
cd ~/HotDash/hot-dash

# 1. Verify CI/CD with GitHub MCP (MANDATORY)
# Use mcp_github-official_list_commits to check build status
# DO NOT check manually

# 2. Run final E2E test suite
npm run test:e2e

# 3. Verify RLS with Supabase MCP (MANDATORY)
# Use mcp_supabase_get_advisors(type: "security")
# Confirm 0 ERROR-level issues

# 4. Manual approval queue test
npm run dev
# Test: /approvals route, approve/reject flow

# Evidence: CI status, E2E results, Supabase advisor output, manual test results
```

**MCP Tools Required**:
- ✅ GitHub MCP: mcp_github-official_list_commits
- ✅ Supabase MCP: mcp_supabase_get_advisors

**Deliverable**: Pre-launch validation report (sign-off required)

---

### 2. QA-Helper Agent — Test Coverage Quick Wins (2-3 hours)

**Task**: Implement Quick Wins from your 45-hour roadmap (+5-10% coverage)

**Commands**:
```bash
cd ~/HotDash/hot-dash

# 1. Test route loaders with Context7 MCP (MANDATORY)
# Use mcp_context7_get-library-docs for React Router 7 loader patterns
# DO NOT guess patterns from training data

# 2. Test action success/error paths
# Create tests for approval actions

# 3. Test service error handling with Shopify MCP
# Use mcp_shopify_introspect_graphql_schema for error types
# DO NOT rely on training data

# 4. Test utility edge cases
# Add tests for date utilities, string formatters

# Evidence: New test files, coverage increase (+5-10%)
```

**MCP Tools Required**:
- ✅ Context7 MCP: mcp_context7_get-library-docs (React Router 7 patterns)
- ✅ Shopify MCP: mcp_shopify_introspect_graphql_schema

**Deliverable**: 15-20 new tests, coverage increased by 5-10%

---

### 3. Data Agent — Database Performance Optimization (45-60 min)

**Task**: Create performance optimization migration based on Supabase advisor

**Commands**:
```bash
cd ~/HotDash/hot-dash

# 1. Get performance recommendations with Supabase MCP (MANDATORY)
# Use mcp_supabase_get_advisors(type: "performance")
# DO NOT use psql directly

# 2. Analyze query performance for 5 tiles
# Use Supabase MCP to check query plans

# 3. Create performance migration
# File: supabase/migrations/20251012_performance_indexes.sql
# Add indexes for: shop_domain, account_id, created_at

# 4. Verify improvement with Supabase MCP
# Re-run performance advisor

# Evidence: Advisor output before/after, migration file
```

**MCP Tools Required**:
- ✅ Supabase MCP: mcp_supabase_get_advisors(type: "performance")
- ✅ Supabase MCP: mcp_supabase_apply_migration

**Deliverable**: Performance optimization migration, reduced advisor warnings

---

### 4. Compliance Agent — Final Security Review (45-60 min)

**Task**: Complete final security checklist before launch

**Commands**:
```bash
cd ~/HotDash/hot-dash

# 1. Final RLS verification with Supabase MCP (MANDATORY)
# Use mcp_supabase_get_advisors(type: "security")
# Confirm 0 ERROR-level issues

# 2. Verify env var usage with grep
grep -r "process.env" app/ packages/ --include="*.ts"
# Confirm no hardcoded values

# 3. Check authentication with grep
grep -r "allowAnonymous\|skipAuth" app/ --include="*.ts"
# Confirm proper authentication

# 4. Create launch security checklist
# File: docs/runbooks/launch_security_checklist.md

# Evidence: Supabase advisor, grep results, security checklist
```

**MCP Tools Required**:
- ✅ Supabase MCP: mcp_supabase_get_advisors(type: "security")
- ✅ grep: Search for security patterns

**Deliverable**: Launch security checklist (sign-off required)

---

## 🎯 P2 - LAUNCH PREPARATION (Start After P1 or in Parallel)

### 5. Integrations Agent — Production Integration Testing (1-2 hours)

**Task**: Test all integrations with production-like data using MCP tools

**Commands**:
```bash
cd ~/HotDash/hot-dash

# 1. Test Shopify queries with real store data using Shopify MCP
# Use mcp_shopify_learn_shopify_api and mcp_shopify_validate_graphql_codeblocks
# Validate ALL queries in codebase

# 2. Monitor MCP health every 30 minutes
# Use all 7 MCP servers: Shopify, Context7, GitHub, Supabase, Fly, GA, LlamaIndex

# 3. Test Hot Rod AN specific queries
# Products, orders, inventory with Shopify MCP

# Evidence: MCP validation results, health monitoring log
```

**MCP Tools Required**:
- ✅ Shopify MCP: All tools (learn, introspect, validate)
- ✅ All 7 MCP servers for health monitoring

**Deliverable**: Production integration test report

---

### 6. Chatwoot Agent — Production Test Scenarios (1 hour)

**Task**: Create comprehensive production test scenarios

**Commands**:
```bash
cd ~/HotDash/hot-dash

# 1. Document production test scenarios with grep
grep -r "chatwoot" app/ packages/ --include="*.ts"
# Find all Chatwoot integration points

# 2. Create test payloads for each webhook type
# message.created, message.updated, conversation.created

# 3. Document expected responses
# What should agent SDK return?

# 4. Create production test checklist
# File: docs/runbooks/chatwoot_production_tests.md

# Evidence: Test scenarios, webhook payloads, test checklist
```

**MCP Tools Required**:
- ✅ grep: Find Chatwoot integration points

**Deliverable**: Production test scenarios document

---

### 7. Support Agent — Playbook Final Review (30-45 min)

**Task**: Final review and print preparation of all playbooks

**Commands**:
```bash
cd ~/HotDash/hot-dash

# 1. Review all playbooks with grep
find docs/support/playbooks/ -name "*.md" -type f

# 2. Create master playbook index
# File: docs/support/playbooks/MASTER_INDEX.md
# Link to all 7 playbooks

# 3. Create printable quick reference (1-page)
# File: docs/support/QUICK_REFERENCE.md
# Most common scenarios, decision tree

# 4. Verify automotive terminology consistency
grep -r "horsepower\|HP\|AN fitting\|fuel system" docs/support/

# Evidence: Master index, quick reference, terminology verification
```

**MCP Tools Required**:
- ✅ grep: Verify terminology consistency

**Deliverable**: Master playbook index, printable quick reference

---

### 8. Product Agent — Launch Day Monitoring Dashboard (1-2 hours)

**Task**: Create real-time monitoring dashboard for launch day

**Commands**:
```bash
cd ~/HotDash/hot-dash

# 1. Document key metrics to monitor
# File: docs/pilot/launch_day_monitoring.md
# - User logins
# - Tile loads
# - Approval queue depth
# - Error rates
# - Response times

# 2. Create monitoring queries using Supabase
# Document SQL queries for each metric

# 3. Create alert thresholds
# When to escalate issues

# 4. Create launch day runbook
# Hour-by-hour monitoring checklist

# Evidence: Monitoring dashboard spec, queries, thresholds, runbook
```

**MCP Tools Required**:
- ✅ Supabase MCP: Test monitoring queries (optional)

**Deliverable**: Launch day monitoring dashboard specification

---

## 🎯 P3 - LAUNCH MATERIALS (Start After P2 or in Parallel)

### 9. Marketing Agent — Final Launch Communications (30-60 min)

**Task**: Finalize all launch communications

**Commands**:
```bash
cd ~/HotDash/hot-dash

# 1. Review existing launch materials with grep
find docs/marketing/ -name "*launch*" -type f

# 2. Create launch email template
# File: docs/marketing/launch_email_template.md
# For Hot Rod AN CEO announcement

# 3. Create social media launch thread
# File: docs/marketing/launch_social_thread.md
# LinkedIn, Twitter ready-to-post

# 4. Create launch press release final draft
# File: docs/marketing/launch_press_release_final.md

# Evidence: Email template, social thread, press release
```

**MCP Tools Required**:
- ✅ grep: Find existing materials

**Deliverable**: Launch communications package (3 documents)

---

### 10. Enablement Agent — Quick Reference Materials (30-45 min)

**Task**: Create laminated quick reference card for CEO

**Commands**:
```bash
cd ~/HotDash/hot-dash

# 1. Create 1-page quick start guide
# File: docs/enablement/QUICK_START_CARD.md
# Print-ready, laminated card format

# 2. Include: Login URL, 5 tile overview, approval queue basics

# 3. Create keyboard shortcuts card
# File: docs/enablement/KEYBOARD_SHORTCUTS.md

# 4. Create troubleshooting FAQ (1-page)
# File: docs/enablement/TROUBLESHOOTING_FAQ.md
# Common issues + solutions

# Evidence: 3 quick reference documents, print-ready
```

**MCP Tools Required**:
- None (documentation task)

**Deliverable**: 3 quick reference documents (print-ready)

---

### 11. Localization Agent — Consistency Verification (30-45 min)

**Task**: Verify automotive terminology consistency across all files

**Commands**:
```bash
cd ~/HotDash/hot-dash

# Use grep to verify consistency (MANDATORY)
# DO NOT search manually

# 1. Verify automotive terminology with grep
grep -r "Mission Control\|Engine Trouble\|Full Speed" app/ --include="*.tsx" --include="*.ts"
# Confirm consistent usage

# 2. Find any remaining generic error messages
grep -r "Something went wrong\|Error occurred" app/ --include="*.tsx"
# Flag for updates

# 3. Verify brand voice in all user-facing text
grep -r "Hot Rod AN\|operator\|dashboard" app/ --include="*.tsx"

# 4. Create consistency report
# File: docs/localization/consistency_verification_report.md

# Evidence: grep results, consistency report
```

**MCP Tools Required**:
- ✅ grep: Verify all terminology (MANDATORY)

**Deliverable**: Consistency verification report

---

## ⏸️ PAUSED (Correctly)

### 12. Git-Cleanup Agent — Paused Until Oct 16

**Status**: Correctly paused per CEO direction  
**Next Action**: Oct 16 per direction file  
**No Work**: This pause is correct and intentional

---

## 📊 SUMMARY OF ASSIGNMENTS

**P1 - Urgent** (4 agents): QA, QA-Helper, Data, Compliance  
**P2 - Launch Prep** (4 agents): Integrations, Chatwoot, Support, Product  
**P3 - Launch Materials** (3 agents): Marketing, Enablement, Localization  
**Paused** (1 agent): Git-Cleanup

**Total**: 11/12 agents with productive work  
**Timeline**: All work completable in 1-3 hours  
**Impact**: Launch readiness significantly improved

---

## ⚠️ CRITICAL REMINDERS

1. **USE MCP TOOLS**: Where specified, MCP tools are MANDATORY
2. **NO CLI BYPASS**: Don't use psql, fly CLI, etc. instead of MCPs
3. **NO TRAINING DATA**: For React Router 7, Shopify APIs - use MCPs
4. **USE GREP**: For file searching - don't search manually
5. **LOG EVERYTHING**: All work in feedback/<agent>.md

---

**Manager**: All agents check this file for your specific assignment  
**Location**: docs/runbooks/IDLE_AGENT_ASSIGNMENTS_2025-10-12T21.md  
**Created**: 2025-10-12T21:10:00Z  
**Launch**: Oct 13-15, 2025 - LET'S GO! 🚀
