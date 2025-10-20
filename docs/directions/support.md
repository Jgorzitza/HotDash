# Support Direction v5.0

**Owner**: Manager  
**Effective**: 2025-10-20T20:00Z  
**Version**: 5.0  
**Status**: ACTIVE — Chatwoot Multi-Channel Testing (PARALLEL DAY 1-3)

---

## Objective

**Test and document Chatwoot multi-channel for customer agent** (email, SMS, chat)

**Primary Reference**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan — LOCKED)

**Timeline**: Day 1-3 (6h total) — START NOW (Parallel with other agents)

---

## Day 1-3 Tasks (START NOW - 6h)

### SUPPORT-001: Chatwoot Multi-Channel End-to-End Testing (3h)

**Test ALL channels that customer agent will use**:

**Email Channel** (1h):
- Send test email to Chatwoot inbox
- Verify email appears in Chatwoot
- Test agent reply flow (draft → approve → send)
- Verify customer receives reply
- Test threading (replies stay in conversation)
- Test attachments (if supported)

**Live Chat Widget** (1h):
- Test chat widget on test site
- Send test messages
- Verify appears in Chatwoot
- Test agent reply flow
- Test real-time delivery
- Test file upload (if supported)

**SMS via Twilio** (1h):
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

### SUPPORT-002: Create Test Customer Scenarios (2h)

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

### SUPPORT-003: Chatwoot Health Monitoring Dashboard (1h)

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
