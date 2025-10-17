---
epoch: 2025.10.E1
doc: docs/design/agent-performance-metrics-ui.md
owner: designer
created: 2025-10-11
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-25
---

# Agent Performance Metrics UI Design

**Status**: Ready for Engineer Implementation  
**Polaris Version**: Latest  
**Target**: Agent SDK monitoring and operator insights

---

## Table of Contents

1. [Overview](#overview)
2. [Dashboard Tile Design](#dashboard-tile-design)
3. [Approval Queue Metrics](#approval-queue-metrics)
4. [Agent Performance Charts](#agent-performance-charts)
5. [Real-Time Update Patterns](#real-time-update-patterns)
6. [Detailed Metrics View](#detailed-metrics-view)

---

## 1. Overview

### Purpose

Provide operators with real-time visibility into AI agent performance, approval queue health, and response accuracy to build trust and identify improvement opportunities.

### Key Metrics to Track

**Agent Performance**:

- Response accuracy (% of approved vs rejected actions)
- Average response time (from webhook to proposal)
- Tool usage frequency (which tools are called most)
- Handoff efficiency (triage → specialist success rate)

**Approval Queue Health**:

- Current queue depth (pending approvals)
- Average approval time (operator response latency)
- Approval rate (approve vs reject ratio)
- Queue age (oldest pending approval)

**Conversation Outcomes**:

- First-time resolution rate
- Escalation rate
- Customer satisfaction (if available)
- Agent vs human response distribution

---

## 2. Dashboard Tile Design

### Tile: "AI Agent Pulse"

**Visual Layout**:

```
┌─────────────────────────────────────────────────────────┐
│ AI Agent Pulse                            [Healthy ✓] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 42 Actions Today                                        │
│ 36 approved (86%) · 6 rejected (14%)                   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │  Approval Rate                                  │   │
│ │  ████████░░  86%                                │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ Top Performing Agent:                                   │
│ • Order Support (24 actions, 95% approval)              │
│                                                         │
│ Queue Health:                                           │
│ • 3 pending approvals                                   │
│ • Avg response time: 3.2 min                           │
│ • Oldest pending: 5 min ago                            │
│                                                         │
│ [View Detailed Metrics]                                 │
└─────────────────────────────────────────────────────────┘
```

**Polaris Implementation**:

```typescript
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  ProgressBar,
  Button,
  List,
  Box,
} from '@shopify/polaris';

function AIAgentPulseTile({ metrics }: { metrics: AgentMetrics }) {
  const approvalRate = (metrics.approved / metrics.total) * 100;
  const statusTone = approvalRate >= 80 ? 'success' : approvalRate >= 60 ? 'warning' : 'critical';

  return (
    <Card>
      <BlockStack gap="400">
        {/* Header with status */}
        <InlineStack align="space-between" blockAlign="start">
          <Text variant="headingMd" as="h2">AI Agent Pulse</Text>
          <Badge tone={statusTone}>
            {approvalRate >= 80 ? 'Healthy' : approvalRate >= 60 ? 'Attention' : 'Critical'}
          </Badge>
        </InlineStack>

        {/* Primary metric */}
        <BlockStack gap="200">
          <Text variant="headingLg" as="p">
            {metrics.total} Actions Today
          </Text>
          <Text variant="bodySm" tone="subdued">
            {metrics.approved} approved ({approvalRate.toFixed(0)}%) · {metrics.rejected} rejected ({(100 - approvalRate).toFixed(0)}%)
          </Text>
        </BlockStack>

        {/* Approval rate visualization */}
        <Box>
          <BlockStack gap="200">
            <Text variant="bodyMd" fontWeight="semibold">Approval Rate</Text>
            <ProgressBar
              progress={approvalRate}
              tone={statusTone}
              size="small"
            />
            <Text variant="bodySm" tone="subdued">
              {approvalRate.toFixed(0)}% of actions approved
            </Text>
          </BlockStack>
        </Box>

        {/* Top performer */}
        <Box>
          <Text variant="bodyMd" fontWeight="semibold">Top Performing Agent:</Text>
          <List>
            <List.Item>
              {metrics.topAgent.name} ({metrics.topAgent.actionCount} actions, {metrics.topAgent.approvalRate}% approval)
            </List.Item>
          </List>
        </Box>

        {/* Queue health */}
        <Box background="bg-surface-secondary" padding="300" borderRadius="200">
          <BlockStack gap="200">
            <Text variant="bodyMd" fontWeight="semibold">Queue Health:</Text>
            <List type="bullet">
              <List.Item>{metrics.queueDepth} pending approvals</List.Item>
              <List.Item>Avg response time: {metrics.avgResponseMin.toFixed(1)} min</List.Item>
              <List.Item>Oldest pending: {formatRelativeTime(metrics.oldestPending)}</List.Item>
            </List>
          </BlockStack>
        </Box>

        {/* Action button */}
        <Button url="/app/agent-metrics" variant="plain">
          View Detailed Metrics
        </Button>
      </BlockStack>
    </Card>
  );
}

// TypeScript interfaces
interface AgentMetrics {
  total: number;
  approved: number;
  rejected: number;
  topAgent: {
    name: string;
    actionCount: number;
    approvalRate: number;
  };
  queueDepth: number;
  avgResponseMin: number;
  oldestPending: Date;
}
```

---

## 3. Approval Queue Metrics

### Metrics Bar Design

**Visual Layout**:

```
┌─────────────────────────────────────────────────────────────┐
│ Queue Metrics (Last 24h)                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  3 Pending    12 Approved    2 Rejected    3.2 min Avg     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Polaris Implementation**:

```typescript
import { Card, InlineGrid, BlockStack, Text } from '@shopify/polaris';

function ApprovalQueueMetrics({ stats }: { stats: QueueStats }) {
  return (
    <Card>
      <BlockStack gap="300">
        <Text variant="headingMd" as="h2">Queue Metrics (Last 24h)</Text>

        <InlineGrid columns={{ xs: 2, md: 4 }} gap="400">
          {/* Pending */}
          <BlockStack gap="100">
            <Text variant="headingLg" as="p" tone={stats.pending > 5 ? 'critical' : 'base'}>
              {stats.pending}
            </Text>
            <Text variant="bodySm" tone="subdued">Pending</Text>
          </BlockStack>

          {/* Approved */}
          <BlockStack gap="100">
            <Text variant="headingLg" as="p" tone="success">
              {stats.approved24h}
            </Text>
            <Text variant="bodySm" tone="subdued">Approved</Text>
          </BlockStack>

          {/* Rejected */}
          <BlockStack gap="100">
            <Text variant="headingLg" as="p">
              {stats.rejected24h}
            </Text>
            <Text variant="bodySm" tone="subdued">Rejected</Text>
          </BlockStack>

          {/* Avg Time */}
          <BlockStack gap="100">
            <Text variant="headingLg" as="p">
              {stats.avgResponseMin.toFixed(1)}m
            </Text>
            <Text variant="bodySm" tone="subdued">Avg Response</Text>
          </BlockStack>
        </InlineGrid>
      </BlockStack>
    </Card>
  );
}

interface QueueStats {
  pending: number;
  approved24h: number;
  rejected24h: number;
  avgResponseMin: number;
}
```

---

## 4. Agent Performance Charts

### Chart: Approval Rate Trend (7 Days)

**Visualization**: Line chart with approval percentage over time

**Implementation** (using lightweight chart library):

```typescript
import { Card, BlockStack, Text } from '@shopify/polaris';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function ApprovalRateTrendChart({ data }: { data: TrendData[] }) {
  return (
    <Card>
      <BlockStack gap="400">
        <Text variant="headingMd" as="h2">Approval Rate Trend</Text>
        <Text variant="bodySm" tone="subdued">Last 7 days</Text>

        <Box minHeight="200px">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis unit="%" domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="approvalRate"
                stroke="#1a7f37"
                strokeWidth={2}
                dot={{ fill: '#1a7f37', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Summary stats */}
        <InlineStack gap="400">
          <BlockStack gap="100">
            <Text variant="bodyMd" fontWeight="semibold">
              {calculateAverage(data)}%
            </Text>
            <Text variant="bodySm" tone="subdued">7-day avg</Text>
          </BlockStack>

          <BlockStack gap="100">
            <Text variant="bodyMd" fontWeight="semibold">
              {calculateTrend(data) > 0 ? '↑' : '↓'} {Math.abs(calculateTrend(data))}%
            </Text>
            <Text variant="bodySm" tone="subdued">Trend</Text>
          </BlockStack>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

interface TrendData {
  date: string;
  approvalRate: number;
  totalActions: number;
}
```

**Alternative (No chart library - Polaris only)**:

```typescript
// Use Polaris ProgressBar for sparkline effect
function SimpleApprovalTrend({ data }: { data: TrendData[] }) {
  return (
    <Card>
      <BlockStack gap="400">
        <Text variant="headingMd" as="h2">Approval Rate Trend</Text>

        <BlockStack gap="200">
          {data.map((day, idx) => (
            <InlineStack key={idx} gap="200" blockAlign="center">
              <Box minWidth="80px">
                <Text variant="bodySm" tone="subdued">{day.date}</Text>
              </Box>
              <Box width="100%">
                <ProgressBar progress={day.approvalRate} size="small" />
              </Box>
              <Box minWidth="50px">
                <Text variant="bodySm">{day.approvalRate}%</Text>
              </Box>
            </InlineStack>
          ))}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
```

---

### Chart: Tool Usage Distribution

**Visualization**: Horizontal bar chart showing which tools agents use most

```
┌─────────────────────────────────────────────────────────┐
│ Tool Usage (Last 7 Days)                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ chatwoot_send_public_reply     ████████████  24        │
│ shopify_find_orders            ████████      16        │
│ answer_from_docs               ██████        12        │
│ shopify_cancel_order           ███           6         │
│ chatwoot_create_private_note   ██            4         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Implementation**:

```typescript
function ToolUsageChart({ tools }: { tools: ToolUsage[] }) {
  const maxCount = Math.max(...tools.map(t => t.count));

  return (
    <Card>
      <BlockStack gap="400">
        <Text variant="headingMd" as="h2">Tool Usage</Text>
        <Text variant="bodySm" tone="subdued">Last 7 days</Text>

        <BlockStack gap="300">
          {tools.map(tool => (
            <BlockStack key={tool.name} gap="100">
              <InlineStack gap="200" blockAlign="center" align="space-between">
                <Text variant="bodySm">{tool.name}</Text>
                <Text variant="bodySm" tone="subdued">{tool.count}</Text>
              </InlineStack>
              <ProgressBar
                progress={(tool.count / maxCount) * 100}
                size="small"
              />
            </BlockStack>
          ))}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

interface ToolUsage {
  name: string;
  count: number;
  approvalRate: number;
}
```

---

## 5. Real-Time Update Patterns

### Live Queue Depth Indicator

**Visual**: Small badge that updates in real-time

```typescript
import { Badge } from '@shopify/polaris';
import { useEffect, useState } from 'react';

function LiveQueueBadge() {
  const [queueDepth, setQueueDepth] = useState(0);

  useEffect(() => {
    // Poll or SSE for updates
    const interval = setInterval(async () => {
      const response = await fetch('/api/approvals/count');
      const { count } = await response.json();
      setQueueDepth(count);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const tone = queueDepth === 0 ? 'success' : queueDepth < 5 ? 'info' : 'warning';

  return (
    <Badge tone={tone}>
      {queueDepth} Pending
    </Badge>
  );
}

// Usage in page header
<Page
  title="Approval Queue"
  titleMetadata={<LiveQueueBadge />}
>
  {/* Content */}
</Page>
```

### Real-Time Metric Updates (Server-Sent Events)

```typescript
function RealtimeMetrics() {
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null);

  useEffect(() => {
    const eventSource = new EventSource('/api/agent-metrics/stream');

    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setMetrics(update);
    };

    eventSource.onerror = () => {
      eventSource.close();
      // Fall back to polling
    };

    return () => eventSource.close();
  }, []);

  if (!metrics) {
    return <SkeletonBodyText lines={4} />;
  }

  return <AIAgentPulseTile metrics={metrics} />;
}
```

---

## 6. Detailed Metrics View

### Route: `/app/agent-metrics`

**Full Page Layout**:

```
┌───────────────────────────────────────────────────────────────┐
│ Agent Performance Metrics                           [Refresh] │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ [Time Range Selector: Today | 7 Days | 30 Days | Custom]    │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Overview Metrics (4 stat cards in grid)                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Approval Rate Trend (Line chart)                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌───────────────────┐  ┌──────────────────────────────────┐ │
│ │ Tool Usage        │  │ Agent Performance Breakdown      │ │
│ │ (Bar chart)       │  │ (Table with sort/filter)         │ │
│ └───────────────────┘  └──────────────────────────────────┘ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Recent Actions (List of last 20 with status)           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**Implementation**:

```typescript
import { Page, Layout, Card, Tabs, InlineGrid } from '@shopify/polaris';

export default function AgentMetricsRoute() {
  const { metrics } = useLoaderData<typeof loader>();
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = [
    { id: 'overview', content: 'Overview' },
    { id: 'agents', content: 'Agent Performance' },
    { id: 'tools', content: 'Tool Usage' },
    { id: 'history', content: 'Action History' },
  ];

  return (
    <Page
      title="Agent Performance Metrics"
      primaryAction={{ content: 'Refresh', onAction: () => revalidator.revalidate() }}
    >
      <Layout>
        {/* Time range selector */}
        <Layout.Section>
          <Card>
            <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab} />
          </Card>
        </Layout.Section>

        {/* Overview tab */}
        {selectedTab === 0 && (
          <>
            <Layout.Section>
              <InlineGrid columns={{ xs: 1, md: 2, lg: 4 }} gap="400">
                <MetricCard
                  label="Total Actions"
                  value={metrics.total}
                  trend="+12% vs yesterday"
                  trendUp
                />
                <MetricCard
                  label="Approval Rate"
                  value={`${metrics.approvalRate}%`}
                  trend="+3% vs last week"
                  trendUp
                />
                <MetricCard
                  label="Avg Response Time"
                  value={`${metrics.avgResponseMin}m`}
                  trend="-0.5m vs last week"
                  trendUp
                />
                <MetricCard
                  label="Queue Depth"
                  value={metrics.queueDepth}
                  trend={metrics.queueDepth > 5 ? 'High' : 'Normal'}
                  trendUp={false}
                />
              </InlineGrid>
            </Layout.Section>

            <Layout.Section>
              <ApprovalRateTrendChart data={metrics.trendData} />
            </Layout.Section>

            <Layout.Section variant="oneThird">
              <ToolUsageChart tools={metrics.toolUsage} />
            </Layout.Section>

            <Layout.Section variant="twoThirds">
              <AgentPerformanceTable agents={metrics.agentPerformance} />
            </Layout.Section>
          </>
        )}

        {/* Other tabs */}
      </Layout>
    </Page>
  );
}

// Metric card component
function MetricCard({
  label,
  value,
  trend,
  trendUp
}: {
  label: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <Card>
      <BlockStack gap="200">
        <Text variant="bodySm" tone="subdued">{label}</Text>
        <Text variant="headingLg" as="p">{value}</Text>
        <InlineStack gap="100" blockAlign="center">
          <Text variant="bodySm" tone={trendUp ? 'success' : 'critical'}>
            {trendUp ? '↑' : '↓'}
          </Text>
          <Text variant="bodySm" tone="subdued">{trend}</Text>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
```

---

### Agent Performance Table

**Visual Layout**:

```
┌─────────────────────────────────────────────────────────┐
│ Agent Performance Breakdown                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Agent Name           Actions  Approved  Rejected  Rate  │
│ ──────────────────  ────────  ────────  ────────  ────  │
│ Order Support          24       23        1       96%  │
│ Product Q&A            12       10        2       83%  │
│ Triage                  6        3        3       50%  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Implementation**:

```typescript
import { Card, DataTable } from '@shopify/polaris';

function AgentPerformanceTable({ agents }: { agents: AgentPerformance[] }) {
  const rows = agents.map(agent => [
    agent.name,
    agent.actionCount,
    agent.approved,
    agent.rejected,
    `${agent.approvalRate}%`,
  ]);

  return (
    <Card>
      <DataTable
        columnContentTypes={['text', 'numeric', 'numeric', 'numeric', 'numeric']}
        headings={['Agent Name', 'Actions', 'Approved', 'Rejected', 'Rate']}
        rows={rows}
        sortable={[true, true, true, true, true]}
        defaultSortDirection="descending"
        initialSortColumnIndex={1}
      />
    </Card>
  );
}

interface AgentPerformance {
  name: string;
  actionCount: number;
  approved: number;
  rejected: number;
  approvalRate: number;
}
```

---

## 7. Status Indicators & Alerts

### Queue Health Badge

**Logic**: Dynamic badge based on queue state

```typescript
function QueueHealthBadge({ depth, avgTime }: { depth: number; avgTime: number }) {
  let tone: BadgeTone;
  let label: string;

  if (depth === 0) {
    tone = 'success';
    label = 'All Clear';
  } else if (depth < 5 && avgTime < 5) {
    tone = 'success';
    label = 'Healthy';
  } else if (depth < 10 || avgTime < 10) {
    tone = 'warning';
    label = 'Moderate Load';
  } else {
    tone = 'critical';
    label = 'High Load';
  }

  return (
    <Badge tone={tone}>
      {label}
    </Badge>
  );
}
```

### Performance Alert Banner

**Trigger**: Show when performance degrades

```typescript
{metrics.approvalRate < 70 && (
  <Banner
    tone="warning"
    title="Agent Performance Below Target"
    action={{
      content: 'View Details',
      url: '/app/agent-metrics'
    }}
  >
    <Text variant="bodyMd">
      Agent approval rate has dropped to {metrics.approvalRate}% (target: 80%+).
      Review recent rejections to identify patterns.
    </Text>
  </Banner>
)}

{metrics.queueDepth > 10 && (
  <Banner
    tone="critical"
    title="Approval Queue Backlog"
  >
    <Text variant="bodyMd">
      {metrics.queueDepth} approvals pending. Consider increasing operator capacity
      or reviewing agent permissions.
    </Text>
  </Banner>
)}
```

---

## 8. Mobile Responsive Design

### Mobile Metrics View

**Layout**: Stacked cards, simplified visualizations

```typescript
// Desktop: 4-column grid
// Tablet: 2-column grid
// Mobile: 1-column stack

<InlineGrid
  columns={{ xs: 1, sm: 2, md: 4 }}
  gap="400"
>
  <MetricCard {...} />
  <MetricCard {...} />
  <MetricCard {...} />
  <MetricCard {...} />
</InlineGrid>

// Charts: Reduce height on mobile
<Box minHeight={{ xs: "150px", md: "200px" }}>
  <ResponsiveContainer width="100%" height="100%">
    {/* Chart */}
  </ResponsiveContainer>
</Box>

// Tables: Horizontal scroll on mobile
<Box overflowX="scroll">
  <DataTable {...} />
</Box>
```

---

## 9. Export & Reporting

### Export Metrics Button

```typescript
<Button
  onClick={handleExportMetrics}
  icon={DownloadIcon}
  variant="plain"
>
  Export CSV
</Button>

// Export handler
async function handleExportMetrics() {
  const response = await fetch('/api/agent-metrics/export?format=csv');
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `agent-metrics-${new Date().toISOString()}.csv`;
  a.click();
}
```

---

## 10. Implementation Checklist

### Phase 1: Dashboard Tile (Day 1)

- [ ] Create `AIAgentPulseTile` component
- [ ] Implement basic metrics display
- [ ] Add approval rate progress bar
- [ ] Add queue health section
- [ ] Test responsive behavior

### Phase 2: Detailed Metrics Page (Day 2)

- [ ] Create `/app/agent-metrics` route
- [ ] Implement metric cards grid
- [ ] Add approval rate trend visualization
- [ ] Add tool usage chart
- [ ] Add agent performance table

### Phase 3: Real-Time Updates (Day 3)

- [ ] Implement polling or SSE
- [ ] Add live queue badge
- [ ] Add real-time metric updates
- [ ] Test performance with many agents

### Phase 4: Polish & Testing (Day 4)

- [ ] Mobile responsive optimization
- [ ] Accessibility testing
- [ ] Performance testing
- [ ] Export functionality

---

## 11. Data Requirements

### API Endpoints Needed

```typescript
// Get current metrics
GET /api/agent-metrics
Response: {
  total: number;
  approved: number;
  rejected: number;
  approvalRate: number;
  avgResponseMin: number;
  queueDepth: number;
  oldestPending: string;
  topAgent: { name, actionCount, approvalRate };
  toolUsage: ToolUsage[];
  agentPerformance: AgentPerformance[];
  trendData: TrendData[];
}

// Get queue count (for live badge)
GET /api/approvals/count
Response: { count: number }

// Stream updates (SSE)
GET /api/agent-metrics/stream
Event: { type: 'metrics_update', data: AgentMetrics }

// Export metrics
GET /api/agent-metrics/export?format=csv&range=7d
Response: CSV file download
```

---

## 12. Success Metrics

### User Goals

**Operators want to**:

1. Know if agents are performing well (approval rate)
2. See queue backlog (pending approvals)
3. Identify which agents/tools are used most
4. Spot performance trends (improving vs degrading)
5. Export data for reporting

### Design Success Criteria

- [ ] Approval rate visible within 3 seconds of page load
- [ ] Queue depth always visible (live badge)
- [ ] Trend direction clear (↑/↓ indicators)
- [ ] Mobile-friendly (all metrics accessible on phone)
- [ ] Accessible (WCAG 2.2 AA compliant)
- [ ] Real-time updates (< 10s latency)

---

**Status**: Agent Performance Metrics UI Design Complete  
**Created**: 2025-10-11  
**Owner**: Designer Agent  
**Ready For**: Engineer Implementation
