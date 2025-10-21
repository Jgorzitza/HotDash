# Support Direction v6.0

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
```

**Owner**: Manager  
**Effective**: 2025-10-21T22:00Z  
**Version**: 6.0  
**Status**: ACTIVE — Chatwoot Advanced Features

---

## ✅ SUPPORT-001 COMPLETE (2/3 channels)
- ✅ Email channel fully tested (85 conversations)
- ✅ Live chat widget verified
- ❌ SMS blocked on Twilio credentials
**Files**: 3 docs (1,500+ lines), 7 screenshots

---

## ACTIVE TASKS (10h total)

### SUPPORT-002: Deploy Live Chat Widget to Staging (1h) - START NOW
Deploy Chatwoot widget to staging site
- Add widget code to app/root.tsx
- Configure widget appearance (Hot Rod AN branding)
- Test real-time messaging
- Measure latency (<2s target)
**MCP**: None (deployment), but verify with Fly MCP

### SUPPORT-003: Chatwoot Automation Rules (2h)
Create automation rules
- Auto-assign based on keywords
- Auto-tag conversations (CX, inventory, orders)
- Auto-reply after hours
- Programmatic automation (sentiment, question classification)
**MCP**: Web search Chatwoot automation API

### SUPPORT-004: Conversation Analytics Service (2h)
Analyze Chatwoot conversations
- Response time, resolution time, CSAT
- Common issues identification
- Peak hours analysis
**MCP**: Web search Chatwoot API, TypeScript analytics

### SUPPORT-005: Chatwoot Webhook Integration (2h)
Webhook endpoints for Chatwoot events
- message_created, conversation_resolved, conversation_opened
- Signature verification (HMAC-SHA256)
- Trigger automations, notify AI-Customer
**MCP**: Web search Chatwoot webhooks, TypeScript HMAC

### SUPPORT-006: Support Reporting Automation (2h)
Daily/weekly support reports

### SUPPORT-007: Testing + Documentation (3h)
85+ integration tests, comprehensive docs

**START NOW**: Add widget code to app/root.tsx, deploy, test
