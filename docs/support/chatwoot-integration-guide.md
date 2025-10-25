# Chatwoot Integration Guide — Complete Reference

**Version**: 1.0  
**Last Updated**: 2025-10-21  
**Status**: Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Services](#services)
4. [API Routes](#api-routes)
5. [Automation Rules](#automation-rules)
6. [Testing](#testing)
7. [Deployment](#deployment)

---

## Overview

Chatwoot integration provides multi-channel customer support with AI-assisted responses and Human-In-The-Loop (HITL) approval.

**Channels**: Email, Live Chat Widget, SMS (future)  
**AI Integration**: OpenAI Agents SDK  
**Workflow**: Customer → Chatwoot → Webhook → Agent SDK → AI Draft → Human Approval → Send

---

## Architecture

### Components

1. **Chatwoot Instance**: https://hotdash-chatwoot.fly.dev
2. **Webhook Receiver**: app/routes/api.webhooks.chatwoot.tsx
3. **Agent SDK**: hotdash-agent-service.fly.dev
4. **Services**: app/services/chatwoot/
5. **Live Chat Widget**: Embedded in app/root.tsx

### Data Flow

```
Customer Message
    ↓
Chatwoot Inbox (Email/Chat/SMS)
    ↓
Webhook → Hot Dash API
    ↓
Agent SDK (AI Analysis)
    ↓
Private Note (AI Draft)
    ↓
Human Review & Grade
    ↓
Approved Reply → Customer
```

---

## Services

### 1. Routing Service (`app/services/chatwoot/routing.ts`)

**Purpose**: Intelligent conversation routing

**Features**:

- Auto-assign based on rules
- Priority routing (urgent, VIP)
- Round-robin load balancing
- SLA breach detection
- Legal/fraud escalation

**5 Default Rules**:

1. Escalate legal threats (priority 100)
2. Prioritize urgent (priority 90)
3. Prioritize VIP (priority 85)
4. Auto-assign business hours (priority 50)
5. Tag after-hours (priority 40)

**Usage**:

```typescript
import { routeConversation, checkSLABreach } from "~/services/chatwoot/routing";

const result = await routeConversation(conversation, agents);
// Returns: { action: "assigned", assigneeId: 5, reason: "..." }
```

---

### 2. Automation Service (`app/services/chatwoot/automation.ts`)

**Purpose**: Automate tagging and responses

**Features**:

- Keyword-based auto-tagging
- Sentiment analysis
- Intent classification
- After-hours auto-reply

**Keyword Categories**:

- Orders: tracking, shipment, delivery
- Inventory: stock, availability, backorder
- CX: help, support, question
- Urgent: urgent, asap, emergency
- Sentiment: positive vs negative

**Usage**:

```typescript
import {
  analyzeConversation,
  applyAutomations,
} from "~/services/chatwoot/automation";

const analysis = analyzeConversation(conversation);
// Returns: { categories, sentiment, intent, isUrgent }

await applyAutomations(conversation);
// Auto-tags and assigns
```

---

### 3. Analytics Service (`app/services/chatwoot/analytics.ts`)

**Purpose**: Generate performance analytics

**Features**:

- Response time tracking (avg, median, P90, P95, P99)
- Resolution time analysis
- CSAT calculation
- Common issues identification
- Peak hours detection

**Usage**:

```typescript
import { generateAnalyticsReport } from "~/services/chatwoot/analytics";

const report = await generateAnalyticsReport(startDate, endDate);
// Returns comprehensive analytics
```

---

### 4. Reporting Service (`app/services/chatwoot/reporting.ts`)

**Purpose**: Automated daily/weekly reports

**Features**:

- Daily report generation
- Weekly summaries
- Smart recommendations
- Markdown formatting
- Email distribution

**Usage**:

```typescript
import {
  generateDailyReport,
  formatReportAsMarkdown,
} from "~/services/chatwoot/reporting";

const report = await generateDailyReport();
const markdown = formatReportAsMarkdown(report);
```

---

## API Routes

### GET /api/support/metrics

Returns CX metrics dashboard data

**Response**:

```json
{
  "success": true,
  "data": {
    "overview": { ... },
    "frt": { ... },
    "sla": { ... }
  },
  "timestamp": "2025-10-21T08:00:00Z"
}
```

**Cache**: 5 minutes

---

### POST /api/webhooks/chatwoot

Receives Chatwoot webhooks

**Headers**: X-Chatwoot-Signature (HMAC-SHA256)

**Events**: conversation_created, message_created, conversation_resolved

**Security**: Signature verification in production

---

## Automation Rules

### Rule Priority System

Rules are evaluated in priority order (highest first):

| Priority | Rule                   | Action           |
| -------- | ---------------------- | ---------------- |
| 100      | Legal threat detection | Escalate         |
| 90       | Urgent keywords        | Prioritize + tag |
| 85       | VIP keywords           | Prioritize + tag |
| 50       | Business hours         | Auto-assign      |
| 40       | After hours            | Tag              |

### Custom Rules

Add custom rules in `app/services/chatwoot/routing.ts`:

```typescript
{
  id: "custom-rule",
  name: "Custom Rule",
  priority: 60,
  enabled: true,
  conditions: [
    {
      type: "keyword",
      operator: "contains",
      value: "custom keyword",
    },
  ],
  action: {
    type: "assign",
    target: 5, // Agent ID
  },
}
```

---

## Testing

### Integration Tests

**Location**: tests/integration/chatwoot/

**Files**:

- routing.spec.ts (12 tests)
- automation.spec.ts (18 tests)
- analytics.spec.ts (15 tests)
- reporting.spec.ts (15 tests)
- webhook.spec.ts (15 tests)
- api.spec.ts (20 tests)
- metrics.spec.ts (25 tests)

**Total**: 120+ test cases

### Run Tests

```bash
npm test tests/integration/chatwoot
```

### Test Coverage

Target: >90% coverage for all services

---

## Deployment

### Environment Variables

Required in Fly.io secrets:

```bash
CHATWOOT_BASE_URL=https://hotdash-chatwoot.fly.dev
CHATWOOT_TOKEN=<api_token>
CHATWOOT_ACCOUNT_ID=1
CHATWOOT_SLA_MINUTES=30
CHATWOOT_WEBHOOK_SECRET=<webhook_secret>
```

### Widget Deployment

Widget is automatically included in app/root.tsx:

- Loads on all pages
- Token: ieNpPnBaZXd9joxoeMts7qTA
- Color: #D32F2F (Hot Rod AN red)

### Health Monitoring

Check service health:

```bash
npm run ops:check-chatwoot-health
```

---

## Troubleshooting

### Issue: Widget Not Appearing

**Causes**:

1. Script blocked by CSP
2. Token invalid
3. Chatwoot service down

**Solution**:

1. Check browser console for errors
2. Verify widget token
3. Test https://hotdash-chatwoot.fly.dev/health

---

### Issue: Webhook Not Firing

**Causes**:

1. Webhook URL not configured in Chatwoot
2. Signature verification failing
3. Network issues

**Solution**:

1. Configure webhook in Chatwoot Settings → Webhooks
2. Verify CHATWOOT_WEBHOOK_SECRET matches
3. Check logs for signature errors

---

### Issue: API Returns 401

**Causes**:

1. Invalid API token
2. Token expired
3. Permissions issue

**Solution**:

1. Regenerate token in Chatwoot → Settings → Integrations → API
2. Update CHATWOOT_TOKEN env var
3. Restart Hot Dash app

---

## Resources

**Chatwoot Admin**: https://hotdash-chatwoot.fly.dev  
**API Docs**: /docs/integrations/chatwoot.md  
**Credentials**: vault/occ/chatwoot/  
**Health Check**: scripts/ops/check-chatwoot-health.mjs  
**CX Team Guide**: docs/runbooks/cx-team-guide.md

---

**For questions or issues, contact Support Agent or Manager**
