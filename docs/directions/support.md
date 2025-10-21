# Support Direction v5.2

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
```

**Owner**: Manager  
**Effective**: 2025-10-21T04:11Z  
**Version**: 5.2  
**Status**: ACTIVE — Chatwoot Enhancements + CX Metrics

---

## Objective

**Multi-channel testing + Routing rules + CX metrics dashboard + Help docs**

---

## MANDATORY MCP USAGE

```bash
# Chatwoot API
web_search("Chatwoot API official documentation conversation routing")

# TypeScript for services
mcp_context7_get-library-docs("/microsoft/TypeScript", "async API integration error handling")
```

---

## ACTIVE TASKS (9h total)

### SUPPORT-002: Multi-Channel Testing (2h) - START NOW

**Requirements**:
- Test Email inbox (IMAP integration)
- Test Live Chat widget on staging
- Test SMS via Twilio (if configured)
- Verify all channels create conversations

**Deliverables**:
- Multi-channel test report in feedback
- Screenshot evidence of each channel
- Issues list (if any)

**Time**: 2 hours

---

### SUPPORT-003: Conversation Routing Rules (2h)

**Requirements**:
- Auto-assign conversations based on rules
- Priority routing (urgent keywords)
- Round-robin assignment
- Escalation triggers

**MCP Required**: web_search for Chatwoot routing API

**File**: `app/services/chatwoot/routing.ts` (new)

**Time**: 2 hours

---

### SUPPORT-004: CX Metrics Dashboard (2h)

**Requirements**:
- Track FRT (First Response Time)
- Track Resolution Time
- SLA compliance monitoring
- Agent performance dashboard

**File**: `app/routes/api.support.metrics.ts` (new)

**Time**: 2 hours

---

### SUPPORT-005: Help Documentation (3h)

**Requirements**:
- Internal runbooks for CX team
- How to use approval workflow
- Grading guidelines
- Escalation procedures

**File**: `docs/runbooks/cx-team-guide.md` (new)

**Time**: 3 hours

---

## Work Protocol

**MCP Tools**: web_search for Chatwoot, Context7 for TypeScript

**Reporting (Every 2 hours)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — Support: Multi-Channel Testing

**Working On**: SUPPORT-002 (Testing all channels)
**Progress**: 60% - Email + Live Chat verified, SMS pending

**Evidence**:
- Email: 3 test messages received in Chatwoot inbox
- Live Chat: Widget working on staging, conversation created
- Screenshots: email-inbox.png, live-chat-test.png
- Twilio SMS: Configuration needed (escalating to Manager)

**Blockers**: SMS credentials needed (vault/occ/twilio/)
**Next**: Complete SMS testing or skip if credentials unavailable
```

---

**START WITH**: SUPPORT-002 (Multi-channel testing) - START NOW

**NO MORE STANDBY - ACTIVE WORK ASSIGNED**
