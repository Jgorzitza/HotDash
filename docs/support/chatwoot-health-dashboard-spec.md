# Chatwoot Health Monitoring Dashboard Specification

**Created**: 2025-10-20  
**Owner**: Support Agent  
**For**: Engineer (UI implementation in Settings → Integrations tab)  
**Status**: Ready for Implementation

---

## Overview

Real-time health monitoring dashboard for Chatwoot multi-channel customer support integration. Displays service status, performance metrics, and SLA compliance to ensure CX operations remain reliable.

---

## Display Location

**Primary**: Settings page → Integrations tab → Chatwoot section  
**Alternative**: Admin dashboard (`/admin/chatwoot-health`) for detailed monitoring

---

## Data Sources

### 1. Health Check Scripts

- **Primary**: `scripts/ops/check-chatwoot-health.mjs`
- **Alternative**: `scripts/ops/check-chatwoot-health.sh`
- **Artifacts**: `artifacts/ops/chatwoot-health/*.json`
- **Frequency**: Run every 5 minutes (cron job or React Router loader)

### 2. Chatwoot API Endpoints

- **Profile**: `/api/v1/profile` (agent status, account info)
- **Conversations**: `/api/v1/accounts/{account_id}/conversations` (counts, states)
- **Inbox Stats**: `/api/v1/accounts/{account_id}/inboxes` (channel breakdown)

### 3. Supabase Tables

- **decision_log**: CX approval grades, response times
- **notifications**: SLA breach alerts
- **approvals_history**: Agent performance metrics

---

## Metrics to Display

### 1. Service Uptime

**Metric**: Current operational status + 30-day uptime percentage

**Display**:

```
Status: 🟢 Operational (99.7% uptime - last 30 days)
Last checked: 2 minutes ago
```

**Data Source**:

- Current: Latest health check artifact (rails_health check status)
- Historical: Aggregate artifacts from past 30 days

**Color Coding**:

- 🟢 Green: ≥99.9% uptime (target met)
- 🟡 Yellow: 99.0-99.8% uptime (degraded)
- 🔴 Red: <99.0% uptime (critical)

**Threshold Alerts**:

- Uptime drops below 99.9%: Banner notification
- Service down (rails_health fails): Critical alert to CEO

---

### 2. Response Time

**Metric**: API response times for health checks + customer-facing actions

**Display**:

```
Response Time
  Median: 142ms
  P90: 238ms
  P99: 520ms
```

**Data Source**:

- Health check artifacts: `checks[].duration`
- Approval action logs: Time from webhook receipt to Private Note creation

**Target Thresholds** (from NORTH_STAR.md):

- Health check: <5 seconds per check
- Webhook processing: <1 second
- Private note creation: <3 seconds
- Approval action: <2 seconds

**Color Coding**:

- 🟢 Green: All within targets
- 🟡 Yellow: 1 metric exceeds target
- 🔴 Red: 2+ metrics exceed targets

---

### 3. Conversation Counts

**Metric**: Open, pending, resolved conversation counts by status

**Display**:

```
Conversations (Last 24h)
  Open: 12
  Pending Review: 3 (queue)
  Resolved: 47
  Closed: 0
```

**Data Source**:

- Chatwoot API: `/api/v1/accounts/{account_id}/conversations`
- Filter by `status` field (open, pending, resolved, snoozed)

**Queue Alert**:

- > 10 pending: Yellow banner "CX queue backlog"
- > 20 pending: Red banner "URGENT: High backlog"

---

### 4. SLA Compliance

**Metric**: Percentage of conversations meeting 15-minute review target (business hours)

**Display**:

```
SLA Compliance (Last 7 days)
  Target: ≤15 min response time
  Compliance: 94.3% (423/448 conversations)
  Avg Response: 12 min
  Breaches: 25 conversations
```

**Data Source**:

- Supabase decision_log: Time from `message_created` webhook to approval action
- Filter: Business hours only (9am-5pm EST, Mon-Fri)

**Target** (from NORTH_STAR.md):

- Business hours review: ≤15 minutes for CX
- Same day response for inventory/growth
- Median approval time: ≤15 minutes

**Color Coding**:

- 🟢 Green: ≥95% compliance
- 🟡 Yellow: 85-94% compliance
- 🔴 Red: <85% compliance

**Breach Details** (expandable):

- List conversations that exceeded 15 minutes
- Include: Conversation ID, customer name, wait time, reason (if tagged)

---

### 5. Channel Breakdown

**Metric**: Message volume and response times by channel (email, SMS, chat)

**Display**:

```
Channel Activity (Last 24h)
  📧 Email: 28 messages (45% of volume)
  💬 Live Chat: 21 messages (34% of volume)
  📱 SMS: 13 messages (21% of volume)
```

**Data Source**:

- Chatwoot API: `/api/v1/accounts/{account_id}/conversations`
- Inbox type field identifies channel

**Performance by Channel**:

```
Channel Performance (Avg Response Time)
  Email: 18 min (target: 15 min) 🟡
  Live Chat: 8 min (target: 15 min) 🟢
  SMS: 5 min (target: 15 min) 🟢
```

**Alert Conditions**:

- Any channel exceeds 30 min avg response: Warning
- Any channel 0 messages for >4 hours (business hours): Possible channel outage

---

### 6. Agent Availability

**Metric**: AI-Customer agent status + human reviewer availability

**Display**:

```
Agent Status
  AI-Customer: 🟢 Online (3 drafts queued)
  Human Reviewers: 🟢 1 available (CEO)
  Queue Wait: ~8 minutes (based on recent avg)
```

**Data Source**:

- Agent SDK health: `https://hotdash-agent-service.fly.dev/health`
- Approval queue: Count of pending approvals
- Historical data: Avg approval processing time

**Availability States**:

- 🟢 Online: Agent SDK healthy, reviewers active
- 🟡 Degraded: Agent SDK slow (>5s response), no reviewers active
- 🔴 Offline: Agent SDK down, no reviewers, queue growing

---

## UI Components

### Primary Card (Settings → Integrations → Chatwoot)

**Compact View** (default):

```
┌─────────────────────────────────────────┐
│ Chatwoot Status                         │
│                                         │
│ 🟢 Operational                          │
│ Response Time: 142ms                    │
│ SLA Compliance: 94.3%                   │
│ Queue: 3 pending                        │
│                                         │
│ [View Detailed Health →]                │
└─────────────────────────────────────────┘
```

**Expanded View** (after clicking "View Detailed Health"):

- All 6 metrics displayed (as shown above)
- Refresh button (manual refresh)
- Auto-refresh toggle (on/off)
- Time range selector (24h, 7d, 30d)

---

### Admin Dashboard Route (Optional - Future Enhancement)

**Route**: `/admin/chatwoot-health`

**Purpose**: Detailed operations monitoring for Support/DevOps

**Features**:

- Real-time metric charts (Recharts or Polaris Viz)
- Historical trends (30-day view)
- Incident log (service outages, SLA breaches)
- Export to CSV (metrics report)
- Manual health check trigger

**Access Control**: Admin role only

---

## Implementation Notes for Engineer

### Step 1: Data Fetching

Create loader function: `app/routes/settings.integrations.tsx` (or similar)

```typescript
export async function loader() {
  // 1. Read latest health check artifact
  const latestHealthCheck = await readLatestArtifact(
    "artifacts/ops/chatwoot-health/",
  );

  // 2. Fetch Chatwoot API data (conversations, inbox stats)
  const conversations = await fetchChatwootConversations();
  const inboxStats = await fetchChatwootInboxStats();

  // 3. Query Supabase for SLA compliance
  const slaMetrics = await querySLAMetrics(7); // last 7 days

  // 4. Calculate metrics
  const metrics = {
    uptime: calculateUptime(latestHealthCheck),
    responseTime: extractResponseTimes(latestHealthCheck),
    conversationCounts: extractCounts(conversations),
    slaCompliance: calculateSLA(slaMetrics),
    channelBreakdown: extractChannels(conversations),
    agentStatus: await checkAgentSDKHealth(),
  };

  return Response.json(metrics);
}
```

### Step 2: UI Components

**Suggested Libraries**:

- **Polaris Card**: Container for metrics display
- **Polaris Badge**: Status indicators (Green/Yellow/Red)
- **Polaris ProgressBar**: SLA compliance visual
- **Polaris DataTable**: Breach details (expandable)

**Accessibility**:

- ARIA labels for status indicators
- Color + icon + text for status (not color alone)
- Keyboard navigation for expand/collapse

### Step 3: Auto-Refresh

**Pattern**: React Router `useRevalidator` hook

```typescript
import { useRevalidator } from "react-router";

function ChatwootHealth() {
  const revalidator = useRevalidator();

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        revalidator.revalidate();
      },
      5 * 60 * 1000,
    ); // 5 minutes

    return () => clearInterval(interval);
  }, [revalidator]);

  // ...
}
```

### Step 4: Error Handling

**If health check fails**:

- Display last known good state
- Show error message: "Unable to refresh metrics (last updated X minutes ago)"
- Provide "Retry" button

**If Chatwoot API unavailable**:

- Show degraded state
- Display: "Chatwoot API unavailable - using cached data"
- Alert CEO if outage >5 minutes

---

## Testing Checklist

For Engineer implementing this feature:

- [ ] Health metrics load correctly from artifacts
- [ ] API calls handle 401/404 errors gracefully
- [ ] SLA calculation matches expected formula
- [ ] Color coding updates based on thresholds
- [ ] Auto-refresh works (5-minute interval)
- [ ] Manual refresh button functional
- [ ] Time range selector changes data display
- [ ] Expandable sections work (conversation breaches)
- [ ] Accessibility: keyboard navigation, ARIA labels
- [ ] Responsive: works on mobile/tablet/desktop
- [ ] Performance: loads <2 seconds

---

## Monitoring & Alerts

### Proactive Alerts (CEO Notifications)

**Trigger Conditions**:

1. **Service Down**: rails_health fails for >2 minutes
2. **High Queue**: >10 pending approvals for >30 minutes
3. **SLA Breach**: Compliance drops below 85%
4. **Channel Outage**: 0 messages on any channel for >4 hours (business hours)
5. **Slow Response**: P90 response time >5 seconds

**Alert Method**:

- Toast notification (in-app)
- Browser notification (if enabled)
- Email notification (future: if urgent)

**Alert Format**:

```
🔴 Chatwoot Alert: Service Down
Rails health check failed (error: 404)
Last successful check: 5 minutes ago
Action: Verify Chatwoot instance at hotdash-chatwoot.fly.dev
```

---

## Success Criteria

**From NORTH_STAR.md**:

- Chatwoot `/rails/health` + authenticated probes pass **100%** during launch week
- Daily scripted health checks confirm availability before CX work
- P95 tile load <3s
- Uptime ≥99.9% (30-day rolling window)

**Dashboard-Specific**:

- Metrics refresh within 2 seconds
- Alerts trigger within 1 minute of threshold breach
- 0 false positives (alert when no actual issue)
- CEO can understand status at a glance (<5 seconds to assess)

---

## References

- **Integration Docs**: `docs/integrations/chatwoot.md`
- **Health Check Scripts**: `scripts/ops/check-chatwoot-health.{mjs,sh}`
- **North Star**: `docs/NORTH_STAR.md` (CX targets, SLA requirements)
- **Agent Direction**: `docs/directions/ai-customer.md` (HITL workflow)
- **Approval Flow**: `docs/specs/approvals_drawer_spec.md`

---

## Change Log

- **2025-10-20**: Initial specification created by Support Agent
- Documented 6 core metrics (uptime, response time, conversation counts, SLA, channels, agent status)
- Defined display locations (Settings → Integrations, Admin dashboard)
- Provided implementation notes for Engineer
- Defined success criteria and alert conditions

---

**Status**: ✅ Ready for Engineer Implementation (Phase 2 or Phase 4 of Option A)

**Next Step**: Engineer creates UI components in Settings → Integrations tab
