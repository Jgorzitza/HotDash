---
epoch: 2025.10.E1
doc: docs/design/approval-queue-edge-states.md
owner: designer
created: 2025-10-11
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-25
---

# Approval Queue - Edge States & Error Recovery UI

**Status**: Ready for Engineer Implementation  
**Polaris Version**: Latest  
**Target**: Complete edge case coverage for production reliability

---

## Table of Contents

1. [Loading States](#loading-states)
2. [Error States](#error-states)
3. [Empty States](#empty-states)
4. [Timeout & Expiration](#timeout--expiration)
5. [Conflict States](#conflict-states)
6. [Network Recovery](#network-recovery)

---

## 1. Loading States

### 1.1 Initial Page Load

**Scenario**: User navigates to `/app/approvals` for the first time

**Visual Design**:

```
┌─────────────────────────────────────────────────────────┐
│ Approval Queue                                    [Nav] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [Skeleton: Stats bar with 4 metric placeholders]      │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ [SkeletonDisplayText: small]                    │   │
│ │ [SkeletonBodyText: 3 lines]                     │   │
│ │ [SkeletonBodyText: 2 lines]                     │   │
│ │ [Skeleton: 2 button shapes]                     │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ [SkeletonDisplayText: small]                    │   │
│ │ [SkeletonBodyText: 3 lines]                     │   │
│ │ [SkeletonBodyText: 2 lines]                     │   │
│ │ [Skeleton: 2 button shapes]                     │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Implementation (Polaris)**:

```typescript
import { Page, Layout, Card, SkeletonBodyText, SkeletonDisplayText, BlockStack } from '@shopify/polaris';

function ApprovalQueueSkeleton() {
  return (
    <Page title="Approval Queue">
      <Layout>
        <Layout.Section>
          {/* Stats Skeleton */}
          <Card>
            <InlineStack gap="600">
              <Box width="150px">
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText lines={1} />
              </Box>
              <Box width="150px">
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText lines={1} />
              </Box>
              <Box width="150px">
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText lines={1} />
              </Box>
            </InlineStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <BlockStack gap="400">
            <ApprovalCardSkeleton />
            <ApprovalCardSkeleton />
            <ApprovalCardSkeleton />
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function ApprovalCardSkeleton() {
  return (
    <Card>
      <BlockStack gap="400">
        <SkeletonDisplayText size="small" />
        <SkeletonBodyText lines={3} />
        <SkeletonBodyText lines={2} />
        <InlineStack gap="200">
          <Box width="140px" height="36px">
            <SkeletonBodyText lines={1} />
          </Box>
          <Box width="100px" height="36px">
            <SkeletonBodyText lines={1} />
          </Box>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
```

### 1.2 Background Refresh (Polling)

**Scenario**: Page is polling for new approvals every 5 seconds

**Visual Design**:

- Small spinner in page title area
- No full skeleton (existing cards remain visible)
- Subtle visual indicator

```typescript
<Page
  title="Approval Queue"
  titleMetadata={isRevalidating && <Spinner size="small" />}
  subtitle={`${pendingCount} pending`}
>
  {/* Content */}
</Page>
```

### 1.3 Action In Progress

**Scenario**: User clicks "Approve & Execute" or "Reject"

**Visual Design**:

- Button shows spinner
- Button text changes to "Approving..." or "Rejecting..."
- Other buttons disabled
- Card slightly dimmed (opacity 0.7)

```typescript
<Card>
  <Box opacity={state === 'approving' || state === 'rejecting' ? '0.7' : '1'}>
    <BlockStack gap="400">
      {/* Content */}

      <ButtonGroup>
        <Button
          variant="primary"
          loading={state === 'approving'}
          disabled={state !== 'pending'}
          onClick={handleApprove}
        >
          {state === 'approving' ? 'Approving...' : 'Approve & Execute'}
        </Button>
        <Button
          loading={state === 'rejecting'}
          disabled={state !== 'pending'}
          onClick={handleReject}
          tone="critical"
        >
          {state === 'rejecting' ? 'Rejecting...' : 'Reject'}
        </Button>
      </ButtonGroup>
    </BlockStack>
  </Box>
</Card>
```

---

## 2. Error States

### 2.1 Network Connection Lost

**Scenario**: User's internet connection drops

**Visual Design**:

```
┌─────────────────────────────────────────────────────────┐
│ Approval Queue                               🔴 Offline │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌───────────────────────────────────────────────────┐ │
│ │ ⚠ Connection Lost                             [×] │ │
│ │                                                   │ │
│ │ You are currently offline. Your approvals are     │ │
│ │ safe and will automatically sync when your        │ │
│ │ connection is restored.                           │ │
│ │                                                   │ │
│ │ [Retry Connection]                                │ │
│ └───────────────────────────────────────────────────┘ │
│                                                         │
│ [Existing approvals shown but disabled]                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Implementation**:

```typescript
import { Banner, Button, Page } from '@shopify/polaris';

// Detect online/offline status
const [isOnline, setIsOnline] = useState(navigator.onLine);

useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);

// Show offline banner
{!isOnline && (
  <Banner
    tone="warning"
    title="Connection Lost"
    action={{ content: 'Retry Connection', onAction: () => revalidator.revalidate() }}
  >
    <Text variant="bodyMd">
      You are currently offline. Your approvals are safe and will automatically
      sync when your connection is restored.
    </Text>
  </Banner>
)}

// Disable all approval cards when offline
<ApprovalCard
  action={approval}
  onApprove={handleApprove}
  onReject={handleReject}
  isProcessing={!isOnline || revalidator.state === 'loading'}
/>
```

### 2.2 API Service Unavailable (500/503)

**Scenario**: Agent service is down or overloaded

**Visual Design**:

```
┌─────────────────────────────────────────────────────────┐
│                     ⚠                                   │
│                                                         │
│       Approval Service Temporarily Unavailable          │
│                                                         │
│  Our team has been notified and is working to restore  │
│  service. Please try again in a few moments.            │
│                                                         │
│  Your pending approvals are safe and will reload        │
│  automatically.                                         │
│                                                         │
│  Error ID: srv-503-20251011T1700                       │
│  Last successful sync: 2 minutes ago                    │
│                                                         │
│      [Retry Now]        [Contact Support]               │
└─────────────────────────────────────────────────────────┘
```

**Implementation**:

```typescript
function ServiceUnavailableState({
  errorId,
  lastSync,
  onRetry
}: {
  errorId: string;
  lastSync: Date;
  onRetry: () => void;
}) {
  return (
    <EmptyState
      heading="Approval Service Temporarily Unavailable"
      image="https://cdn.shopify.com/s/files/error-illustrations/service-unavailable.svg"
    >
      <BlockStack gap="400">
        <Text variant="bodyMd" alignment="center">
          Our team has been notified and is working to restore service.
          Please try again in a few moments.
        </Text>
        <Text variant="bodyMd" alignment="center">
          Your pending approvals are safe and will reload automatically.
        </Text>
        <Text variant="bodySm" tone="subdued" alignment="center">
          Error ID: {errorId}
        </Text>
        <Text variant="bodySm" tone="subdued" alignment="center">
          Last successful sync: {formatRelativeTime(lastSync)}
        </Text>
        <ButtonGroup>
          <Button onClick={onRetry}>Retry Now</Button>
          <Button url="mailto:customer.support@hotrodan.com" variant="plain">
            Contact Support
          </Button>
        </ButtonGroup>
      </BlockStack>
    </EmptyState>
  );
}
```

### 2.3 Unauthorized / Permissions Error

**Scenario**: User doesn't have permission to approve actions

**Visual Design**:

```
┌─────────────────────────────────────────────────────────┐
│                     🔒                                  │
│                                                         │
│           Insufficient Permissions                      │
│                                                         │
│  Your account does not have permission to approve       │
│  agent actions. Contact your administrator to request   │
│  access.                                                │
│                                                         │
│  Required role: Operator or Manager                     │
│  Your role: Viewer                                      │
│                                                         │
│      [Contact Administrator]                            │
└─────────────────────────────────────────────────────────┘
```

**Implementation**:

```typescript
function UnauthorizedState({ userRole }: { userRole: string }) {
  return (
    <EmptyState
      heading="Insufficient Permissions"
      image="https://cdn.shopify.com/s/files/error-illustrations/unauthorized.svg"
    >
      <BlockStack gap="300">
        <Text variant="bodyMd" alignment="center">
          Your account does not have permission to approve agent actions.
          Contact your administrator to request access.
        </Text>
        <Box background="bg-surface-secondary" padding="300" borderRadius="200">
          <BlockStack gap="200">
            <Text variant="bodySm" fontWeight="semibold">
              Required role: Operator or Manager
            </Text>
            <Text variant="bodySm">
              Your role: {userRole}
            </Text>
          </BlockStack>
        </Box>
        <Button
          url="mailto:customer.support@hotrodan.com?subject=Request Approval Queue Access"
        >
          Contact Administrator
        </Button>
      </BlockStack>
    </EmptyState>
  );
}
```

### 2.4 Already Processed

**Scenario**: Another operator approved/rejected while user had page open

**Visual Design**:

```
┌─────────────────────────────────────────────────────────┐
│ Agent Proposal                    [PROCESSED]      [×] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ℹ This approval was already processed by another       │
│   operator.                                             │
│                                                         │
│ Processed by: jamie@hotrodan.com                        │
│ Action taken: Approved                                  │
│ Timestamp: 30 seconds ago                               │
│                                                         │
│ [Dismiss]                                               │
└─────────────────────────────────────────────────────────┘
```

**Implementation**:

```typescript
{state === 'already_processed' && (
  <Card>
    <BlockStack gap="400">
      <InlineStack align="space-between">
        <Text variant="headingMd" as="h2">Agent Proposal</Text>
        <Badge>PROCESSED</Badge>
      </InlineStack>

      <Banner tone="info">
        <BlockStack gap="200">
          <Text variant="bodyMd">
            This approval was already processed by another operator.
          </Text>
          {metadata?.processedBy && (
            <Text variant="bodySm" tone="subdued">
              Processed by: {metadata.processedBy}
            </Text>
          )}
          {metadata?.actionTaken && (
            <Text variant="bodySm" tone="subdued">
              Action taken: {metadata.actionTaken}
            </Text>
          )}
          {metadata?.processedAt && (
            <Text variant="bodySm" tone="subdued">
              Timestamp: {formatRelativeTime(new Date(metadata.processedAt))}
            </Text>
          )}
        </BlockStack>
      </Banner>

      <Button onClick={() => onRemove?.(action.id)}>
        Dismiss
      </Button>
    </BlockStack>
  </Card>
)}
```

---

## 3. Empty States

### 3.1 No Pending Approvals (Success)

**Scenario**: All approvals processed, queue is empty

**Visual Design**:

```
┌─────────────────────────────────────────────────────────┐
│ Approval Queue                                0 Pending │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                         ✓                               │
│                                                         │
│              All caught up!                             │
│                                                         │
│     There are no pending approvals at this time.        │
│     Agent actions are either approved or completed      │
│     without requiring approval.                         │
│                                                         │
│     Last approval processed: 12 minutes ago             │
│                                                         │
│              [View Recent History]                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Implementation**:

```typescript
import { EmptyState, Page } from '@shopify/polaris';

function NoApprovalsState({ lastProcessedTime }: { lastProcessedTime?: Date }) {
  return (
    <Page title="Approval Queue" subtitle="0 pending">
      <EmptyState
        heading="All caught up!"
        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
      >
        <BlockStack gap="400">
          <Text variant="bodyMd" alignment="center">
            There are no pending approvals at this time. Agent actions are
            either approved or completed without requiring approval.
          </Text>
          {lastProcessedTime && (
            <Text variant="bodySm" tone="subdued" alignment="center">
              Last approval processed: {formatRelativeTime(lastProcessedTime)}
            </Text>
          )}
          <Button url="/app/approvals/history">
            View Recent History
          </Button>
        </BlockStack>
      </EmptyState>
    </Page>
  );
}
```

### 3.2 No Approvals (New Installation)

**Scenario**: App just installed, no agent activity yet

**Visual Design**:

```
┌─────────────────────────────────────────────────────────┐
│ Approval Queue                                0 Pending │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                         🤖                              │
│                                                         │
│          Waiting for first agent activity               │
│                                                         │
│     Your AI agents will propose actions here when they  │
│     need human approval. You'll be able to review and   │
│     approve or reject each action.                      │
│                                                         │
│              [Learn About AI Agents]                    │
│              [View Agent Documentation]                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Implementation**:

```typescript
function FirstTimeEmptyState() {
  return (
    <EmptyState
      heading="Waiting for first agent activity"
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-apps.png"
    >
      <BlockStack gap="400">
        <Text variant="bodyMd" alignment="center">
          Your AI agents will propose actions here when they need human
          approval. You'll be able to review and approve or reject each action.
        </Text>
        <ButtonGroup>
          <Button url="/app/help/ai-agents">
            Learn About AI Agents
          </Button>
          <Button url="https://docs.hotrodan.com/ai-agents" external variant="plain">
            View Documentation
          </Button>
        </ButtonGroup>
      </BlockStack>
    </EmptyState>
  );
}
```

### 3.3 Filtered View Empty

**Scenario**: User applies filters and no approvals match

**Visual Design**:

```
┌─────────────────────────────────────────────────────────┐
│ Approval Queue                                0 Pending │
│                                                         │
│ Filters: [Agent: Order Support ×] [Risk: High ×]       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                         🔍                              │
│                                                         │
│         No approvals match your filters                 │
│                                                         │
│     Try adjusting your filters or clearing them to      │
│     see all pending approvals.                          │
│                                                         │
│              [Clear All Filters]                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Implementation**:

```typescript
function FilteredEmptyState({ activeFilters, onClearFilters }: {
  activeFilters: string[];
  onClearFilters: () => void;
}) {
  return (
    <EmptyState
      heading="No approvals match your filters"
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-search.png"
    >
      <BlockStack gap="400">
        <Text variant="bodyMd" alignment="center">
          Try adjusting your filters or clearing them to see all pending approvals.
        </Text>
        <Box>
          <InlineStack gap="200" wrap={false}>
            {activeFilters.map(filter => (
              <Badge key={filter}>{filter}</Badge>
            ))}
          </InlineStack>
        </Box>
        <Button onClick={onClearFilters}>
          Clear All Filters
        </Button>
      </BlockStack>
    </EmptyState>
  );
}
```

---

## 4. Timeout & Expiration

### 4.1 Approval Timeout Warning

**Scenario**: Approval has been pending for >15 minutes (configurable)

**Visual Design**:

```
┌─────────────────────────────────────────────────────────┐
│ 🤖 Agent Proposal · Expiring Soon           HIGH RISK │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ⏱ This approval will expire in 2 minutes               │
│                                                         │
│ Agent: Order Support Agent                              │
│ Action: chatwoot_send_public_reply                      │
│                                                         │
│ [Preview content...]                                    │
│                                                         │
│ [✓ Approve & Execute]  [✕ Reject]  [⏰ Extend Time]   │
└─────────────────────────────────────────────────────────┘
```

**Implementation**:

```typescript
function ApprovalCard({ action, ... }: ApprovalCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!action.timeoutSeconds) return;

    const calculateRemaining = () => {
      const elapsed = (Date.now() - new Date(action.timestamp).getTime()) / 1000;
      const remaining = action.timeoutSeconds! - elapsed;
      return Math.max(0, remaining);
    };

    setTimeRemaining(calculateRemaining());

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        setState('expired');
        onTimeout?.(action.id);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [action.timeoutSeconds, action.timestamp, onTimeout]);

  const isExpiringSoon = timeRemaining !== null && timeRemaining < 120; // 2 minutes

  return (
    <Card>
      <BlockStack gap="400">
        {/* Warning banner for expiring approvals */}
        {isExpiringSoon && timeRemaining > 0 && (
          <Banner tone="warning">
            <InlineStack gap="200" blockAlign="center">
              <Icon source={ClockIcon} />
              <Text variant="bodyMd">
                This approval will expire in {Math.floor(timeRemaining / 60)}m {Math.floor(timeRemaining % 60)}s
              </Text>
            </InlineStack>
          </Banner>
        )}

        {/* Card content */}

        <ButtonGroup>
          <Button variant="primary" onClick={handleApprove}>
            Approve & Execute
          </Button>
          <Button onClick={handleReject} tone="critical">
            Reject
          </Button>
          {isExpiringSoon && (
            <Button onClick={handleExtendTime} variant="plain">
              Extend Time
            </Button>
          )}
        </ButtonGroup>
      </BlockStack>
    </Card>
  );
}
```

### 4.2 Approval Expired

**Scenario**: Timeout reached, approval no longer valid

**Visual Design**:

```
┌─────────────────────────────────────────────────────────┐
│ 🤖 Agent Proposal · EXPIRED                  HIGH RISK │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ⏱ This approval has expired and is no longer valid     │
│                                                         │
│ The conversation may have progressed or the agent may   │
│ have taken alternative action. This approval cannot be  │
│ processed.                                              │
│                                                         │
│ Expired: 5 minutes ago                                  │
│ Original request: 20 minutes ago                        │
│                                                         │
│ [View Conversation]              [Dismiss]              │
└─────────────────────────────────────────────────────────┘
```

**Implementation**:

```typescript
{state === 'expired' && (
  <Card>
    <BlockStack gap="400">
      <InlineStack align="space-between">
        <Text variant="headingMd" as="h2">Agent Proposal</Text>
        <Badge tone="warning">EXPIRED</Badge>
      </InlineStack>

      <Banner tone="warning" title="This approval has expired">
        <BlockStack gap="200">
          <Text variant="bodyMd">
            The conversation may have progressed or the agent may have taken
            alternative action. This approval cannot be processed.
          </Text>
          <Text variant="bodySm" tone="subdued">
            Expired: {formatRelativeTime(expiryTime)}
          </Text>
          <Text variant="bodySm" tone="subdued">
            Original request: {formatRelativeTime(new Date(action.timestamp))}
          </Text>
        </BlockStack>
      </Banner>

      <ButtonGroup>
        <Button url={`/app/conversations/${action.conversationId}`}>
          View Conversation
        </Button>
        <Button onClick={() => onRemove?.(action.id)} variant="plain">
          Dismiss
        </Button>
      </ButtonGroup>
    </BlockStack>
  </Card>
)}
```

---

## 5. Conflict States

### 5.1 Stale Data Warning

**Scenario**: Local data is >1 minute old during active polling

**Visual Design**:

- Small banner at top of page
- Doesn't block interaction
- Auto-dismisses when data refreshes

```typescript
{dataStaleness > 60 && (
  <Banner
    tone="info"
    onDismiss={() => revalidator.revalidate()}
    action={{ content: 'Refresh Now', onAction: () => revalidator.revalidate() }}
  >
    <Text variant="bodyMd">
      This data is {Math.floor(dataStaleness / 60)} minute(s) old.
      New approvals may be available.
    </Text>
  </Banner>
)}
```

### 5.2 Concurrent Modification

**Scenario**: User tries to approve but action was just rejected by another operator

**Visual Design**:

```
┌─────────────────────────────────────────────────────────┐
│ 🤖 Agent Proposal                         [CONFLICT]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ⚠ Concurrent Modification Detected                     │
│                                                         │
│ This approval was modified by another operator while    │
│ you were reviewing it.                                  │
│                                                         │
│ Their action: Rejected                                  │
│ By: jamie@hotrodan.com                                  │
│ 5 seconds ago                                           │
│                                                         │
│ [Refresh Queue]                  [Dismiss]              │
└─────────────────────────────────────────────────────────┘
```

**Implementation**:

```typescript
// API returns 409 Conflict
const handleApprove = async () => {
  setState('approving');

  try {
    const response = await fetch(`/api/approvals/${action.id}/approve`, {
      method: 'POST',
    });

    if (response.status === 409) {
      // Conflict - already processed
      const conflict = await response.json();
      setState('conflict');
      setConflictData({
        action: conflict.actionTaken,
        by: conflict.processedBy,
        at: conflict.processedAt,
      });
      return;
    }

    // Handle success/other errors...
  } catch (error) {
    // Handle network errors...
  }
};

{state === 'conflict' && (
  <Banner tone="warning" title="Concurrent Modification Detected">
    <BlockStack gap="200">
      <Text variant="bodyMd">
        This approval was modified by another operator while you were reviewing it.
      </Text>
      {conflictData && (
        <>
          <Text variant="bodySm" tone="subdued">
            Their action: {conflictData.action}
          </Text>
          <Text variant="bodySm" tone="subdued">
            By: {conflictData.by}
          </Text>
          <Text variant="bodySm" tone="subdued">
            {formatRelativeTime(new Date(conflictData.at))}
          </Text>
        </>
      )}
    </BlockStack>
    <ButtonGroup>
      <Button onClick={() => revalidator.revalidate()}>
        Refresh Queue
      </Button>
      <Button onClick={() => onRemove?.(action.id)} variant="plain">
        Dismiss
      </Button>
    </ButtonGroup>
  </Banner>
)}
```

---

## 6. Network Recovery

### 6.1 Auto-Recovery Pattern

**Scenario**: Network recovers after being offline

**Visual Design**:

- Success toast notification
- Automatic data refresh
- No user action required

```typescript
import { useToast } from '@shopify/app-bridge-react';

function ApprovalQueue() {
  const [wasOffline, setWasOffline] = useState(false);
  const toast = useToast();
  const revalidator = useRevalidator();

  useEffect(() => {
    const handleOnline = () => {
      if (wasOffline) {
        toast.show('Connection restored. Refreshing approvals...');
        revalidator.revalidate();
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setWasOffline(true);
      toast.show('Connection lost. Working in offline mode.', { isError: true });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline, toast, revalidator]);

  return (/* ... */);
}
```

### 6.2 Retry with Exponential Backoff

**Scenario**: API requests fail, implement smart retry

```typescript
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");

      // Don't retry on 4xx errors (client errors)
      if (lastError.message.includes("HTTP 4")) {
        throw lastError;
      }

      // Exponential backoff: 1s, 2s, 4s
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

// Usage
const handleApprove = async () => {
  setState("approving");

  try {
    const result = await fetchWithRetry<ApprovalActionResult>(
      `/api/approvals/${action.id}/approve`,
      { method: "POST" },
    );

    if (result.success) {
      setState("approved");
    } else {
      setState("error");
      setErrorMessage(result.error);
    }
  } catch (error) {
    setState("error");
    setErrorMessage(
      "Unable to approve after multiple attempts. Please try again.",
    );
  }
};
```

### 6.3 Polling Failure Recovery

**Scenario**: Background polling fails repeatedly

**Visual Design**:

- Subtle banner (not full page error)
- Manual refresh option
- Shows last successful sync time

```typescript
const [consecutiveFailures, setConsecutiveFailures] = useState(0);
const [lastSuccessfulSync, setLastSuccessfulSync] = useState<Date>(new Date());

useEffect(() => {
  const interval = setInterval(async () => {
    try {
      await revalidator.revalidate();
      setConsecutiveFailures(0);
      setLastSuccessfulSync(new Date());
    } catch (error) {
      setConsecutiveFailures(prev => prev + 1);
    }
  }, 5000);

  return () => clearInterval(interval);
}, []);

// Show banner after 3 consecutive failures
{consecutiveFailures >= 3 && (
  <Banner
    tone="warning"
    title="Unable to fetch updates"
    action={{
      content: 'Retry Now',
      onAction: () => {
        setConsecutiveFailures(0);
        revalidator.revalidate();
      }
    }}
  >
    <Text variant="bodyMd">
      We're having trouble fetching the latest approvals.
      Last successful sync: {formatRelativeTime(lastSuccessfulSync)}
    </Text>
  </Banner>
)}
```

---

## 7. Edge Case Checklist

### Must Handle

- [ ] Initial page load (skeleton)
- [ ] Background refresh (subtle indicator)
- [ ] Button action loading (spinner on button)
- [ ] Network offline (connection lost banner)
- [ ] API 500/503 errors (service unavailable)
- [ ] API 401/403 errors (unauthorized)
- [ ] API 409 errors (already processed/conflict)
- [ ] Empty queue - success (all caught up)
- [ ] Empty queue - new installation (no activity yet)
- [ ] Empty queue - filtered (no matches)
- [ ] Approval timeout warning (expiring soon)
- [ ] Approval expired (cannot process)
- [ ] Concurrent modification (conflict)
- [ ] Auto-recovery after offline
- [ ] Retry with exponential backoff
- [ ] Polling failure (multiple attempts)
- [ ] Stale data warning (data >1 min old)

### Should Handle (Future)

- [ ] Bulk approval loading
- [ ] Pagination loading
- [ ] Search/filter loading
- [ ] Agent service degraded (slow responses)
- [ ] Rate limiting (429 errors)
- [ ] Session expired (redirect to login)

---

## 8. Error Message Guidelines

### Tone & Voice

**Principles**:

- **Clear**: Explain what happened in simple terms
- **Actionable**: Tell user what they can do
- **Reassuring**: Confirm their data/work is safe
- **Specific**: Include error IDs for support

**Good Examples**:

```
✓ "Unable to connect. Check your internet connection and try again."
✓ "This approval was already processed by another operator."
✓ "Service temporarily unavailable. Your approvals are safe."
✓ "Request timed out. The server took too long to respond."
```

**Bad Examples**:

```
✗ "Error 500"
✗ "Something went wrong"
✗ "Failed to process request"
✗ "Network error occurred"
```

### Error Message Templates

```typescript
const ERROR_TEMPLATES = {
  NETWORK: {
    title: "Connection Lost",
    message: "Unable to connect. Check your internet connection and try again.",
    action: "Retry",
  },
  TIMEOUT: {
    title: "Request Timed Out",
    message:
      "The server took too long to respond. This might be due to high load.",
    action: "Retry",
  },
  SERVER_ERROR: {
    title: "Service Temporarily Unavailable",
    message:
      "Our team has been notified. Your approvals are safe and will reload when service is restored.",
    action: "Retry in 30s",
  },
  UNAUTHORIZED: {
    title: "Insufficient Permissions",
    message:
      "You do not have permission to perform this action. Contact your administrator.",
    action: "Contact Support",
  },
  CONFLICT: {
    title: "Already Processed",
    message:
      "This approval was processed by another operator while you were reviewing it.",
    action: "Refresh Queue",
  },
  EXPIRED: {
    title: "Approval Expired",
    message:
      "This approval is no longer valid. The conversation may have progressed.",
    action: "View Conversation",
  },
  UNKNOWN: {
    title: "Unexpected Error",
    message:
      "An unexpected error occurred. Please try again or contact support if the issue persists.",
    action: "Retry",
  },
};
```

---

## 9. Animation & Transitions

### Success Animation

```typescript
// Polaris motion tokens
const SUCCESS_ANIMATION = {
  duration: '300ms',
  easing: 'ease-in-out',
  keyframes: {
    '0%': { opacity: 1, transform: 'scale(1)' },
    '50%': { opacity: 1, transform: 'scale(1.02)' },
    '100%': { opacity: 0, transform: 'scale(0.98)' },
  },
};

// Apply to approved/rejected cards
<Box
  style={state === 'approved' || state === 'rejected' ? {
    animation: `${SUCCESS_ANIMATION.duration} ${SUCCESS_ANIMATION.easing} fadeOutScale`,
  } : undefined}
>
  <Card>{/* ... */}</Card>
</Box>
```

### Loading Shimmer

Polaris skeletons include shimmer animation by default:

```typescript
<SkeletonBodyText lines={3} />  // Automatic shimmer effect
<SkeletonDisplayText size="small" />  // Automatic shimmer
```

### Error Shake Animation (Optional)

```typescript
// Subtle shake on error
const ERROR_SHAKE = {
  duration: '400ms',
  easing: 'ease-in-out',
  keyframes: {
    '0%, 100%': { transform: 'translateX(0)' },
    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
    '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
  },
};

<Box
  style={justErrored ? {
    animation: `${ERROR_SHAKE.duration} ${ERROR_SHAKE.easing} shake`,
  } : undefined}
>
  {/* Error banner */}
</Box>
```

---

## 10. Implementation Priority

### P0 - Must Have for MVP

- ✅ Initial load skeleton
- ✅ Button loading states
- ✅ Network offline detection
- ✅ API error handling (500/503)
- ✅ Empty state (no approvals)
- ✅ Error banner with retry

### P1 - Should Have for Production

- ✅ Unauthorized handling
- ✅ Already processed conflict
- ✅ Timeout warnings
- ✅ Approval expiration
- ✅ Auto-recovery after offline
- ✅ Stale data warning

### P2 - Nice to Have

- ⏳ Keyboard shortcuts
- ⏳ Error shake animation
- ⏳ Optimistic success animation
- ⏳ Rate limit handling
- ⏳ Session expiration

---

## 11. Testing Scenarios

### Manual Test Cases

**Scenario 1: Happy Path**

1. Load approval queue → See 3 pending approvals
2. Click "Approve & Execute" → Button shows spinner
3. API succeeds → Success banner appears
4. Card fades out after 3s → Removed from queue
5. Toast shows "Approval processed successfully"

**Scenario 2: Network Error**

1. Disconnect internet
2. Try to approve → Error banner appears
3. Error message: "Connection lost..."
4. Reconnect internet → Toast shows "Connection restored"
5. Click "Retry" → Approval succeeds

**Scenario 3: API Error**

1. API returns 500 error
2. Error banner shows with error ID
3. Click "Retry" → Same error
4. Click "Contact Support" → Opens mailto with error ID

**Scenario 4: Concurrent Modification**

1. Two operators view same approval
2. Operator A clicks approve → Succeeds
3. Operator B clicks approve → Gets 409 Conflict
4. Operator B sees "Already processed by Operator A"
5. Operator B clicks "Refresh Queue" → Card removed

**Scenario 5: Timeout Expiration**

1. Approval sits for 14 minutes
2. Warning banner appears: "Expires in 2 min"
3. Wait 2 more minutes → Approval expires
4. Card shows "EXPIRED" badge
5. Actions disabled → Only "Dismiss" available

### Automated Test Cases

```typescript
describe('ApprovalCard - Edge States', () => {
  it('shows loading skeleton on initial render', () => {
    render(<ApprovalQueueSkeleton />);
    expect(screen.getAllByRole('progressbar')).toHaveLength(3);
  });

  it('shows spinner on approve button while processing', async () => {
    const { user } = render(<ApprovalCard {...mockProps} />);
    const approveBtn = screen.getByText('Approve & Execute');

    await user.click(approveBtn);

    expect(approveBtn).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error banner and retry on API failure', async () => {
    const onApprove = jest.fn().mockRejectedValue(new Error('Network error'));
    const { user } = render(<ApprovalCard {...mockProps} onApprove={onApprove} />);

    await user.click(screen.getByText('Approve & Execute'));

    expect(screen.getByRole('alert')).toHaveTextContent('Network error');
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('shows empty state when no approvals', () => {
    render(<ApprovalQueue approvals={[]} />);

    expect(screen.getByText('All caught up!')).toBeInTheDocument();
    expect(screen.getByText(/no pending approvals/i)).toBeInTheDocument();
  });

  it('handles offline state gracefully', () => {
    Object.defineProperty(navigator, 'onLine', { value: false });

    render(<ApprovalQueue />);

    expect(screen.getByText(/offline/i)).toBeInTheDocument();
    expect(screen.getByText('Retry Connection')).toBeInTheDocument();
  });
});
```

---

## 12. Visual Reference

### State Comparison Table

| State     | Badge    | Banner   | Actions          | Auto-Remove | Animation |
| --------- | -------- | -------- | ---------------- | ----------- | --------- |
| pending   | -        | -        | Approve, Reject  | No          | None      |
| approving | -        | -        | None (disabled)  | No          | Spinner   |
| rejecting | -        | -        | None (disabled)  | No          | Spinner   |
| approved  | ✓        | Success  | None             | Yes (3s)    | Fade out  |
| rejected  | -        | -        | None             | Yes (3s)    | Fade out  |
| error     | -        | Critical | Retry, Cancel    | No          | Shake     |
| expired   | EXPIRED  | Warning  | Dismiss          | No          | None      |
| conflict  | CONFLICT | Warning  | Refresh, Dismiss | No          | None      |
| offline   | -        | Warning  | Retry Connection | No          | None      |

### Color Coding (Polaris Tones)

| Element         | Tone     | Polaris Token |
| --------------- | -------- | ------------- |
| Success badge   | success  | bg-success    |
| Warning badge   | warning  | bg-warning    |
| Critical badge  | critical | bg-critical   |
| Info banner     | info     | bg-info       |
| Warning banner  | warning  | bg-warning    |
| Critical banner | critical | bg-critical   |
| Success banner  | success  | bg-success    |

---

## 13. Accessibility Edge Cases

### Screen Reader Announcements

```typescript
// Live region for dynamic updates
<div role="status" aria-live="polite" aria-atomic="true">
  {state === 'approving' && 'Approving action. Please wait.'}
  {state === 'approved' && 'Action approved successfully. Card will be removed.'}
  {state === 'error' && `Error: ${errorMessage}`}
  {state === 'offline' && 'Connection lost. Working in offline mode.'}
</div>

// Assertive for critical errors
<div role="alert" aria-live="assertive">
  {state === 'expired' && 'Approval has expired and can no longer be processed.'}
  {state === 'conflict' && 'This approval was already processed by another operator.'}
</div>
```

### Keyboard Shortcuts Reference

```typescript
function KeyboardShortcutsHelpModal() {
  return (
    <Modal open={showHelp} onClose={() => setShowHelp(false)} title="Keyboard Shortcuts">
      <Modal.Section>
        <BlockStack gap="300">
          <InlineStack gap="600" blockAlign="start">
            <Box minWidth="100px">
              <Text variant="bodyMd" fontWeight="semibold">Tab</Text>
            </Box>
            <Text variant="bodyMd">Navigate between approvals</Text>
          </InlineStack>

          <InlineStack gap="600" blockAlign="start">
            <Box minWidth="100px">
              <Text variant="bodyMd" fontWeight="semibold">Ctrl + A</Text>
            </Box>
            <Text variant="bodyMd">Approve current item</Text>
          </InlineStack>

          <InlineStack gap="600" blockAlign="start">
            <Box minWidth="100px">
              <Text variant="bodyMd" fontWeight="semibold">Ctrl + R</Text>
            </Box>
            <Text variant="bodyMd">Reject current item</Text>
          </InlineStack>

          <InlineStack gap="600" blockAlign="start">
            <Box minWidth="100px">
              <Text variant="bodyMd" fontWeight="semibold">Escape</Text>
            </Box>
            <Text variant="bodyMd">Close dialogs and modals</Text>
          </InlineStack>

          <InlineStack gap="600" blockAlign="start">
            <Box minWidth="100px">
              <Text variant="bodyMd" fontWeight="semibold">Ctrl + K</Text>
            </Box>
            <Text variant="bodyMd">Show keyboard shortcuts</Text>
          </InlineStack>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
```

---

## 14. Performance Considerations

### Large Queue Handling

**Scenario**: 100+ pending approvals

**Solutions**:

1. **Virtualization**: Use virtual scrolling for long lists
2. **Pagination**: Load 20 approvals per page
3. **Infinite Scroll**: Load more as user scrolls
4. **Filtering**: Reduce visible items

**Implementation (Virtualization)**:

```typescript
import { Virtualizer } from '@tanstack/react-virtual';

function ApprovalQueue({ approvals }: { approvals: ApprovalAction[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: approvals.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 250, // Estimated card height
    overscan: 3, // Render 3 extra cards above/below viewport
  });

  return (
    <div ref={parentRef} style={{ height: '800px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ApprovalCard
              action={approvals[virtualItem.index]}
              {...handlers}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Memory Management

**Pattern**: Remove processed approvals from memory

```typescript
// Don't keep growing approval list indefinitely
const [approvals, setApprovals] = useState<ApprovalAction[]>([]);
const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());

const handleRemove = (id: string) => {
  // Remove from UI
  setApprovals((prev) => prev.filter((a) => a.id !== id));

  // Track processed to avoid re-adding on refresh
  setProcessedIds((prev) => new Set([...prev, id]));
};

// On revalidation, filter out already processed
const newApprovals = freshData.filter((a) => !processedIds.has(a.id));
setApprovals(newApprovals);
```

---

## 15. Future Enhancements

### Batch Operations

```typescript
<Page
  primaryAction={{
    content: `Approve Selected (${selectedCount})`,
    onAction: handleBulkApprove,
    disabled: selectedCount === 0,
  }}
  secondaryActions={[
    {
      content: `Reject Selected (${selectedCount})`,
      onAction: handleBulkReject,
      destructive: true,
      disabled: selectedCount === 0,
    },
  ]}
>
  {/* Queue content */}
</Page>
```

### Smart Filtering

```typescript
<Filters
  filters={[
    {
      key: 'agent',
      label: 'Agent',
      filter: (
        <ChoiceList
          title="Agent"
          choices={[
            { label: 'Order Support', value: 'order_support' },
            { label: 'Product Q&A', value: 'product_qa' },
          ]}
          selected={selectedAgents}
          onChange={setSelectedAgents}
        />
      ),
    },
    {
      key: 'risk',
      label: 'Risk Level',
      filter: (
        <ChoiceList
          title="Risk Level"
          choices={[
            { label: 'High Risk', value: 'high' },
            { label: 'Medium Risk', value: 'medium' },
            { label: 'Low Risk', value: 'low' },
          ]}
          selected={selectedRisk}
          onChange={setSelectedRisk}
        />
      ),
    },
  ]}
  onClearAll={handleClearFilters}
/>
```

---

**Status**: Complete Edge State Documentation  
**Created**: 2025-10-11  
**Owner**: Designer Agent  
**Ready For**: Engineer Implementation (Phase 2-3)
