---
epoch: 2025.10.E1
doc: docs/design/approvalcard-component-spec.md
owner: designer
created: 2025-10-11
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-25
---

# ApprovalCard Component - Implementation Specification

**Status**: Ready for Engineer Implementation  
**Polaris Version**: Latest (via Shopify App Bridge)  
**Target**: React Router 7 + TypeScript

---

## Table of Contents

1. [Component Overview](#component-overview)
2. [Polaris Component Mapping](#polaris-component-mapping)
3. [TypeScript Interface](#typescript-interface)
4. [Component States](#component-states)
5. [Visual Specifications](#visual-specifications)
6. [Loading States & Skeletons](#loading-states--skeletons)
7. [Error States & Recovery](#error-states--recovery)
8. [Optimistic Updates](#optimistic-updates)
9. [Accessibility Requirements](#accessibility-requirements)
10. [Implementation Examples](#implementation-examples)

---

## 1. Component Overview

### Purpose
Display a pending agent action that requires human approval, with clear context, risk indicators, and approve/reject actions.

### Key Principles
- **Operator-first**: Surface critical information immediately
- **Safety-first**: Clear risk indicators and confirmation dialogs
- **Accessible**: Full keyboard navigation and screen reader support
- **Responsive**: Works on desktop (1280px+), tablet (768px+), mobile (<768px)

### Data Flow
```
Agent SDK → Approval Queue Route → ApprovalCard → User Action → API → State Update
```

---

## 2. Polaris Component Mapping

### Core Components to Use

**DO USE** (Native Polaris Components):
```typescript
import {
  Card,           // Container for approval card
  Text,           // All text content
  Badge,          // Status and risk indicators
  Button,         // Primary/secondary actions
  ButtonGroup,    // Action button layout
  Stack,          // Vertical spacing
  InlineStack,    // Horizontal layout
  Divider,        // Visual separation
  Icon,           // Icons for states
  Spinner,        // Loading indicator
  Banner,         // Error messages
  Modal,          // Confirmation dialogs
  Box,            // Layout container
  BlockStack,     // Vertical stacking with spacing
} from '@shopify/polaris';

import {
  CheckIcon,      // Approve action
  XIcon,          // Reject action
  AlertTriangleIcon, // Risk/warning indicator
  ClockIcon,      // Timestamp
  InfoIcon,       // Information
} from '@shopify/polaris-icons';
```

**DO NOT USE**:
- Custom CSS classes (use Polaris tokens instead)
- Inline styles (except for Polaris-generated values)
- Non-Polaris components (maintain consistency)
- HTML button/div (use Polaris Button/Box)

### Why Polaris?
- **Consistency**: Matches Shopify Admin UX
- **Accessibility**: Built-in WCAG 2.2 AA compliance
- **Maintenance**: Automatic updates with App Bridge
- **Performance**: Optimized for production
- **Theming**: Respects light/dark mode preferences

---

## 3. TypeScript Interface

### Core Types

```typescript
/**
 * Risk level classification for agent actions
 */
export type ApprovalRiskLevel = 'low' | 'medium' | 'high';

/**
 * Current state of the approval card
 */
export type ApprovalCardState = 
  | 'pending'      // Awaiting operator decision
  | 'approving'    // Approve action in progress
  | 'rejecting'    // Reject action in progress
  | 'approved'     // Successfully approved (fade out)
  | 'rejected'     // Successfully rejected (fade out)
  | 'error'        // Action failed
  | 'expired';     // Approval timeout expired

/**
 * Agent action requiring approval
 */
export interface ApprovalAction {
  /** Unique identifier for this approval */
  id: string;
  
  /** Chatwoot conversation ID */
  conversationId: number;
  
  /** Name of the agent proposing the action */
  agentName: string;
  
  /** Tool/function name being called */
  toolName: string;
  
  /** Arguments passed to the tool */
  toolArgs: Record<string, unknown>;
  
  /** Human-readable preview of the action (e.g., message content) */
  preview?: string;
  
  /** Risk classification for this action */
  riskLevel: ApprovalRiskLevel;
  
  /** ISO timestamp when approval was requested */
  timestamp: string;
  
  /** Optional timeout in seconds (null = no timeout) */
  timeoutSeconds?: number | null;
  
  /** Additional context data */
  metadata?: {
    customerName?: string;
    customerEmail?: string;
    conversationStatus?: string;
    previousAttempts?: number;
    [key: string]: unknown;
  };
}

/**
 * Approval action result
 */
export interface ApprovalActionResult {
  /** Whether the action succeeded */
  success: boolean;
  
  /** Error message if action failed */
  error?: string;
  
  /** Optional data returned from the action */
  data?: unknown;
}

/**
 * ApprovalCard component props
 */
export interface ApprovalCardProps {
  /** The approval action to display */
  action: ApprovalAction;
  
  /** Callback when user approves the action */
  onApprove: (id: string) => Promise<ApprovalActionResult>;
  
  /** Callback when user rejects the action */
  onReject: (id: string, reason?: string) => Promise<ApprovalActionResult>;
  
  /** Whether actions are currently processing (disables buttons) */
  isProcessing?: boolean;
  
  /** Optional callback when card is removed after approval/rejection */
  onRemove?: (id: string) => void;
  
  /** Optional custom timeout handler */
  onTimeout?: (id: string) => void;
  
  /** Test ID for automated testing */
  testId?: string;
}
```

---

## 4. Component States

### State Matrix

| State | Visual Indicator | Actions Available | Auto-transition |
|-------|-----------------|-------------------|----------------|
| **pending** | Default appearance | Approve, Reject | No |
| **approving** | Spinner on Approve button | None (disabled) | → approved or error |
| **rejecting** | Spinner on Reject button | None (disabled) | → rejected or error |
| **approved** | Success checkmark, green border | None | → removed (3s fade) |
| **rejected** | X icon, neutral border | None | → removed (3s fade) |
| **error** | Banner with error message | Retry Approve, Retry Reject | No |
| **expired** | Warning banner | View Only | → removed (manual) |

### State Transitions

```
                    ┌─────────┐
                    │ pending │
                    └────┬────┘
                         │
            ┌────────────┴────────────┐
            │                         │
       [Approve]                  [Reject]
            │                         │
            ▼                         ▼
     ┌──────────┐            ┌───────────┐
     │approving │            │ rejecting │
     └────┬─────┘            └─────┬─────┘
          │                        │
    ┌─────┴─────┐            ┌─────┴─────┐
    │           │            │           │
 Success     Error        Success     Error
    │           │            │           │
    ▼           ▼            ▼           ▼
┌────────┐  ┌───────┐   ┌─────────┐ ┌───────┐
│approved│  │ error │   │rejected │ │ error │
└────────┘  └───────┘   └─────────┘ └───────┘
    │           │            │           │
    └───────────┴────────────┴───────────┘
                   │
                   ▼
              [Removed from UI]
```

---

## 5. Visual Specifications

### Layout Structure (Polaris Components)

```typescript
<Card>
  <BlockStack gap="400">
    {/* Header Section */}
    <InlineStack align="space-between" blockAlign="start">
      <BlockStack gap="200">
        <InlineStack gap="200" blockAlign="center">
          <Icon source={AlertTriangleIcon} tone="base" />
          <Text variant="headingMd" as="h2">
            Agent Proposal
          </Text>
        </InlineStack>
        <Text variant="bodySm" tone="subdued">
          {relativeTime} · Conversation #{conversationId}
        </Text>
      </BlockStack>
      
      <Badge tone={riskBadgeTone}>
        {riskLevel.toUpperCase()} RISK
      </Badge>
    </InlineStack>
    
    <Divider />
    
    {/* Context Section */}
    <BlockStack gap="200">
      <InlineStack gap="100">
        <Text variant="bodyMd" fontWeight="semibold">Agent:</Text>
        <Text variant="bodyMd">{agentName}</Text>
      </InlineStack>
      
      <InlineStack gap="100">
        <Text variant="bodyMd" fontWeight="semibold">Action:</Text>
        <Text variant="bodyMd">{toolName}</Text>
      </InlineStack>
      
      {customerName && (
        <InlineStack gap="100">
          <Text variant="bodyMd" fontWeight="semibold">Customer:</Text>
          <Text variant="bodyMd">{customerName}</Text>
        </InlineStack>
      )}
    </BlockStack>
    
    {/* Preview Section */}
    {preview && (
      <>
        <Divider />
        <Box
          background="bg-surface-secondary"
          padding="400"
          borderRadius="200"
        >
          <Text variant="bodyMd">{preview}</Text>
        </Box>
      </>
    )}
    
    {/* Error Banner */}
    {state === 'error' && (
      <Banner tone="critical" onDismiss={clearError}>
        <Text variant="bodyMd">{errorMessage}</Text>
      </Banner>
    )}
    
    {/* Actions Section */}
    <ButtonGroup>
      <Button
        variant="primary"
        onClick={handleApprove}
        loading={state === 'approving'}
        disabled={isActionDisabled}
        icon={CheckIcon}
      >
        Approve & Execute
      </Button>
      <Button
        onClick={handleReject}
        loading={state === 'rejecting'}
        disabled={isActionDisabled}
        icon={XIcon}
        tone="critical"
      >
        Reject
      </Button>
    </ButtonGroup>
  </BlockStack>
</Card>
```

### Risk Level Badge Mapping

```typescript
const RISK_BADGE_TONE: Record<ApprovalRiskLevel, BadgeTone> = {
  low: 'success',        // Green badge
  medium: 'warning',     // Yellow/amber badge
  high: 'critical',      // Red badge
};

const RISK_DESCRIPTIONS: Record<ApprovalRiskLevel, string> = {
  low: 'Low impact - Read-only or safe operation',
  medium: 'Medium impact - Modifies data but reversible',
  high: 'High impact - External communication or irreversible action',
};
```

### Spacing Tokens

All spacing uses Polaris tokens:

```typescript
// BlockStack gap values
gap="100"  // 4px  - Tight spacing
gap="200"  // 8px  - Default spacing
gap="300"  // 12px - Medium spacing
gap="400"  // 16px - Large spacing
gap="500"  // 20px - Extra large spacing

// Box padding values
padding="200"  // 8px  - Tight padding
padding="300"  // 12px - Default padding
padding="400"  // 16px - Comfortable padding
padding="500"  // 20px - Spacious padding

// BorderRadius values
borderRadius="100"  // 4px  - Subtle rounding
borderRadius="200"  // 8px  - Default rounding
borderRadius="300"  // 12px - Prominent rounding
```

---

## 6. Loading States & Skeletons

### Button Loading States

Polaris Button component handles loading automatically:

```typescript
// Approve button while processing
<Button
  variant="primary"
  loading={state === 'approving'}  // Built-in spinner
  disabled={state !== 'pending'}
  onClick={handleApprove}
>
  {state === 'approving' ? 'Approving...' : 'Approve & Execute'}
</Button>

// Reject button while processing
<Button
  loading={state === 'rejecting'}
  disabled={state !== 'pending'}
  onClick={handleReject}
  tone="critical"
>
  {state === 'rejecting' ? 'Rejecting...' : 'Reject'}
</Button>
```

### Initial Load Skeleton

When loading approvals from API:

```typescript
import { Card, SkeletonBodyText, SkeletonDisplayText, BlockStack } from '@shopify/polaris';

function ApprovalCardSkeleton() {
  return (
    <Card>
      <BlockStack gap="400">
        <SkeletonDisplayText size="small" />
        <SkeletonBodyText lines={3} />
        <SkeletonBodyText lines={2} />
        <InlineStack gap="200">
          <Box width="120px">
            <SkeletonBodyText lines={1} />
          </Box>
          <Box width="120px">
            <SkeletonBodyText lines={1} />
          </Box>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
```

### Skeleton Usage

```typescript
// In approval queue route
{isLoading ? (
  <>
    <ApprovalCardSkeleton />
    <ApprovalCardSkeleton />
    <ApprovalCardSkeleton />
  </>
) : (
  approvals.map(approval => (
    <ApprovalCard key={approval.id} action={approval} {...handlers} />
  ))
)}
```

---

## 7. Error States & Recovery

### Error Banner Implementation

```typescript
{state === 'error' && errorMessage && (
  <Banner
    tone="critical"
    title="Action Failed"
    onDismiss={() => setState('pending')}
  >
    <BlockStack gap="200">
      <Text variant="bodyMd">{errorMessage}</Text>
      {errorDetails && (
        <Text variant="bodySm" tone="subdued">
          Error ID: {errorDetails.errorId}
        </Text>
      )}
    </BlockStack>
  </Banner>
)}
```

### Error Types & Messages

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'Unable to connect. Check your internet connection and try again.',
  TIMEOUT_ERROR: 'Request timed out. The server took too long to respond.',
  UNAUTHORIZED: 'You do not have permission to perform this action.',
  ALREADY_PROCESSED: 'This approval has already been processed by another operator.',
  INVALID_ACTION: 'This action is no longer valid or has expired.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return ERROR_MESSAGES[error] || error;
  }
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}
```

### Retry Mechanism

```typescript
const handleRetry = async () => {
  setState('pending');
  setErrorMessage(null);
  
  // Retry the last action
  if (lastAction === 'approve') {
    await handleApprove();
  } else if (lastAction === 'reject') {
    await handleReject();
  }
};

// Add retry button to error banner
{state === 'error' && (
  <Banner tone="critical" onDismiss={() => setState('pending')}>
    <BlockStack gap="300">
      <Text variant="bodyMd">{errorMessage}</Text>
      <ButtonGroup>
        <Button onClick={handleRetry} size="slim">
          Retry
        </Button>
        <Button onClick={() => setState('pending')} size="slim" variant="plain">
          Cancel
        </Button>
      </ButtonGroup>
    </BlockStack>
  </Banner>
)}
```

---

## 8. Optimistic Updates

### Optimistic UI Pattern

```typescript
const [optimisticState, setOptimisticState] = useState<ApprovalCardState>('pending');

const handleApproveOptimistic = async () => {
  // 1. Immediate UI feedback
  setOptimisticState('approving');
  
  try {
    // 2. API call
    const result = await onApprove(action.id);
    
    if (result.success) {
      // 3. Success state
      setOptimisticState('approved');
      
      // 4. Remove after animation
      setTimeout(() => {
        onRemove?.(action.id);
      }, 3000);
    } else {
      // 3. Revert on error
      setOptimisticState('error');
      setErrorMessage(result.error || 'Approval failed');
    }
  } catch (error) {
    // Revert on exception
    setOptimisticState('error');
    setErrorMessage(getErrorMessage(error));
  }
};
```

### Success Animation

```typescript
// Use Polaris animation tokens
{optimisticState === 'approved' && (
  <Box
    position="absolute"
    inset="0"
    background="bg-success-subdued"
    borderRadius="200"
    style={{
      animation: 'fadeOut 3s ease-in-out',
      pointerEvents: 'none',
    }}
  >
    <InlineStack align="center" blockAlign="center" gap="200">
      <Icon source={CheckIcon} tone="success" />
      <Text variant="headingMd" tone="success">
        Approved
      </Text>
    </InlineStack>
  </Box>
)}

// CSS animation (use Polaris motion tokens)
const styles = {
  '@keyframes fadeOut': {
    '0%': { opacity: 1 },
    '70%': { opacity: 1 },
    '100%': { opacity: 0 },
  },
};
```

---

## 9. Accessibility Requirements

### ARIA Attributes

```typescript
<Card>
  <div
    role="article"
    aria-labelledby={`approval-${action.id}-title`}
    aria-describedby={`approval-${action.id}-description`}
  >
    <Text
      id={`approval-${action.id}-title`}
      variant="headingMd"
      as="h2"
    >
      Agent Proposal
    </Text>
    
    <Text
      id={`approval-${action.id}-description`}
      variant="bodyMd"
      tone="subdued"
    >
      {agentName} proposes to {toolName} for conversation #{conversationId}
    </Text>
    
    {/* Action buttons with clear labels */}
    <Button
      variant="primary"
      onClick={handleApprove}
      accessibilityLabel={`Approve ${toolName} action for conversation ${conversationId}`}
      ariaDescribedBy={`approval-${action.id}-risk`}
    >
      Approve & Execute
    </Button>
    
    <Text
      id={`approval-${action.id}-risk`}
      variant="bodySm"
      visuallyHidden
    >
      Risk level: {riskLevel}. {RISK_DESCRIPTIONS[riskLevel]}
    </Text>
  </div>
</Card>
```

### Keyboard Navigation

```typescript
// Polaris handles keyboard navigation automatically
// Ensure focus management:

useEffect(() => {
  if (state === 'approved' || state === 'rejected') {
    // Move focus to next approval or back to page heading
    const nextCard = document.querySelector('[data-approval-card]:not([data-removed])');
    if (nextCard instanceof HTMLElement) {
      nextCard.focus();
    } else {
      document.querySelector('h1')?.focus();
    }
  }
}, [state]);

// Add keyboard shortcuts (optional)
useEffect(() => {
  const handleKeyPress = (event: KeyboardEvent) => {
    if (state !== 'pending') return;
    
    // A = Approve, R = Reject
    if (event.key === 'a' && event.ctrlKey) {
      event.preventDefault();
      handleApprove();
    } else if (event.key === 'r' && event.ctrlKey) {
      event.preventDefault();
      handleReject();
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [state]);
```

### Screen Reader Announcements

```typescript
// Use Polaris VisuallyHidden for screen reader only content
import { Text } from '@shopify/polaris';

{state === 'approving' && (
  <Text variant="bodySm" visuallyHidden>
    Approving action. Please wait.
  </Text>
)}

{state === 'approved' && (
  <Text variant="bodySm" visuallyHidden>
    Action approved successfully. This card will be removed shortly.
  </Text>
)}

// Live region for dynamic updates
<div role="status" aria-live="polite" aria-atomic="true">
  {state === 'error' && errorMessage}
</div>
```

---

## 10. Implementation Examples

### Complete Component Implementation

```typescript
import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Text,
  Badge,
  Button,
  ButtonGroup,
  Banner,
  BlockStack,
  InlineStack,
  Divider,
  Icon,
  Box,
} from '@shopify/polaris';
import {
  CheckIcon,
  XIcon,
  AlertTriangleIcon,
  ClockIcon,
} from '@shopify/polaris-icons';
import type {
  ApprovalAction,
  ApprovalCardProps,
  ApprovalCardState,
  ApprovalRiskLevel,
} from './types';

const RISK_BADGE_TONE = {
  low: 'success',
  medium: 'warning',
  high: 'critical',
} as const;

const RISK_DESCRIPTIONS = {
  low: 'Low impact - Read-only or safe operation',
  medium: 'Medium impact - Modifies data but reversible',
  high: 'High impact - External communication or irreversible action',
} as const;

export function ApprovalCard({
  action,
  onApprove,
  onReject,
  isProcessing = false,
  onRemove,
  testId,
}: ApprovalCardProps) {
  const [state, setState] = useState<ApprovalCardState>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<'approve' | 'reject' | null>(null);
  
  const isActionDisabled = 
    state !== 'pending' && 
    state !== 'error' || 
    isProcessing;
  
  const handleApprove = useCallback(async () => {
    setState('approving');
    setLastAction('approve');
    setErrorMessage(null);
    
    try {
      const result = await onApprove(action.id);
      
      if (result.success) {
        setState('approved');
        // Remove card after animation
        setTimeout(() => {
          onRemove?.(action.id);
        }, 3000);
      } else {
        setState('error');
        setErrorMessage(result.error || 'Approval failed');
      }
    } catch (error) {
      setState('error');
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred'
      );
    }
  }, [action.id, onApprove, onRemove]);
  
  const handleReject = useCallback(async () => {
    setState('rejecting');
    setLastAction('reject');
    setErrorMessage(null);
    
    try {
      const result = await onReject(action.id);
      
      if (result.success) {
        setState('rejected');
        // Remove card after animation
        setTimeout(() => {
          onRemove?.(action.id);
        }, 3000);
      } else {
        setState('error');
        setErrorMessage(result.error || 'Rejection failed');
      }
    } catch (error) {
      setState('error');
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred'
      );
    }
  }, [action.id, onReject, onRemove]);
  
  const handleRetry = useCallback(() => {
    setState('pending');
    setErrorMessage(null);
    
    if (lastAction === 'approve') {
      handleApprove();
    } else if (lastAction === 'reject') {
      handleReject();
    }
  }, [lastAction, handleApprove, handleReject]);
  
  const relativeTime = formatRelativeTime(new Date(action.timestamp));
  
  return (
    <Card>
      <BlockStack gap="400">
        {/* Header */}
        <InlineStack align="space-between" blockAlign="start">
          <BlockStack gap="200">
            <InlineStack gap="200" blockAlign="center">
              <Icon source={AlertTriangleIcon} tone="base" />
              <Text variant="headingMd" as="h2">
                Agent Proposal
              </Text>
            </InlineStack>
            <InlineStack gap="200" blockAlign="center">
              <Icon source={ClockIcon} tone="subdued" />
              <Text variant="bodySm" tone="subdued">
                {relativeTime}
              </Text>
              <Text variant="bodySm" tone="subdued">
                · Conversation #{action.conversationId}
              </Text>
            </InlineStack>
          </BlockStack>
          
          <Badge tone={RISK_BADGE_TONE[action.riskLevel]}>
            {action.riskLevel.toUpperCase()} RISK
          </Badge>
        </InlineStack>
        
        <Divider />
        
        {/* Context */}
        <BlockStack gap="200">
          <InlineStack gap="100" blockAlign="start">
            <Text variant="bodyMd" fontWeight="semibold">Agent:</Text>
            <Text variant="bodyMd">{action.agentName}</Text>
          </InlineStack>
          
          <InlineStack gap="100" blockAlign="start">
            <Text variant="bodyMd" fontWeight="semibold">Action:</Text>
            <Text variant="bodyMd" fontWeight="medium">{action.toolName}</Text>
          </InlineStack>
          
          {action.metadata?.customerName && (
            <InlineStack gap="100" blockAlign="start">
              <Text variant="bodyMd" fontWeight="semibold">Customer:</Text>
              <Text variant="bodyMd">{action.metadata.customerName}</Text>
            </InlineStack>
          )}
        </BlockStack>
        
        {/* Preview */}
        {action.preview && (
          <>
            <Divider />
            <Box
              background="bg-surface-secondary"
              padding="400"
              borderRadius="200"
            >
              <Text variant="bodyMd">{action.preview}</Text>
            </Box>
          </>
        )}
        
        {/* Error Banner */}
        {state === 'error' && errorMessage && (
          <Banner
            tone="critical"
            title="Action Failed"
            onDismiss={() => setState('pending')}
          >
            <BlockStack gap="300">
              <Text variant="bodyMd">{errorMessage}</Text>
              <ButtonGroup>
                <Button onClick={handleRetry} size="slim">
                  Retry
                </Button>
                <Button 
                  onClick={() => setState('pending')} 
                  size="slim" 
                  variant="plain"
                >
                  Cancel
                </Button>
              </ButtonGroup>
            </BlockStack>
          </Banner>
        )}
        
        {/* Success State */}
        {state === 'approved' && (
          <Banner tone="success">
            <InlineStack gap="200" blockAlign="center">
              <Icon source={CheckIcon} tone="success" />
              <Text variant="bodyMd">
                Action approved and executed successfully
              </Text>
            </InlineStack>
          </Banner>
        )}
        
        {/* Actions */}
        <ButtonGroup>
          <Button
            variant="primary"
            onClick={handleApprove}
            loading={state === 'approving'}
            disabled={isActionDisabled}
            icon={CheckIcon}
            accessibilityLabel={`Approve ${action.toolName} for conversation ${action.conversationId}`}
          >
            {state === 'approving' ? 'Approving...' : 'Approve & Execute'}
          </Button>
          <Button
            onClick={handleReject}
            loading={state === 'rejecting'}
            disabled={isActionDisabled}
            icon={XIcon}
            tone="critical"
            accessibilityLabel={`Reject ${action.toolName} for conversation ${action.conversationId}`}
          >
            {state === 'rejecting' ? 'Rejecting...' : 'Reject'}
          </Button>
        </ButtonGroup>
        
        {/* Screen reader only - Risk description */}
        <Text variant="bodySm" visuallyHidden>
          Risk level: {action.riskLevel}. {RISK_DESCRIPTIONS[action.riskLevel]}
        </Text>
      </BlockStack>
    </Card>
  );
}

// Helper function for relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
```

### Usage in Approval Queue Route

```typescript
// app/routes/app.approvals.tsx
import { useLoaderData, useRevalidator } from 'react-router';
import { Page, Layout, BlockStack } from '@shopify/polaris';
import { ApprovalCard } from '~/components/approvals/ApprovalCard';
import type { ApprovalAction } from '~/components/approvals/types';

export default function ApprovalsRoute() {
  const { approvals } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  
  const handleApprove = async (id: string) => {
    const response = await fetch(`/api/approvals/${id}/approve`, {
      method: 'POST',
    });
    
    const result = await response.json();
    
    if (result.success) {
      revalidator.revalidate();
    }
    
    return result;
  };
  
  const handleReject = async (id: string, reason?: string) => {
    const response = await fetch(`/api/approvals/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      revalidator.revalidate();
    }
    
    return result;
  };
  
  const handleRemove = (id: string) => {
    // Card animates out, revalidate to remove from list
    revalidator.revalidate();
  };
  
  return (
    <Page
      title="Approval Queue"
      subtitle={`${approvals.length} pending approval${approvals.length !== 1 ? 's' : ''}`}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {approvals.length === 0 ? (
              <EmptyState />
            ) : (
              approvals.map((approval: ApprovalAction) => (
                <ApprovalCard
                  key={approval.id}
                  action={approval}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onRemove={handleRemove}
                  isProcessing={revalidator.state === 'loading'}
                />
              ))
            )}
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

---

## Implementation Checklist

### Phase 1: Core Component (Day 1)
- [ ] Create `ApprovalCard.tsx` with TypeScript interfaces
- [ ] Implement basic layout with Polaris components
- [ ] Add approve/reject handlers with loading states
- [ ] Test keyboard navigation
- [ ] Test screen reader announcements

### Phase 2: States & Feedback (Day 2)
- [ ] Implement error banner and retry mechanism
- [ ] Add success/approved states with animation
- [ ] Implement optimistic updates
- [ ] Add loading skeletons for queue
- [ ] Test all state transitions

### Phase 3: Polish & Accessibility (Day 3)
- [ ] Add risk level descriptions
- [ ] Implement relative time formatting
- [ ] Add keyboard shortcuts (optional)
- [ ] Run automated accessibility tests (axe-core)
- [ ] Test with screen readers (NVDA, VoiceOver)

### Phase 4: Integration (Day 4)
- [ ] Integrate with approval queue route
- [ ] Test with real API endpoints
- [ ] Add error handling for network issues
- [ ] Test timeout scenarios
- [ ] Performance testing (100+ approvals)

---

## Support & Resources

**Polaris Documentation:**
- Components: https://polaris.shopify.com/components
- Tokens: https://polaris.shopify.com/tokens
- Patterns: https://polaris.shopify.com/patterns

**Design Reviews:**
- Log all changes in `feedback/designer.md`
- Tag @engineer for implementation questions
- Request design review for new variants

**Questions:**
- Technical implementation: Ask @engineer
- Design decisions: Ask @designer
- API integration: Reference `docs/AgentSDKopenAI.md`

---

**Status**: Ready for Engineer Implementation  
**Created**: 2025-10-11  
**Owner**: Designer Agent  
**Next Review**: After Phase 1 implementation

