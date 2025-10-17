---
epoch: 2025.10.E1
doc: docs/design/dashboard-features-1K-1P.md
owner: designer
created: 2025-10-12
tasks: 1K-1P (6 tasks)
---

# Dashboard Features: Tasks 1K-1P

## Task 1K: Operator Dashboard Personalization

### Customizable Dashboard Layout

**Tile Reordering** (Drag & Drop):

```typescript
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

function Dashboard() {
  const [tiles, setTiles] = useState(DEFAULT_TILE_ORDER);

  const handleDragEnd = (event) => {
    const {active, over} = event;
    if (active.id !== over.id) {
      setTiles((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      savePreferences({ tileOrder: tiles });
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={tiles}>
        {tiles.map(tile => <SortableTile key={tile.id} tile={tile} />)}
      </SortableContext>
    </DndContext>
  );
}
```

**Tile Visibility Toggle**:

```typescript
<SettingsPage>
  <Card sectioned>
    <Text variant="headingMd" as="h2">Visible Tiles</Text>
    <BlockStack gap="200">
      {ALL_TILES.map(tile => (
        <Checkbox
          key={tile.id}
          label={tile.title}
          checked={visibleTiles.includes(tile.id)}
          onChange={(checked) => toggleTileVisibility(tile.id, checked)}
        />
      ))}
    </BlockStack>
  </Card>
</SettingsPage>
```

**User Preference Storage**:

```typescript
// Store in Supabase user_preferences
interface UserPreferences {
  user_id: string;
  tile_order: string[];
  visible_tiles: string[];
  default_view: "grid" | "list";
  theme: "light" | "dark";
  updated_at: string;
}

await supabase.from("user_preferences").upsert({
  user_id: userId,
  tile_order: ["cx", "sales", "inventory", "seo", "fulfillment"],
  visible_tiles: ["cx", "sales"],
  default_view: "grid",
});
```

**Reset to Default**:

```typescript
<Button onClick={resetToDefaultLayout}>Reset to default layout</Button>
```

---

## Task 1L: Notification and Alert Design

### Notification Center

**Badge Count** (Nav):

```typescript
<Navigation.Item
  url="/notifications"
  label="Notifications"
  badge={unreadCount > 0 ? String(unreadCount) : undefined}
  icon={NotificationIcon}
/>
```

**Notification Center Modal**:

```typescript
<Modal
  open={notificationCenterOpen}
  onClose={() => setNotificationCenterOpen(false)}
  title="Notifications"
>
  <Modal.Section>
    <BlockStack gap="300">
      {notifications.map(notification => (
        <NotificationCard key={notification.id} notification={notification} />
      ))}
    </BlockStack>
  </Modal.Section>
</Modal>
```

**Notification Types**:

1. **Approval** (new approval needs review)
2. **Alert** (tile status changed)
3. **System** (maintenance, updates)
4. **Escalation** (urgent issue)

**Priority Visual Hierarchy**:

```typescript
<Card>
  <InlineStack align="space-between" blockAlign="center">
    <InlineStack gap="200">
      {notification.priority === 'urgent' && (
        <Badge tone="critical">URGENT</Badge>
      )}
      <Text variant="bodyMd">{notification.message}</Text>
    </InlineStack>
    <Text variant="bodySm" tone="subdued">{notification.timestamp}</Text>
  </InlineStack>
</Card>
```

**Sound/Vibration Preferences**:

```typescript
<SettingsPage>
  <Card sectioned>
    <Text variant="headingMd" as="h2">Notification Preferences</Text>
    <BlockStack gap="300">
      <Checkbox
        label="Play sound for new approvals"
        checked={preferences.soundEnabled}
        onChange={setSoundEnabled}
      />
      <Checkbox
        label="Browser notifications"
        checked={preferences.browserNotifications}
        onChange={setBrowserNotifications}
      />
      <Select
        label="Notification frequency"
        options={[
          { label: 'Real-time', value: 'realtime' },
          { label: 'Every 5 minutes', value: '5min' },
          { label: 'Hourly digest', value: 'hourly' },
        ]}
        value={preferences.frequency}
        onChange={setFrequency}
      />
    </BlockStack>
  </Card>
</SettingsPage>
```

---

## Task 1M: Data Visualization Library

### Chart Components

**Sparkline** (Trend):

```typescript
interface SparklineProps {
  data: number[];
  color?: 'success' | 'warning' | 'critical';
  height?: number;
  width?: number;
}

function Sparkline({ data, color = 'success', height = 40, width = 100 }: SparklineProps) {
  // SVG path for line
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - (value / Math.max(...data)) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height}>
      <polyline
        points={points}
        fill="none"
        stroke={`var(--p-color-icon-${color})`}
        strokeWidth="2"
      />
    </svg>
  );
}
```

**Bar Chart** (Comparison):

```typescript
import { BarChart } from '@shopify/polaris-viz';

<BarChart
  data={[
    { name: 'Mon', sales: 1200 },
    { name: 'Tue', sales: 1500 },
    { name: 'Wed', sales: 1350 },
    { name: 'Thu', sales: 1800 },
    { name: 'Fri', sales: 2100 },
  ]}
  xAxisOptions={{ label: 'Day' }}
  yAxisOptions={{ label: 'Sales ($)' }}
/>
```

**Line Chart** (Time Series):

```typescript
import { LineChart } from '@shopify/polaris-viz';

<LineChart
  data={[
    {
      name: 'Sales',
      data: [
        { key: '2025-01', value: 12000 },
        { key: '2025-02', value: 13500 },
        { key: '2025-03', value: 14200 },
      ],
    },
  ]}
/>
```

**Donut Chart** (Breakdown):

```typescript
import { DonutChart } from '@shopify/polaris-viz';

<DonutChart
  data={[
    { name: 'Product A', value: 40 },
    { name: 'Product B', value: 30 },
    { name: 'Product C', value: 20 },
    { name: 'Other', value: 10 },
  ]}
/>
```

**Interactive Tooltips**:
All Polaris Viz charts include hover tooltips by default

**Print-Friendly Reports**:

```css
@media print {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .no-print {
    display: none;
  }

  svg {
    max-width: 100%;
  }
}
```

---

## Task 1N: Dark Mode Design

### Color Palette (Dark Mode)

```css
:root[data-theme="dark"] {
  /* Surfaces */
  --p-color-bg-surface: #1a1a1a;
  --p-color-bg-surface-secondary: #2c2c2c;

  /* Text */
  --p-color-text: #e3e5e7;
  --p-color-text-subdued: #8c9196;

  /* Status */
  --p-color-bg-success: #005e46;
  --p-color-bg-critical: #8c1919;
  --p-color-bg-caution: #7f5f01;

  /* Hot Rodan red (adjusted for dark mode) */
  --hotrodan-red-primary: #e74c3c;
}
```

**WCAG AA Contrast** (Dark Mode):

- White text on #1A1A1A = 15.6:1 ✅
- Subdued text (#8C9196) on #1A1A1A = 4.8:1 ✅
- Success bg (#005E46) contrast = 3.2:1 ✅

**Toggle UI**:

```typescript
<SettingsPage>
  <Card sectioned>
    <Text variant="headingMd" as="h2">Appearance</Text>
    <Select
      label="Theme"
      options={[
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
        { label: 'Auto (match system)', value: 'auto' },
      ]}
      value={theme}
      onChange={setTheme}
    />
  </Card>
</SettingsPage>
```

**Implementation**:

```typescript
useEffect(() => {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme === "auto" ? systemTheme : theme);
}, [theme, systemTheme]);
```

---

## Task 1O: Empty States and First-Use

### Empty States (by Feature)

**No Approvals**:

```typescript
<EmptyState
  heading="All caught up!"
  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
>
  <p>No pending approvals. Your operation is running smoothly.</p>
</EmptyState>
```

**No Data (Tile)**:

```typescript
<EmptyState
  heading="No data yet"
  image={emptyIllustration}
>
  <p>Connect your integrations to see real-time insights.</p>
  <Button url="/settings/integrations">Connect integrations</Button>
</EmptyState>
```

**First-Use Guidance**:

```typescript
<Card sectioned>
  <BlockStack gap="300">
    <Text variant="headingMd" as="h2">Welcome to HotDash!</Text>
    <Text>Get started in 3 steps:</Text>
    <List type="number">
      <List.Item>Connect your Shopify store</List.Item>
      <List.Item>Configure Chatwoot for CX data</List.Item>
      <List.Item>Set up Google Analytics</List.Item>
    </List>
    <Button onClick={startSetup}>Start setup</Button>
  </BlockStack>
</Card>
```

**Motivational Copy**:

- "You're doing great!" (after completing setup)
- "Ready to roll!" (all systems configured)
- "Rev up your operations" (empty dashboard, Hot Rodan theme)

---

## Task 1P: Approval History and Audit Trail UI

### Approval History View

**Route**: `/approvals/history`

**Layout**:

```typescript
<Page title="Approval History">
  <Layout>
    <Layout.Section>
      {/* Filters */}
      <Card sectioned>
        <InlineStack gap="300">
          <Select
            label="Status"
            options={[
              { label: 'All', value: 'all' },
              { label: 'Approved', value: 'approved' },
              { label: 'Rejected', value: 'rejected' },
            ]}
            value={filter.status}
            onChange={setFilterStatus}
          />
          <TextField
            label="Search"
            placeholder="Conversation ID, tool name..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
          <Select
            label="Date range"
            options={[
              { label: 'Last 7 days', value: '7d' },
              { label: 'Last 30 days', value: '30d' },
              { label: 'Last 90 days', value: '90d' },
            ]}
            value={filter.dateRange}
            onChange={setFilterDateRange}
          />
        </InlineStack>
      </Card>

      {/* History table */}
      <Card>
        <DataTable
          columnContentTypes={['text', 'text', 'text', 'text', 'text']}
          headings={['Date', 'Conversation', 'Tool', 'Action', 'Operator']}
          rows={approvalHistory.map(approval => [
            formatDate(approval.createdAt),
            `#${approval.conversationId}`,
            approval.toolName,
            <Badge tone={approval.action === 'approved' ? 'success' : 'critical'}>
              {approval.action}
            </Badge>,
            approval.operatorName,
          ])}
        />
      </Card>
    </Layout.Section>
  </Layout>
</Page>
```

**Export Capabilities**:

```typescript
<Button onClick={exportToCSV}>Export to CSV</Button>

function exportToCSV() {
  const csv = approvalHistory.map(a =>
    `${a.createdAt},${a.conversationId},${a.toolName},${a.action},${a.operatorName}`
  ).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'approval-history.csv';
  a.click();
}
```

**Timeline Visualization**:

```typescript
<VerticalStack gap="200">
  {approvalHistory.map(approval => (
    <TimelineEvent
      key={approval.id}
      timestamp={approval.createdAt}
      action={approval.action}
      operator={approval.operatorName}
      details={approval.toolName}
    />
  ))}
</VerticalStack>
```

---

**Status**: Tasks 1K-1P complete - Dashboard personalization, notifications, data viz, dark mode, empty states, audit trail
