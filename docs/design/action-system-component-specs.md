# Action System - Component Specifications
## UI Components for Growth Automation

**Created**: 2025-10-14T18:40:00Z  
**Owner**: Designer  
**Purpose**: Detailed specifications for Action system UI components  
**Status**: Priority 0 deliverable

---

## Component 1: ActionDock

### Overview
Main container displaying top 10 pending actions prioritized by urgency and timestamp.

### File Location
`app/components/actions/ActionDock.tsx`

### TypeScript Interface
```typescript
import { type Action } from '~/types/action';

interface ActionDockProps {
  actions: Action[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onViewDetail: (id: number) => void;
  isLoading?: boolean;
}
```

### Component Behavior
- Displays maximum 10 actions
- Sorted by: priority (urgent→low), then requestedAt (newest first)
- Real-time updates via EventSource or polling
- Empty state when no pending actions
- Loading state during data fetch

### UI Structure
```tsx
<Card>
  <BlockStack gap="400">
    <InlineStack align="space-between">
      <Text variant="headingMd">Pending Actions</Text>
      <Badge tone="info">{actions.length}</Badge>
    </InlineStack>
    
    <Divider />
    
    {isLoading ? (
      <SkeletonBodyText lines={5} />
    ) : actions.length === 0 ? (
      <EmptyState />
    ) : (
      <BlockStack gap="300">
        {actions.map(action => (
          <ActionCard 
            key={action.id}
            action={action}
            onApprove={() => onApprove(action.id)}
            onReject={() => onReject(action.id)}
            onViewDetail={() => onViewDetail(action.id)}
          />
        ))}
      </BlockStack>
    )}
  </BlockStack>
</Card>
```

### State Management
```typescript
const [selectedAction, setSelectedAction] = useState<number | null>(null);
const [isRefreshing, setIsRefreshing] = useState(false);

// Real-time subscription
useEffect(() => {
  const eventSource = new EventSource('/api/actions/stream');
  eventSource.onmessage = (event) => {
    const newAction = JSON.parse(event.data);
    // Trigger revalidation or update local state
  };
  return () => eventSource.close();
}, []);
```

### Accessibility
- `role="region"` on container
- `aria-label="Pending actions queue"`
- `aria-live="polite"` for real-time updates
- Keyboard navigation between cards (Tab)
- Screen reader announces new actions

### Responsive Design
- **Mobile (320-767px)**: Stack cards vertically, full width
- **Tablet (768-1279px)**: 2 column grid
- **Desktop (1280px+)**: List view with expanded cards

---

## Component 2: ActionCard

### Overview
Individual action display with quick approve/reject buttons.

### File Location
`app/components/actions/ActionCard.tsx`

### TypeScript Interface
```typescript
interface ActionCardProps {
  action: Action;
  onApprove: () => void;
  onReject: () => void;
  onViewDetail: () => void;
  variant?: 'compact' | 'expanded';
}
```

### Component Behavior
- Display action summary
- Show tool name, agent, priority
- Quick action buttons (approve/reject)
- Click anywhere to view details
- Visual priority indicators

### UI Structure
```tsx
<Card>
  <InlineStack align="space-between" blockAlign="start">
    <BlockStack gap="200">
      <InlineStack gap="200">
        <ActionTypeBadge toolName={action.toolName} />
        <PriorityBadge priority={action.priority} />
      </InlineStack>
      
      <Text variant="bodyMd" fontWeight="semibold">
        {formatToolName(action.toolName)}
      </Text>
      
      <Text variant="bodySm" tone="subdued">
        Requested by {action.agent} • {formatTimestamp(action.requestedAt)}
      </Text>
      
      {action.rationale && (
        <Text variant="bodySm" truncate>
          {action.rationale}
        </Text>
      )}
    </BlockStack>
    
    <InlineStack gap="200">
      <Button size="sm" tone="success" onClick={onApprove}>
        Approve
      </Button>
      <Button size="sm" onClick={onReject}>
        Reject
      </Button>
      <Button size="sm" variant="plain" onClick={onViewDetail}>
        Details
      </Button>
    </InlineStack>
  </InlineStack>
</Card>
```

### Tool Name Formatting
```typescript
function formatToolName(toolName: string): string {
  // "chatwoot_send_public_reply" → "Send Public Reply (Chatwoot)"
  const [platform, ...actionParts] = toolName.split('_');
  const action = actionParts.join(' ').replace(/\b\w/g, l => l.toUpperCase());
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  return `${action} (${platformName})`;
}
```

### Priority Visual Indicators
- **urgent**: Red background tint, red border-left (4px)
- **high**: Orange background tint, orange border-left (4px)
- **normal**: Blue background tint, blue border-left (2px)
- **low**: Gray background tint, gray border-left (1px)

### Accessibility
- `role="article"` on card
- `aria-label` describing action
- Button labels explicit: "Approve [action]", "Reject [action]"
- Keyboard: Tab to buttons, Enter/Space to activate

---

## Component 3: ActionDetailModal

### Overview
Modal displaying full action details with approval/rejection workflow.

### File Location
`app/components/actions/ActionDetailModal.tsx`

### TypeScript Interface
```typescript
interface ActionDetailModalProps {
  action: Action;
  onApprove: () => void;
  onReject: () => void;
  onEdit?: (updates: Partial<Action>) => void;
  onClose: () => void;
  isOpen: boolean;
}
```

### Component Behavior
- Show all action fields
- Display parameters as formatted JSON
- Show rationale and context
- Enable approve/reject with confirmation
- Optional edit mode (if onEdit provided)
- Show execution history if available

### UI Structure
```tsx
<Modal
  open={isOpen}
  onClose={onClose}
  title={formatToolName(action.toolName)}
  primaryAction={{
    content: 'Approve',
    onAction: handleApprove,
    tone: 'success'
  }}
  secondaryActions={[
    {
      content: 'Reject',
      onAction: handleReject,
      destructive: true
    }
  ]}
>
  <Modal.Section>
    <BlockStack gap="400">
      {/* Status and Priority */}
      <InlineStack gap="200">
        <Badge tone={getStatusTone(action.status)}>
          {action.status}
        </Badge>
        <PriorityBadge priority={action.priority} />
      </InlineStack>
      
      {/* Agent and Timestamps */}
      <Box>
        <Text variant="bodySm" tone="subdued">
          Requested by: {action.agent}
        </Text>
        <Text variant="bodySm" tone="subdued">
          {formatTimestamp(action.requestedAt)}
        </Text>
      </Box>
      
      {/* Rationale */}
      {action.rationale && (
        <Box>
          <Text variant="headingXs">Rationale</Text>
          <Text>{action.rationale}</Text>
        </Box>
      )}
      
      {/* Parameters */}
      <Box>
        <Text variant="headingXs">Parameters</Text>
        <DiffViewer 
          content={action.parameters} 
          language="json"
          readOnly
        />
      </Box>
      
      {/* Context */}
      {(action.conversationId || action.shopDomain || action.externalRef) && (
        <Box>
          <Text variant="headingXs">Context</Text>
          <BlockStack gap="100">
            {action.conversationId && (
              <Text variant="bodySm">
                Conversation: #{action.conversationId}
              </Text>
            )}
            {action.shopDomain && (
              <Text variant="bodySm">
                Shop: {action.shopDomain}
              </Text>
            )}
            {action.externalRef && (
              <Text variant="bodySm">
                Reference: {action.externalRef}
              </Text>
            )}
          </BlockStack>
        </Box>
      )}
      
      {/* Execution Result (if executed) */}
      {action.result && (
        <Box>
          <Text variant="headingXs">Execution Result</Text>
          <DiffViewer 
            content={action.result} 
            language="json"
            readOnly
          />
        </Box>
      )}
      
      {/* Error (if failed) */}
      {action.error && (
        <Banner tone="critical">
          <Text>{action.error}</Text>
        </Banner>
      )}
    </BlockStack>
  </Modal.Section>
</Modal>
```

### Approval Flow
```typescript
const [confirmApprove, setConfirmApprove] = useState(false);

const handleApprove = () => {
  if (!confirmApprove) {
    setConfirmApprove(true);
    return;
  }
  onApprove();
  onClose();
};

// Show confirmation UI when confirmApprove is true
{confirmApprove && (
  <Banner tone="info">
    <Text>Confirm approval? This action will be executed immediately.</Text>
    <InlineStack gap="200">
      <Button size="sm" onClick={() => onApprove()}>Confirm</Button>
      <Button size="sm" onClick={() => setConfirmApprove(false)}>Cancel</Button>
    </InlineStack>
  </Banner>
)}
```

### Accessibility
- Modal has proper focus trap
- Escape key closes modal
- First focusable element on open: Close button
- Screen reader announces modal title
- ARIA labels for all actions

---

## Component 4: DiffViewer

### Overview
Display before/after comparison or formatted JSON/code.

### File Location
`app/components/actions/DiffViewer.tsx`

### TypeScript Interface
```typescript
interface DiffViewerProps {
  content: any;  // JSON object or string
  before?: any;  // For diff mode
  after?: any;   // For diff mode
  language?: 'json' | 'javascript' | 'text';
  readOnly?: boolean;
}
```

### Component Behavior
- Display formatted code/JSON
- Syntax highlighting
- Diff mode shows before/after side-by-side
- Copy button for content
- Collapsible sections for large objects

### UI Structure (Simple Mode)
```tsx
<Card>
  <InlineStack align="space-between">
    <Text variant="headingXs">Content</Text>
    <Button size="sm" icon={ClipboardIcon} onClick={copyToClipboard}>
      Copy
    </Button>
  </InlineStack>
  
  <Box 
    background="bg-surface-secondary" 
    padding="300" 
    borderRadius="200"
  >
    <pre style={{ 
      margin: 0, 
      fontFamily: 'monospace', 
      fontSize: '12px',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word'
    }}>
      {JSON.stringify(content, null, 2)}
    </pre>
  </Box>
</Card>
```

### Diff Mode
```tsx
<InlineGrid columns={2} gap="400">
  <Box>
    <Text variant="headingXs">Before</Text>
    <CodeBlock content={before} />
  </Box>
  <Box>
    <Text variant="headingXs">After</Text>
    <CodeBlock content={after} />
  </Box>
</InlineGrid>
```

### Syntax Highlighting (Optional Enhancement)
- Use `react-syntax-highlighter` library
- Theme: matches Polaris color scheme
- Languages: JSON, JavaScript primarily

---

## Component 5: AutoPublishSettings

### Overview
Configure automation rules for auto-approval/execution.

### File Location
`app/components/actions/AutoPublishSettings.tsx`

### TypeScript Interface
```typescript
interface AutoPublishRule {
  id?: number;
  actionType: string;  // Tool name pattern
  minConfidence?: number;  // Future: when we add confidence scoring
  requireApproval: boolean;
  maxBatchSize: number;
  schedule?: string;  // Cron expression
  enabled: boolean;
}

interface AutoPublishSettingsProps {
  rules: AutoPublishRule[];
  onSaveRule: (rule: AutoPublishRule) => void;
  onDeleteRule: (id: number) => void;
}
```

### Component Behavior
- List existing rules
- Add/edit/delete rules
- Toggle rule enabled state
- Validate rule configuration
- Show rule effects (how many actions match)

### UI Structure
```tsx
<Card>
  <BlockStack gap="400">
    <InlineStack align="space-between">
      <Text variant="headingMd">Auto-Publish Rules</Text>
      <Button onClick={() => setShowRuleBuilder(true)}>
        Add Rule
      </Button>
    </InlineStack>
    
    <Divider />
    
    {rules.length === 0 ? (
      <EmptyState 
        heading="No automation rules configured"
        action={{ content: 'Create Rule', onAction: () => setShowRuleBuilder(true) }}
      />
    ) : (
      <BlockStack gap="300">
        {rules.map(rule => (
          <RuleCard 
            key={rule.id}
            rule={rule}
            onEdit={() => editRule(rule)}
            onDelete={() => onDeleteRule(rule.id!)}
            onToggle={() => toggleRule(rule.id!)}
          />
        ))}
      </BlockStack>
    )}
  </BlockStack>
</Card>

{showRuleBuilder && (
  <RuleBuilderModal 
    rule={editingRule}
    onSave={handleSaveRule}
    onClose={() => setShowRuleBuilder(false)}
  />
)}
```

### Rule Builder Form
```tsx
<Form onSubmit={handleSubmit}>
  <FormLayout>
    <Select
      label="Action Type"
      options={[
        { label: 'Chatwoot: Send Reply', value: 'chatwoot_send_public_reply' },
        { label: 'Shopify: Cancel Order', value: 'shopify_cancel_order' },
        // ... more tool types
      ]}
      value={formData.actionType}
      onChange={(value) => setFormData({ ...formData, actionType: value })}
    />
    
    <Checkbox
      label="Require manual approval"
      checked={formData.requireApproval}
      onChange={(checked) => setFormData({ ...formData, requireApproval: checked })}
    />
    
    <TextField
      label="Max batch size"
      type="number"
      value={String(formData.maxBatchSize)}
      onChange={(value) => setFormData({ ...formData, maxBatchSize: parseInt(value) })}
      helpText="Maximum actions to auto-execute in one batch"
    />
    
    <TextField
      label="Schedule (optional)"
      value={formData.schedule || ''}
      onChange={(value) => setFormData({ ...formData, schedule: value })}
      placeholder="*/5 * * * * (every 5 minutes)"
      helpText="Cron expression for scheduled execution"
    />
  </FormLayout>
</Form>
```

### Validation
```typescript
const validateRule = (rule: AutoPublishRule): string[] => {
  const errors: string[] = [];
  
  if (!rule.actionType) {
    errors.push('Action type is required');
  }
  
  if (rule.maxBatchSize < 1) {
    errors.push('Batch size must be at least 1');
  }
  
  if (rule.schedule && !isValidCron(rule.schedule)) {
    errors.push('Invalid cron expression');
  }
  
  return errors;
};
```

---

## Component 6: Priority & Status Badges

### PriorityBadge
```tsx
interface PriorityBadgeProps {
  priority: 'urgent' | 'high' | 'normal' | 'low';
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const config = {
    urgent: { tone: 'critical', icon: AlertCircleIcon },
    high: { tone: 'warning', icon: AlertTriangleIcon },
    normal: { tone: 'info', icon: InfoIcon },
    low: { tone: 'subdued', icon: undefined }
  };
  
  return (
    <Badge tone={config[priority].tone} icon={config[priority].icon}>
      {priority.toUpperCase()}
    </Badge>
  );
};
```

### ActionTypeBadge
```tsx
interface ActionTypeBadgeProps {
  toolName: string;
}

const ActionTypeBadge: React.FC<ActionTypeBadgeProps> = ({ toolName }) => {
  const platform = toolName.split('_')[0];
  
  const platformConfig = {
    chatwoot: { tone: 'info', icon: ChatIcon },
    shopify: { tone: 'success', icon: StoreIcon },
    // ... more platforms
  };
  
  const config = platformConfig[platform] || { tone: 'subdued', icon: undefined };
  
  return (
    <Badge tone={config.tone} icon={config.icon}>
      {platform.charAt(0).toUpperCase() + platform.slice(1)}
    </Badge>
  );
};
```

---

## Component 7: KPI Dashboard Charts

### ThroughputChart
```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ThroughputChartProps {
  data: { timestamp: Date; count: number }[];
}

const ThroughputChart: React.FC<ThroughputChartProps> = ({ data }) => {
  const chartData = data.map(d => ({
    time: d.timestamp.toLocaleTimeString(),
    actions: d.count
  }));
  
  return (
    <Card>
      <Text variant="headingMd">Action Throughput</Text>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="actions" stroke="#008060" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
```

### ApprovalRateGauge
```tsx
interface ApprovalRateGaugeProps {
  approvalRate: number;  // 0-100
}

const ApprovalRateGauge: React.FC<ApprovalRateGaugeProps> = ({ approvalRate }) => {
  const tone = approvalRate >= 80 ? 'success' : approvalRate >= 60 ? 'warning' : 'critical';
  
  return (
    <Card>
      <BlockStack gap="200">
        <Text variant="headingMd">Approval Rate</Text>
        <Text variant="heading2xl">{approvalRate.toFixed(1)}%</Text>
        <ProgressBar progress={approvalRate} tone={tone} />
      </BlockStack>
    </Card>
  );
};
```

---

## Design Tokens

### Colors (Polaris-aligned)
```typescript
export const ActionColors = {
  priority: {
    urgent: 'var(--p-color-bg-critical)',
    high: 'var(--p-color-bg-caution)',
    normal: 'var(--p-color-bg-info)',
    low: 'var(--p-color-bg-subdued)'
  },
  status: {
    pending: 'info',
    approved: 'success',
    rejected: 'critical',
    executed: 'success',
    failed: 'critical'
  }
};
```

### Spacing
```typescript
export const ActionSpacing = {
  card: 'var(--p-space-400)',       // 16px
  cardGap: 'var(--p-space-300)',    // 12px
  section: 'var(--p-space-500)',    // 20px
  inline: 'var(--p-space-200)'      // 8px
};
```

### Typography
```typescript
export const ActionTypography = {
  title: 'headingMd',
  subtitle: 'bodySm',
  label: 'headingXs',
  body: 'bodyMd',
  timestamp: 'bodySm'
};
```

---

## Accessibility Requirements

### WCAG 2.2 AA Compliance
- **Color Contrast**: All text 4.5:1 minimum
- **Keyboard Navigation**: All interactive elements accessible
- **Screen Reader**: ARIA labels on all components
- **Focus Management**: Visible focus indicators
- **Error States**: Clear error messages

### Keyboard Shortcuts (Future Enhancement)
- `a` - Approve selected action
- `r` - Reject selected action
- `d` - View details
- `Escape` - Close modal
- `Arrow Up/Down` - Navigate actions

---

## Performance Considerations

### Optimization Strategies
1. **Virtualization**: Use react-window for large action lists
2. **Memoization**: React.memo on ActionCard
3. **Debounce**: Real-time updates debounced (500ms)
4. **Lazy Loading**: Charts load on scroll into view
5. **Code Splitting**: Separate bundle for charts

### Bundle Size Targets
- ActionDock + ActionCard: < 50KB
- ActionDetailModal: < 30KB
- Charts (Recharts): < 100KB (lazy loaded)
- **Total**: < 200KB for action system

---

## Testing Strategy

### Unit Tests
- Component rendering
- Props validation
- Event handlers
- State updates

### Integration Tests
- Approval workflow
- Real-time updates
- Form validation
- Error handling

### E2E Tests (Playwright)
- Full approval flow
- Auto-publish configuration
- Dashboard interactions

---

## Implementation Priority

**Phase 1** (Priority 1 - 6-8 hours):
1. ActionDock
2. ActionCard
3. Basic approval handlers

**Phase 2** (Priority 2 - 6-8 hours):
1. ActionDetailModal
2. DiffViewer
3. Enhanced approval flow

**Phase 3** (Priority 3 - 4-6 hours):
1. AutoPublishSettings
2. RuleBuilder
3. Rule validation

**Phase 4** (Priority 4 - 4-6 hours):
1. ThroughputChart
2. ApprovalRateGauge
3. Additional KPI charts

---

## Success Criteria

**Component Complete When**:
- [x] All props defined with TypeScript
- [x] UI structure documented
- [x] Polaris components identified
- [x] Accessibility requirements met
- [x] Responsive design specified
- [ ] RR7 patterns verified with MCP (next step)
- [ ] Components built and committed (implementation phase)

---

**Status**: Component specifications complete  
**Evidence**: Documented in `docs/design/action-system-component-specs.md`  
**Next**: Prepare design tokens, then ready for Priority 1 implementation

