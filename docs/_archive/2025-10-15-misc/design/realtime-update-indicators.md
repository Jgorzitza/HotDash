---
epoch: 2025.10.E1
doc: docs/design/realtime-update-indicators.md
owner: designer
created: 2025-10-12
---

# Task 1C: Real-Time Update Indicators

## Purpose
Design visual indicators for real-time updates in the approval queue, including new approval notifications, update animations, timestamp refresh, and connection status.

## 1. New Approval Notification Badge

### Navigation Badge (Pending Count)
```typescript
<Navigation>
  <Navigation.Item
    url="/approvals"
    label="Approvals"
    badge={pendingCount > 0 ? String(pendingCount) : undefined}
    selected={location.pathname === '/approvals'}
  />
</Navigation>
```

**Visual**: Red badge with white text showing count
**Behavior**: 
- Shows count when > 0
- Hides when count = 0
- Updates in real-time as approvals arrive
**Accessibility**: Badge content announced to screen readers

### Page Title Badge
```typescript
<Page
  title="Approval Queue"
  titleMetadata={pendingCount > 0 && <Badge tone="attention">{pendingCount}</Badge>}
/>
```

**Visual**: Orange/yellow badge next to page title
**Updates**: Real-time as count changes
**Tone**: "attention" (not critical, but needs action)

### New Approval Toast (Optional Enhancement)
```typescript
// When new approval arrives while on page
<Toast
  content={`New approval for conversation #${conversationId}`}
  action={{
    content: 'View',
    onAction: () => scrollToApproval(approvalId),
  }}
  duration={5000}
/>
```

**Visual**: Toast notification at bottom of screen
**Duration**: 5 seconds (auto-dismiss)
**Action**: "View" button scrolls to new approval
**Sound**: Optional notification sound (muted by default)

---

## 2. Update Animation

### New Approval Entry Animation
```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.new-approval-card {
  animation: slideIn 0.3s ease-out;
}
```

**Visual**: Card slides in from top with fade
**Duration**: 300ms
**Easing**: ease-out (starts fast, ends slow)
**Accessibility**: Respects `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  .new-approval-card {
    animation: none;
    /* Just fade in, no motion */
    animation: fadeIn 0.2s ease;
  }
}
```

### Approved/Rejected Exit Animation
```css
@keyframes slideOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

.removing-approval-card {
  animation: slideOut 0.2s ease-in forwards;
}
```

**Visual**: Card fades out and slightly scales down
**Duration**: 200ms
**Timing**: After approve/reject action succeeds
**Removal**: Card removed from DOM after animation completes

### Highlight Flash (Updated Item)
```css
@keyframes highlight {
  0% { background-color: var(--p-color-bg-surface); }
  50% { background-color: var(--p-color-bg-success-subdued); }
  100% { background-color: var(--p-color-bg-surface); }
}

.updated-approval-card {
  animation: highlight 1s ease;
}
```

**Visual**: Card briefly flashes light green
**Use case**: When existing approval updates (rare)
**Duration**: 1 second
**Accessibility**: Color change only (no motion)

---

## 3. Timestamp Refresh Indicator

### Relative Time Display
```typescript
import { formatDistanceToNow } from 'date-fns';

<Text variant="bodySm" tone="subdued">
  {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
</Text>
```

**Visual**: "2 minutes ago", "5 hours ago", etc.
**Updates**: Every 30 seconds (not every second - too noisy)
**Library**: `date-fns` for formatting

### Implementation
```typescript
const [relativeTime, setRelativeTime] = useState('');

useEffect(() => {
  const updateTime = () => {
    setRelativeTime(
      formatDistanceToNow(new Date(createdAt), { addSuffix: true })
    );
  };
  
  updateTime(); // Initial
  const interval = setInterval(updateTime, 30000); // Every 30s
  
  return () => clearInterval(interval);
}, [createdAt]);
```

### Hover for Absolute Time (Tooltip)
```typescript
<Tooltip content={new Date(createdAt).toLocaleString()}>
  <Text variant="bodySm" tone="subdued">
    {relativeTime}
  </Text>
</Tooltip>
```

**Visual**: Tooltip shows full timestamp on hover
**Example**: "10/12/2025, 3:45:23 PM"
**Accessibility**: Full timestamp in aria-label

### Refresh Animation (Subtle)
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.timestamp-updating {
  animation: pulse 0.5s ease;
}
```

**Visual**: Timestamp briefly pulses when updating
**Duration**: 500ms
**Frequency**: Every 30s when timestamp text changes

---

## 4. Connection Status Indicator

### Online Status (Normal Operation)
```typescript
// No indicator needed - default state
// Only show indicator when offline or connecting
```

**Visual**: No indicator (clean UI)
**Rationale**: Don't clutter UI when everything works

### Offline Status (Network Lost)
```typescript
<Banner tone="critical">
  <InlineStack gap="200" blockAlign="center">
    <Icon source={AlertCircleIcon} />
    <Text>You're offline. Reconnecting...</Text>
  </InlineStack>
</Banner>
```

**Visual**: Red banner at top of page
**Icon**: Alert circle icon
**Auto-hide**: When connection restored
**Retry**: Automatic reconnection attempts every 5s

### Connecting Status (Reconnecting)
```typescript
<Banner tone="info">
  <InlineStack gap="200" blockAlign="center">
    <Spinner size="small" />
    <Text>Reconnecting to server...</Text>
  </InlineStack>
</Banner>
```

**Visual**: Blue banner with spinner
**Duration**: While attempting to reconnect
**Success**: Banner disappears when connected

### Connection Restored (Success Message)
```typescript
<Toast
  content="Connection restored"
  duration={3000}
/>
```

**Visual**: Toast notification (brief)
**Duration**: 3 seconds
**Tone**: Success (green)
**Purpose**: Reassure operator that connection is back

### Status in Header (Alternative)
```typescript
<div style={{
  position: 'fixed',
  top: 8,
  right: 8,
  zIndex: 1000,
}}>
  <Badge tone={isOnline ? 'success' : 'critical'}>
    {isOnline ? 'Connected' : 'Offline'}
  </Badge>
</div>
```

**Visual**: Small badge in top-right corner
**Always visible**: Yes (unlike banner which can be dismissed)
**Color**: Green (online) or red (offline)

---

## 5. Auto-Refresh Indicator

### Refresh Progress Bar (Subtle)
```typescript
<div style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: '2px',
  backgroundColor: 'var(--p-color-bg-fill-success)',
  transform: `scaleX(${refreshProgress})`,
  transformOrigin: 'left',
  transition: 'transform 5s linear',
  zIndex: 1000,
}}>
</div>
```

**Visual**: Thin green bar at very top of page
**Animation**: Grows from 0 to 100% over 5 seconds
**Resets**: Every 5 seconds (auto-refresh interval)
**Accessibility**: Hidden from screen readers (decorative only)

### Last Updated Timestamp
```typescript
<Text variant="bodySm" tone="subdued">
  Last updated: {formatTime(lastRefresh)}
</Text>
```

**Visual**: Small text at bottom of page
**Updates**: Every 5 seconds after refresh
**Format**: "3:45 PM" (time only, not date)

### Manual Refresh Button
```typescript
<Button
  plain
  icon={RefreshIcon}
  onClick={handleRefresh}
  loading={isRefreshing}
  accessibilityLabel="Refresh approvals"
>
  Refresh
</Button>
```

**Visual**: Icon button (refresh circle icon)
**Location**: Top-right of page, next to title
**Behavior**: Triggers immediate refresh
**Loading**: Shows spinner while refreshing

---

## 6. Loading Transitions (Optimistic Updates)

### Optimistic Approve (Instant Feedback)
```typescript
// 1. Immediately mark as approved (optimistic)
const optimisticApproval = { ...approval, status: 'approved' };
setApprovals(approvals.map(a => a.id === approval.id ? optimisticApproval : a));

// 2. Send request
const response = await fetch(`/approvals/${id}/approve`, { method: 'POST' });

// 3. If fails, revert
if (!response.ok) {
  setApprovals(originalApprovals);
  showError('Failed to approve. Please try again.');
}

// 4. If succeeds, remove from queue after animation
setTimeout(() => {
  setApprovals(approvals.filter(a => a.id !== approval.id));
}, 300); // Match exit animation duration
```

**Visual**: Card immediately shows "Approved" state, then animates out
**Benefit**: Feels instant (no waiting for API)
**Fallback**: Reverts if API fails

### Approved State Visual
```typescript
<Card>
  <BlockStack gap="300">
    <InlineStack gap="200" blockAlign="center">
      <Icon source={CheckCircleIcon} tone="success" />
      <Text variant="headingMd" tone="success">Approved</Text>
    </InlineStack>
    <Text>This approval is being processed...</Text>
  </BlockStack>
</Card>
```

**Visual**: Green checkmark, "Approved" text
**Duration**: Visible for 300ms before exit animation
**Purpose**: Immediate visual feedback

---

## 7. Batch Update Indicators

### Multiple New Approvals (Batch)
```typescript
<Toast
  content={`${newCount} new approvals arrived`}
  action={{
    content: 'View',
    onAction: scrollToTop,
  }}
/>
```

**Visual**: Toast with count
**Behavior**: Single toast for batch (not one per approval)
**Action**: Scrolls to top where new approvals appear

### Refreshing All Approvals
```typescript
<div style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: '4px',
  backgroundColor: 'var(--p-color-bg-fill-info)',
  animation: 'shimmer 1s infinite',
}}>
</div>

@keyframes shimmer {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}
```

**Visual**: Pulsing blue bar at top
**Duration**: While refresh in progress
**Purpose**: Show system is working

---

## Implementation Checklist

✅ **Badge**: Pending count in navigation, updates real-time
✅ **Animations**: Slide in (new), slide out (removed), highlight (updated)
✅ **Timestamps**: Relative time ("2 min ago"), updates every 30s, tooltip for absolute time
✅ **Connection status**: Banner for offline/reconnecting, toast for restored, badge in header
✅ **Auto-refresh**: Progress bar, last updated timestamp, manual refresh button
✅ **Optimistic updates**: Immediate feedback, revert on error
✅ **Accessibility**: All animations respect prefers-reduced-motion

**Evidence**: Complete real-time update indicator specification

