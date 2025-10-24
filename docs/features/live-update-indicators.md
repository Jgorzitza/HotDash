# Live Update Indicators

**Task:** ENG-075  
**Status:** Implemented  
**Last Updated:** 2025-01-24

## Overview

Live update indicators provide real-time feedback to users about tile data freshness, refresh status, and auto-refresh progress. All tiles support these features through the `TileCard` component and `TileRefreshIndicator`.

## Features

### 1. Pulse Animation on Refresh

When a tile is refreshing, a subtle pulse animation indicates activity:

```tsx
<TileCard
  title="Sales Pulse"
  tile={salesData}
  render={(data) => <SalesPulseTile {...data} />}
  isRefreshing={isRefreshing}
  showRefreshIndicator={true}
/>
```

**Animation:** Rotating refresh icon (↻) with smooth 1s rotation

### 2. "Updated X Ago" Timestamp

Displays how long ago the tile data was last updated:

- "Just now" (< 5 seconds)
- "15s ago" (< 1 minute)
- "5m ago" (< 1 hour)
- "2h ago" (< 1 day)
- "3d ago" (≥ 1 day)

**Updates:** Every second for accurate time display

### 3. Auto-Refresh Progress Bar

Visual indicator showing progress until next auto-refresh:

```tsx
<TileCard
  title="Approvals Queue"
  tile={approvalsData}
  render={(data) => <ApprovalsQueueTile {...data} />}
  autoRefreshInterval={30} // 30 seconds
  showRefreshIndicator={true}
/>
```

**Progress:** Fills from 0% to 100% over the refresh interval

### 4. Manual Refresh Button

Allows users to manually trigger a tile refresh:

```tsx
const [isRefreshing, setIsRefreshing] = useState(false);

const handleRefresh = async () => {
  setIsRefreshing(true);
  await refetchTileData();
  setIsRefreshing(false);
};

<TileCard
  title="Inventory Heatmap"
  tile={inventoryData}
  render={(data) => <InventoryHeatmapTile {...data} />}
  onRefresh={handleRefresh}
  isRefreshing={isRefreshing}
  showRefreshIndicator={true}
/>
```

**Behavior:**
- Disabled while refreshing
- Shows rotating icon during refresh
- Re-enables after refresh completes

## Components

### TileRefreshIndicator

**Location:** `app/components/realtime/TileRefreshIndicator.tsx`

**Props:**
```typescript
interface TileRefreshIndicatorProps {
  lastUpdated: string | Date;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  autoRefreshInterval?: number; // in seconds
}
```

**Features:**
- Live timestamp updates
- Pulse animation during refresh
- Progress bar for auto-refresh
- Manual refresh button

### TileCard

**Location:** `app/components/tiles/TileCard.tsx`

**Props:**
```typescript
interface TileCardProps<T> {
  title: string;
  tile: TileState<T>;
  render: (data: T) => ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  autoRefreshInterval?: number;
  showRefreshIndicator?: boolean;
}
```

**Usage:**
```tsx
<TileCard
  title="Sales Pulse"
  tile={salesData}
  render={(data) => <SalesPulseTile {...data} />}
  onRefresh={handleRefresh}
  isRefreshing={isRefreshing}
  autoRefreshInterval={60}
  showRefreshIndicator={true}
/>
```

## Auto-Refresh Intervals

Different tiles have different refresh intervals based on data volatility:

| Tile Type | Interval | Reason |
|-----------|----------|--------|
| Approvals Queue | 30s | Real-time updates needed |
| Unread Messages | 30s | Real-time updates needed |
| CX Escalations | 30s | Real-time updates needed |
| Sales Pulse | 1min | Frequent updates |
| Ops Metrics | 1min | Frequent updates |
| Fulfillment Health | 1min | Frequent updates |
| Inventory Heatmap | 5min | Moderate updates |
| SEO Content | 5min | Moderate updates |
| Social Performance | 5min | Moderate updates |
| Ads ROAS | 5min | Moderate updates |
| SEO Impact | 15min | Slow updates |
| Growth Metrics | 15min | Slow updates |
| Growth Engine Analytics | 15min | Slow updates |
| Idea Pool | Never | Static content |
| CEO Agent | Never | Static content |

**Configure in:** `app/services/realtime.server.ts`

## Server-Sent Events (SSE)

### SSE Endpoint

**Route:** `/api/sse/updates`

**Events:**
- `approval-update` - Approval queue count changes
- `tile-refresh` - Tile data updated
- `system-status` - System health changes
- `heartbeat` - Keep-alive (every 30s)

### useSSE Hook

**Location:** `app/hooks/useSSE.ts`

**Usage:**
```tsx
import { useSSE } from '~/hooks/useSSE';

function Dashboard() {
  const { status, lastMessage, isConnected } = useSSE('/api/sse/updates');
  
  useEffect(() => {
    if (lastMessage?.type === 'tile-refresh') {
      // Refresh specific tile
      refetchTile(lastMessage.data.tileId);
    }
  }, [lastMessage]);
  
  return (
    <div>
      <ConnectionIndicator status={status} />
      {/* Tiles */}
    </div>
  );
}
```

**Features:**
- Auto-reconnection with exponential backoff
- Connection quality monitoring
- Event type filtering
- Cleanup on unmount
- Pauses when tab hidden (saves resources)

## Implementation Guide

### Step 1: Enable Refresh Indicator

```tsx
<TileCard
  title="Your Tile"
  tile={tileData}
  render={(data) => <YourTile {...data} />}
  showRefreshIndicator={true} // Enable indicator
/>
```

### Step 2: Add Manual Refresh

```tsx
const [isRefreshing, setIsRefreshing] = useState(false);

const handleRefresh = async () => {
  setIsRefreshing(true);
  try {
    const newData = await fetchTileData();
    setTileData(newData);
  } finally {
    setIsRefreshing(false);
  }
};

<TileCard
  title="Your Tile"
  tile={tileData}
  render={(data) => <YourTile {...data} />}
  onRefresh={handleRefresh}
  isRefreshing={isRefreshing}
  showRefreshIndicator={true}
/>
```

### Step 3: Add Auto-Refresh

```tsx
<TileCard
  title="Your Tile"
  tile={tileData}
  render={(data) => <YourTile {...data} />}
  onRefresh={handleRefresh}
  isRefreshing={isRefreshing}
  autoRefreshInterval={300} // 5 minutes
  showRefreshIndicator={true}
/>
```

### Step 4: Connect to SSE (Optional)

```tsx
import { useSSE } from '~/hooks/useSSE';

function YourComponent() {
  const { lastMessage } = useSSE('/api/sse/updates');
  
  useEffect(() => {
    if (lastMessage?.type === 'tile-refresh' && lastMessage.data.tileId === 'your-tile') {
      handleRefresh();
    }
  }, [lastMessage]);
  
  // Rest of component
}
```

## Animations

### Pulse Animation

**CSS:**
```css
@keyframes occ-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.occ-refreshing {
  animation: occ-pulse 2s ease-in-out infinite;
}
```

### Rotate Animation

**CSS:**
```css
@keyframes occ-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.occ-rotating {
  animation: occ-rotate 1s linear infinite;
}
```

### Progress Bar Animation

**CSS:**
```css
.occ-progress-bar {
  transition: width 1s linear;
}
```

## Best Practices

### ✅ DO

- Enable refresh indicators for all data tiles
- Use appropriate auto-refresh intervals
- Disable refresh button while refreshing
- Show visual feedback during refresh
- Handle refresh errors gracefully
- Pause auto-refresh when tab hidden

### ❌ DON'T

- Auto-refresh too frequently (< 30s)
- Refresh static content tiles
- Block UI during refresh
- Ignore SSE connection errors
- Refresh all tiles simultaneously

## Accessibility

### ARIA Labels

```tsx
<button
  onClick={onRefresh}
  aria-label="Refresh tile"
  aria-busy={isRefreshing}
>
  ↻
</button>
```

### Screen Reader Announcements

```tsx
<div role="status" aria-live="polite">
  {isRefreshing ? 'Refreshing...' : `Updated ${timeAgo}`}
</div>
```

### Keyboard Navigation

- Refresh button is keyboard accessible
- Focus visible on refresh button
- Enter/Space triggers refresh

## Performance

### Optimization Tips

1. **Debounce manual refreshes** - Prevent rapid clicking
2. **Cancel in-flight requests** - When new refresh triggered
3. **Use stale-while-revalidate** - Show old data while fetching
4. **Batch SSE events** - Process multiple events together
5. **Lazy load tiles** - Only refresh visible tiles

### Monitoring

Track these metrics:
- Average refresh time per tile
- SSE connection uptime
- Auto-refresh success rate
- Manual refresh frequency

## Troubleshooting

### Refresh Indicator Not Showing

**Check:**
- `showRefreshIndicator={true}` prop set
- `tile.fact` exists with `createdAt` timestamp
- Component is using `TileCard` wrapper

### Auto-Refresh Not Working

**Check:**
- `autoRefreshInterval` prop set (in seconds)
- `onRefresh` handler provided
- No errors in refresh handler
- Tile is visible (auto-refresh pauses when hidden)

### SSE Connection Failing

**Check:**
- `/api/sse/updates` route accessible
- No CORS issues
- Browser supports EventSource
- Network not blocking SSE

## References

- TileRefreshIndicator: `app/components/realtime/TileRefreshIndicator.tsx`
- TileCard: `app/components/tiles/TileCard.tsx`
- useSSE Hook: `app/hooks/useSSE.ts`
- SSE Route: `app/routes/api.sse.updates.ts`
- Realtime Service: `app/services/realtime.server.ts`
- Task: ENG-075 in TaskAssignment table

