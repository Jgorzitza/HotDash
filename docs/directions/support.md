# Support Direction v5.1

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
git branch --show-current  # Verify: should show manager-reopen-20251020
```


**Owner**: Manager  
**Effective**: 2025-10-20T20:00Z  
**Version**: 5.0  
**Status**: ACTIVE — Chatwoot Multi-Channel Testing (PARALLEL DAY 1-3)


---

## ✅ CHATWOOT FIXED - UNBLOCKED (2025-10-21T01:21Z)

**Manager Fix Applied**: Chatwoot now on Supabase (not Fly Postgres)

**What Was Fixed**:
1. ✅ DATABASE_URL changed to Supabase pooler
2. ✅ Chatwoot migrations ran successfully on Supabase
3. ✅ `accounts` table has `settings` column
4. ✅ Admin login WORKS (returns token, not 500 error)

**You Can Now**:
1. ✅ Login to admin: https://hotdash-chatwoot.fly.dev
   - Credentials: vault/occ/chatwoot/super_admin_staging.env
2. ✅ Generate API token from Settings → Integrations → API
3. ✅ Resume SUPPORT-001 (multi-channel testing)
4. ✅ Execute SUPPORT-002 test scenarios

**Your Tasks**:
- ✅ SUPPORT-002: COMPLETE (20 test scenarios, 1,300 lines)
- ✅ SUPPORT-003: COMPLETE (health dashboard spec, 580 lines)
- 🔄 SUPPORT-001: Resume NOW (multi-channel testing - 3 hours)

**Time**: 3 hours for SUPPORT-001
**Priority**: P1 - Test email, SMS, live chat channels
**No Blockers**: Chatwoot fully functional

## ✅ WORK STATUS UPDATE (2025-10-21T00:00Z)

**Manager Consolidation Complete**: All feedback read, status verified

**Your Completed Work**: See feedback/${agent}/2025-10-20.md for full details

**Next Task**: See below for updated assignment

---


---

## Objective

**Test and document Chatwoot multi-channel for customer agent** (email, SMS, chat)

**Primary Reference**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan — LOCKED)

**Timeline**: Day 1-3 — START NOW (Parallel with other agents)

---

## Day 1-3 Tasks (START NOW - 6h)

### SUPPORT-001: Chatwoot Multi-Channel End-to-End Testing

**Test ALL channels that customer agent will use**:

**Email Channel**:
- Send test email to Chatwoot inbox
- Verify email appears in Chatwoot
- Test agent reply flow (draft → approve → send)
- Verify customer receives reply
- Test threading (replies stay in conversation)
- Test attachments (if supported)

**Live Chat Widget**:
- Test chat widget on test site
- Send test messages
- Verify appears in Chatwoot
- Test agent reply flow
- Test real-time delivery
- Test file upload (if supported)

**SMS via Twilio**:
- Send test SMS to Chatwoot number
- Verify SMS appears in Chatwoot
- Test agent reply flow
- Verify SMS delivered to customer
- Test character limits
- Test media messages (MMS if supported)

**Evidence Required**:
- Screenshots of all 3 channels working
- Test conversation IDs for each channel
- Response times documented
- Issues found (if any)

---

### SUPPORT-002: Create Test Customer Scenarios

**Create 20+ test conversations for customer agent**:

**Scenario Types**:
1. **Order Status** (5 scenarios):
   - "Where is my order?" (simple)
   - "My order is late" (escalation)
   - "Wrong item received" (refund/replacement)
   - "Cancel my order" (cancellation flow)
   - "Change shipping address" (modification)

2. **Product Questions** (5 scenarios):
   - "Is this in stock?" (availability)
   - "What's the difference between X and Y?" (comparison)
   - "Do you ship to Canada?" (shipping)
   - "What's your return policy?" (policy)
   - "Product defect" (quality issue)

3. **Account Issues** (3 scenarios):
   - "Reset my password" (account access)
   - "Update my email" (profile change)
   - "Delete my account" (GDPR request)

4. **Billing Questions** (3 scenarios):
   - "Charge on my card?" (payment inquiry)
   - "Refund status?" (refund tracking)
   - "Payment failed" (checkout error)

5. **Escalations** (4 scenarios):
   - Angry customer (tone management)
   - Multiple failed orders (complex issue)
   - Chargeback threat (high risk)
   - VIP customer (priority handling)

**Format** (create in Chatwoot):
- Real conversations (use test account)
- Tag each with scenario type
- Vary tone (friendly, frustrated, neutral, angry)
- Include edge cases

**Purpose**: Customer agent will learn from these patterns

---

### SUPPORT-003: Chatwoot Health Monitoring Dashboard

**Build monitoring for CX operations**:

**Create**: `app/routes/admin.chatwoot-health.tsx` (if allowed) OR document for DevOps

**Metrics to Display**:
- Service uptime (current: ✅ operational)
- Response time (median, P90)
- Conversation count (open, pending, resolved)
- SLA compliance (% under 2h target)
- Channel breakdown (email vs SMS vs chat)
- Agent availability

**Integration**:
- Use existing health check: `scripts/ops/check-chatwoot-health.mjs`
- Display in Settings → Integrations tab (Engineer builds UI)

---

## Current Status

**Chatwoot Service**: ✅ OPERATIONAL
- Email: Working
- Live Chat: Working  
- SMS: Working (via Twilio)
- Health checks: Passing (from feedback 2025-10-20)

**Your Work**: Test all channels, create test data, build monitoring

---

## Work Protocol

**1. MCP Tools**:
```bash
# If documenting Chatwoot patterns:
mcp_context7_get-library-docs("/chatwoot/chatwoot", "channels")

# Or web search for latest Chatwoot docs
```

**2. Coordinate**:
- **AI-Customer**: Provide test scenarios for agent training
- **Engineer**: Provide health metrics for UI display
- **DevOps**: Share health check results

**3. Reporting (Every 2 hours)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — Support: Chatwoot Testing

**Working On**: SUPPORT-001 (multi-channel testing)
**Progress**: 2/3 channels tested

**Evidence**:
- Email: ✅ 5 test conversations created (conversation IDs: 101-105)
- SMS: ✅ 3 test messages sent and received
- Chat: ⏸️ Testing in progress
- Screenshots: 8 screenshots documenting flows

**Blockers**: None
**Next**: Complete chat testing, start scenario creation
```

---

## Definition of Done

**Multi-Channel Testing**:
- [ ] All 3 channels tested (email, SMS, chat)
- [ ] Agent reply flow works on all channels
- [ ] Screenshots documenting each channel
- [ ] Response times documented
- [ ] Issues documented (or none found)

**Test Scenarios**:
- [ ] 20+ conversations created across 5 categories
- [ ] Each tagged appropriately in Chatwoot
- [ ] Varied tones (friendly to angry)
- [ ] Edge cases included
- [ ] Documented in feedback

**Health Monitoring**:
- [ ] Metrics identified
- [ ] Data source confirmed (existing health check script)
- [ ] Documented for Engineer UI integration

---

## Critical Reminders

**DO**:
- ✅ Test ALL 3 channels thoroughly
- ✅ Create realistic test scenarios (customer agent learns from these)
- ✅ Document issues immediately
- ✅ Provide health metrics to Engineer

**DO NOT**:
- ❌ Skip any channel (all must work)
- ❌ Create only happy-path scenarios (include escalations)
- ❌ Assume email = SMS = chat (test each separately)

---

## Phase Schedule

**Day 1**: SUPPORT-001 (multi-channel testing - 3h) — START NOW
**Day 2**: SUPPORT-002 (test scenarios - 2h)
**Day 3**: SUPPORT-003 (health dashboard - 1h)

**Total**: 6 hours across Days 1-3 (parallel with other agents)

---

## Quick Reference

**Plan**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan)
**Current Health**: Chatwoot operational (email/SMS/chat working)
**Integration Doc**: `docs/integrations/chatwoot.md`
**Feedback**: `feedback/support/2025-10-20.md`

---

**START WITH**: SUPPORT-001 (test all 3 channels NOW - unblocks customer agent training)

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

---

## ✅ CHATWOOT FIXED - Resume SUPPORT-001 NOW (3 hours)

**Manager Fix Complete** (2025-10-21T01:21Z):
1. ✅ Chatwoot DATABASE_URL changed to Supabase pooler  
2. ✅ Chatwoot migrations ran successfully on Supabase (89 migrations)
3. ✅ `accounts` table has `settings` column ✅
4. ✅ Admin login works (returns token, not 500 error)

**Verification**:
```bash
# Test login
curl -X POST https://hotdash-chatwoot.fly.dev/auth/sign_in \
  -H "Content-Type: application/json" \
  -d '{"email":"justin@hotrodan.com","password":"[from vault]"}'
# Result: Returns token ✅
```

**Your Task**: Resume SUPPORT-001 (Multi-Channel Testing)

### SUPPORT-001: Multi-Channel Testing (3 hours)

**Objective**: Test email, SMS, live chat channels in Chatwoot

**Steps**:
1. **Login to Chatwoot Admin** (15 min)
   - URL: https://hotdash-chatwoot.fly.dev
   - Credentials: vault/occ/chatwoot/super_admin_staging.env
   - Generate API token: Settings → Integrations → API
   - Save token to vault/occ/chatwoot/api_token.env

2. **Configure Channels** (45 min)
   - Email: Connect inbox (use test email)
   - SMS: Configure Twilio/MessageBird (if credentials available)
   - Live Chat: Install widget code on staging
   - Verify each channel receives messages

3. **Test Message Flow** (60 min)
   - Send test messages via each channel
   - Verify messages appear in Chatwoot inbox
   - Test conversation assignment to agents
   - Test message replies
   - Verify notifications work

4. **Execute Test Scenarios** (60 min)
   - Use docs/support/chatwoot-test-scenarios.md (20 scenarios)
   - Test at least 10 critical scenarios:
     - Multi-channel conversation threading
     - Agent assignment and reassignment
     - Canned responses
     - Conversation search
     - Customer info editing

**Deliverables**:
- ✅ API token generated and saved
- ✅ 3 channels configured and tested
- ✅ 10/20 test scenarios executed
- ✅ Test results documented in feedback

**Blockers**: NONE - Chatwoot fully functional

**After SUPPORT-001**: Move to SUPPORT-002 (if time) or standby
