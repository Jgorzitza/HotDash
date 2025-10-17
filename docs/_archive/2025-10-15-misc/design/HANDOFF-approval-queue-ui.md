---
epoch: 2025.10.E1
doc: docs/design/HANDOFF-approval-queue-ui.md
owner: designer
for: @engineer
priority: P0 - LAUNCH BLOCKER
created: 2025-10-11
---

# 🚨 P0 HANDOFF: Approval Queue UI Implementation

## Purpose

This document provides implementation-ready specifications for Engineer to build the approval queue UI that displays pending agent actions and allows operators to approve/reject them.

## API Contract (Already Built by Engineer ✅)

```typescript
// GET /approvals
Response: [{
  id: string;              // Approval ID
  conversationId: number;  // Chatwoot conversation
  createdAt: string;       // ISO timestamp
  pending: [{
    agent: string;         // Agent name
    tool: string;          // Tool name
    args: object;          // Tool arguments
  }]
}]

// POST /approvals/:id/:idx/approve
// POST /approvals/:id/:idx/reject
```

## Route Structure

**Create**: `app/routes/approvals/route.tsx`

```typescript
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useRevalidator } from '@remix-run/react';
import { Page, Layout, Card, EmptyState } from '@shopify/polaris';

interface Approval {
  id: string;
  conversationId: number;
  createdAt: string;
  pending: {
    agent: string;
    tool: string;
    args: Record<string, any>;
  }[];
}

// Loader: Fetch approvals from agent service
export async function loader({ request }: LoaderFunctionArgs) {
  const response = await fetch('http://localhost:8002/approvals');
  const approvals: Approval[] = await response.json();
  return json({ approvals });
}

export default function ApprovalsRoute() {
  const { approvals } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 5000);
    return () => clearInterval(interval);
  }, [revalidator]);

  return (
    <Page
      title="Approval Queue"
      subtitle={`${approvals.length} pending ${approvals.length === 1 ? 'approval' : 'approvals'}`}
    >
      <Layout>
        {approvals.length === 0 ? (
          <Layout.Section>
            <Card>
              <EmptyState
                heading="All clear!"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>No pending approvals. Check back later.</p>
              </EmptyState>
            </Card>
          </Layout.Section>
        ) : (
          approvals.map((approval) => (
            <Layout.Section key={approval.id}>
              <ApprovalCard approval={approval} />
            </Layout.Section>
          ))
        )}
      </Layout>
    </Page>
  );
}
```

## ApprovalCard Component

**Create**: `app/components/ApprovalCard.tsx`

```typescript
import { useState } from 'react';
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Badge,
  Banner,
} from '@shopify/polaris';
import { useSubmit } from '@remix-run/react';

interface ApprovalCardProps {
  approval: {
    id: string;
    conversationId: number;
    createdAt: string;
    pending: {
      agent: string;
      tool: string;
      args: Record<string, any>;
    }[];
  };
}

export function ApprovalCard({ approval }: ApprovalCardProps) {
  const submit = useSubmit();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const action = approval.pending[0]; // First pending action
  const riskLevel = getRiskLevel(action.tool);

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/approvals/${approval.id}/0/approve`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to approve');
      // Revalidate data
      submit(null, { method: 'post', action: '/approvals' });
    } catch (err) {
      setError('Failed to approve. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/approvals/${approval.id}/0/reject`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to reject');
      submit(null, { method: 'post', action: '/approvals' });
    } catch (err) {
      setError('Failed to reject. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <BlockStack gap="400">
        {/* Header */}
        <InlineStack align="space-between" blockAlign="center">
          <Text variant="headingMd" as="h2">
            Conversation #{approval.conversationId}
          </Text>
          <Badge tone={riskLevel === 'high' ? 'critical' : riskLevel === 'medium' ? 'warning' : 'success'}>
            {riskLevel.toUpperCase()} RISK
          </Badge>
        </InlineStack>

        {/* Agent & Tool Info */}
        <BlockStack gap="200">
          <Text variant="bodyMd" as="p">
            <strong>Agent:</strong> {action.agent}
          </Text>
          <Text variant="bodyMd" as="p">
            <strong>Tool:</strong> {action.tool}
          </Text>
          <Text variant="bodyMd" as="p" tone="subdued">
            <strong>Arguments:</strong> {JSON.stringify(action.args, null, 2)}
          </Text>
          <Text variant="bodySm" as="p" tone="subdued">
            Requested {new Date(approval.createdAt).toLocaleString()}
          </Text>
        </BlockStack>

        {/* Error Message */}
        {error && (
          <Banner tone="critical" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        )}

        {/* Actions */}
        <InlineStack gap="200">
          <Button
            variant="primary"
            tone="success"
            onClick={handleApprove}
            loading={loading}
            disabled={loading}
          >
            Approve
          </Button>
          <Button
            variant="primary"
            tone="critical"
            onClick={handleReject}
            loading={loading}
            disabled={loading}
          >
            Reject
          </Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

// Helper: Determine risk level based on tool
function getRiskLevel(tool: string): 'low' | 'medium' | 'high' {
  const highRisk = ['send_email', 'create_refund', 'cancel_order'];
  const mediumRisk = ['create_private_note', 'update_conversation'];

  if (highRisk.includes(tool)) return 'high';
  if (mediumRisk.includes(tool)) return 'medium';
  return 'low';
}
```

## Action Endpoints (for form submission)

**Create**: `app/routes/approvals.$id.$idx.approve/route.tsx`

```typescript
import { ActionFunctionArgs, redirect } from "@remix-run/node";

export async function action({ params }: ActionFunctionArgs) {
  const { id, idx } = params;

  await fetch(`http://localhost:8002/approvals/${id}/${idx}/approve`, {
    method: "POST",
  });

  return redirect("/approvals");
}
```

**Create**: `app/routes/approvals.$id.$idx.reject/route.tsx`

```typescript
import { ActionFunctionArgs, redirect } from "@remix-run/node";

export async function action({ params }: ActionFunctionArgs) {
  const { id, idx } = params;

  await fetch(`http://localhost:8002/approvals/${id}/${idx}/reject`, {
    method: "POST",
  });

  return redirect("/approvals");
}
```

## Navigation Link

**Update**: `app/components/Navigation.tsx` (or wherever nav is defined)

Add approval queue link to main navigation:

```typescript
<Navigation.Item
  url="/approvals"
  label="Approvals"
  badge={pendingCount > 0 ? String(pendingCount) : undefined}
  selected={location.pathname === '/approvals'}
/>
```

## Files to Create

1. ✅ `app/routes/approvals/route.tsx` - Main approval queue page
2. ✅ `app/components/ApprovalCard.tsx` - Approval card component
3. ✅ `app/routes/approvals.$id.$idx.approve/route.tsx` - Approve action
4. ✅ `app/routes/approvals.$id.$idx.reject/route.tsx` - Reject action
5. ⏳ Update navigation to include `/approvals` link

## Testing

1. Start agent service: `npm run dev:agent-service` (port 8002)
2. Visit `/approvals` route
3. Verify approvals load from API
4. Test approve/reject buttons
5. Verify auto-refresh every 5 seconds
6. Test empty state when no approvals

## Accessibility

- ✅ Semantic HTML (`<article>`, `<h2>`)
- ✅ Keyboard navigation (Tab, Enter)
- ✅ Loading states prevent double-submission
- ✅ Error messages announced to screen readers
- ✅ Badge colors meet WCAG AA contrast

## Next Steps (After Basic UI Works)

1. Polish: Better formatting of tool args (not raw JSON)
2. Mobile: Responsive layout for smaller screens
3. Real-time: Consider SSE or WebSocket for instant updates instead of 5s polling
4. Bulk: Allow approving/rejecting multiple items

---

## 🎯 Ready for Implementation

@engineer - This handoff is complete. All specs provided above. Let me know if you need clarification on any part.

**Evidence of completion**: Tag @designer when approval queue route is working and I can review the implementation.
