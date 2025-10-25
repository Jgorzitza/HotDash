---
epoch: 2025.10.E1
doc: docs/design/notification-system-design.md
owner: designer
created: 2025-10-11
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-25
---

# Notification System Design

**Status**: Ready for Implementation  
**Polaris Version**: Latest  
**Target**: Real-time operator alerts and notifications

---

## 1. Overview

### Purpose

Notify operators of:

- New approvals requiring action
- Agent performance changes
- Queue backlog alerts
- System health issues
- Training data needing review

### Notification Channels

1. **Toast** - Transient messages (3-5 seconds)
2. **Banner** - Persistent page-level alerts
3. **Badge** - Visual indicators (queue depth, unread count)
4. **Browser Notifications** - Desktop notifications (optional)

---

## 2. Toast Notifications

### Success Toasts

```typescript
import { useToast } from '@shopify/app-bridge-react';

function ApprovalActions() {
  const toast = useToast();

  const handleApprove = async () => {
    const result = await approveAction();

    if (result.success) {
      toast.show('Action approved and executed');
    } else {
      toast.show('Approval failed', { isError: true });
    }
  };

  return <Button onClick={handleApprove}>Approve</Button>;
}
```

###Toast Patterns

**Success Messages**:

- ✅ "Action approved and executed"
- ✅ "Feedback submitted"
- ✅ "Settings saved"
- ✅ "Data exported successfully"

**Error Messages**:

- ❌ "Approval failed. Please try again."
- ❌ "Connection lost. Check your internet."
- ❌ "Export failed. Contact support."

**Info Messages**:

- ℹ️ "3 new approvals need review"
- ℹ️ "Queue refreshed"
- ℹ️ "Connection restored"

---

## 3. Banner Notifications

### Queue Backlog Alert

```typescript
{queueDepth > 10 && (
  <Banner
    tone="warning"
    title="Approval Queue Backlog"
    action={{
      content: 'View Queue',
      url: '/app/approvals',
    }}
    onDismiss={handleDismissBanner}
  >
    <Text variant="bodyMd">
      {queueDepth} approvals pending. Consider reviewing high-priority items first.
    </Text>
  </Banner>
)}
```

### Performance Degradation Alert

```typescript
{approvalRate < 70 && (
  <Banner
    tone="critical"
    title="Agent Performance Below Target"
    action={{
      content: 'View Metrics',
      url: '/app/agent-metrics',
    }}
  >
    <Text variant="bodyMd">
      Approval rate dropped to {approvalRate}% (target: 80%+).
      Review recent rejections to identify issues.
    </Text>
  </Banner>
)}
```

### System Health Alert

```typescript
{serviceHealth === 'degraded' && (
  <Banner
    tone="warning"
    title="Agent Service Degraded"
  >
    <Text variant="bodyMd">
      Response times are higher than normal. Monitoring the situation.
    </Text>
  </Banner>
)}

{serviceHealth === 'down' && (
  <Banner
    tone="critical"
    title="Agent Service Unavailable"
    action={{
      content: 'Contact Support',
      url: 'mailto:customer.support@hotrodan.com',
    }}
  >
    <Text variant="bodyMd">
      Agent service is currently unavailable. Manual support required.
    </Text>
  </Banner>
)}
```

---

## 4. Badge Indicators

### Live Queue Depth Badge

```typescript
import { Badge } from '@shopify/polaris';

function QueueDepthBadge({ depth }: { depth: number }) {
  const tone = depth === 0 ? 'success' : depth < 5 ? 'info' : depth < 10 ? 'warning' : 'critical';

  return (
    <Badge tone={tone}>
      {depth} Pending
    </Badge>
  );
}

// Usage in navigation
<s-page heading="Approval Queue">
  <s-titlebar-action-group slot="actions">
    <QueueDepthBadge depth={queueDepth} />
  </s-titlebar-action-group>
</s-page>
```

### Unread Training Samples Badge

```typescript
<Badge tone="info" progress="incomplete">
  {unreadCount} Need Review
</Badge>
```

---

## 5. Browser Notifications (Optional)

### Desktop Notifications

```typescript
function useBrowserNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const showNotification = (title: string, body: string) => {
    if (permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/badge-96.png',
        tag: 'hotdash-notification',
        requireInteraction: true, // Stays until clicked
      });
    }
  };

  return { permission, requestPermission, showNotification };
}

// Usage
function ApprovalQueue() {
  const { showNotification } = useBrowserNotifications();

  useEffect(() => {
    // When new approvals arrive
    const newCount = approvals.length - previousCount;
    if (newCount > 0 && document.hidden) {
      showNotification(
        'New Approvals',
        `${newCount} new approval${newCount > 1 ? 's' : ''} need your review`
      );
    }
  }, [approvals.length]);

  return (/* ... */);
}
```

### Notification Preferences UI

```typescript
<Card>
  <BlockStack gap="400">
    <Text variant="headingMd" as="h2">Notification Preferences</Text>

    <Checkbox
      label="Desktop notifications for new approvals"
      checked={preferences.browserNotifs}
      onChange={setBrowserNotifs}
      helpText="Receive browser notifications when new approvals arrive"
    />

    <Checkbox
      label="Show queue backlog warnings"
      checked={preferences.queueWarnings}
      onChange={setQueueWarnings}
      helpText="Alert when approval queue exceeds 10 items"
    />

    <Checkbox
      label="Performance degradation alerts"
      checked={preferences.perfAlerts}
      onChange={setPerfAlerts}
      helpText="Notify when agent approval rate drops below 70%"
    />

    <ButtonGroup>
      <Button variant="primary" onClick={savePreferences}>
        Save Preferences
      </Button>
      <Button onClick={resetDefaults}>
        Reset to Defaults
      </Button>
    </ButtonGroup>
  </BlockStack>
</Card>
```

---

## 6. Notification Priority Levels

### Priority Matrix

| Priority | Channel          | Duration        | Example                         |
| -------- | ---------------- | --------------- | ------------------------------- |
| Critical | Banner + Browser | Persistent      | Service down, security issue    |
| High     | Banner + Toast   | Until dismissed | Queue backlog, performance drop |
| Medium   | Toast            | 5 seconds       | New approval, action completed  |
| Low      | Badge only       | Persistent      | Unread count, queue depth       |

### Implementation

```typescript
type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';

interface Notification {
  id: string;
  priority: NotificationPriority;
  title: string;
  message: string;
  action?: {
    label: string;
    url: string;
  };
  dismissible?: boolean;
}

function NotificationManager({ notifications }: { notifications: Notification[] }) {
  const toast = useToast();
  const [banners, setBanners] = useState<Notification[]>([]);

  useEffect(() => {
    notifications.forEach(notif => {
      if (notif.priority === 'critical' || notif.priority === 'high') {
        // Show as banner
        setBanners(prev => [...prev, notif]);
      }

      if (notif.priority === 'medium') {
        // Show as toast
        toast.show(notif.message, {
          isError: notif.priority === 'critical',
          duration: 5000,
        });
      }

      if (notif.priority === 'critical' && 'Notification' in window) {
        // Browser notification
        new Notification(notif.title, { body: notif.message });
      }
    });
  }, [notifications]);

  return (
    <BlockStack gap="200">
      {banners.map(banner => (
        <Banner
          key={banner.id}
          tone={banner.priority === 'critical' ? 'critical' : 'warning'}
          title={banner.title}
          action={banner.action}
          onDismiss={banner.dismissible ? () => dismissBanner(banner.id) : undefined}
        >
          <Text variant="bodyMd">{banner.message}</Text>
        </Banner>
      ))}
    </BlockStack>
  );
}
```

---

## 7. Notification Center (Future Enhancement)

### Slide-Out Panel

**Visual**: Slide-in from right with notification history

```
┌─────────────────────────────────────────┐
│ Notifications                      [×] │
├─────────────────────────────────────────┤
│                                         │
│ Today                                   │
│                                         │
│ 🔔 New Approval (#123)          5m ago │
│    Order Support needs review           │
│                                         │
│ ✅ Action Approved                3h ago │
│    Conversation #101 resolved           │
│                                         │
│ Yesterday                               │
│                                         │
│ ⚠ Queue Backlog                   1d ago│
│    12 approvals pending                 │
│                                         │
│ [Mark All as Read]                      │
│                                         │
└─────────────────────────────────────────┘
```

**Implementation** (Phase 2):

```typescript
import { Sheet, List } from '@shopify/polaris';

function NotificationCenter({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { notifications } = useLoaderData<typeof loader>();

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Notifications"
      accessibilityLabel="Notification center"
    >
      <BlockStack gap="400">
        {notifications.map(notif => (
          <Card key={notif.id}>
            <BlockStack gap="200">
              <InlineStack gap="200" blockAlign="center">
                <Icon source={notif.icon} />
                <Text variant="bodyMd" fontWeight="semibold">
                  {notif.title}
                </Text>
              </InlineStack>
              <Text variant="bodySm">{notif.message}</Text>
              <Text variant="bodySm" tone="subdued">
                {formatRelativeTime(notif.timestamp)}
              </Text>
              {notif.action && (
                <Button url={notif.action.url} variant="plain" size="slim">
                  {notif.action.label}
                </Button>
              )}
            </BlockStack>
          </Card>
        ))}

        <Button fullWidth onClick={markAllAsRead}>
          Mark All as Read
        </Button>
      </BlockStack>
    </Sheet>
  );
}
```

---

## 8. Success Criteria

- [ ] Operators notified of new approvals within 10 seconds
- [ ] Critical alerts impossible to miss (banner + browser notif)
- [ ] Toast notifications don't interfere with work
- [ ] Notification preferences customizable
- [ ] Mobile-friendly (all notification types work on phone)
- [ ] Accessible (screen reader announcements)

---

**Status**: Notification System Design Complete  
**Created**: 2025-10-11  
**Owner**: Designer Agent

EOF
