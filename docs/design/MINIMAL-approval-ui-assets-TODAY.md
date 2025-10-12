---
epoch: 2025.10.E1
doc: docs/design/MINIMAL-approval-ui-assets-TODAY.md
owner: designer
for: @engineer Task 6
priority: P0 - TODAY LAUNCH
created: 2025-10-12
timeline: 2h
---

# 🚨 MINIMAL Approval UI Assets for TODAY Launch

## Keep It Simple - Ship TODAY

**Philosophy**: Use Polaris defaults. No custom graphics. No fancy animations. SHIP.

---

## Icons (Use Polaris - Already Imported)

### Approve Button
```typescript
// NO ICON - Just text button
<Button variant="primary" tone="success">
  Approve
</Button>
```

**That's it.** Text is clearer than icons.

### Reject Button
```typescript
// NO ICON - Just text button
<Button variant="primary" tone="critical">
  Reject
</Button>
```

**Rationale**: Icons add complexity. Text is unambiguous. Ship faster.

---

## Loading State (Polaris Built-In)

### Initial Page Load
```typescript
import { SkeletonPage } from '@shopify/polaris';

{isLoading ? (
  <SkeletonPage primaryAction />
) : (
  <Page>{/* Approval cards */}</Page>
)}
```

**That's it.** Polaris handles the shimmer animation.

### Button Loading
```typescript
<Button 
  variant="primary" 
  tone="success"
  loading={isApproving}
>
  Approve
</Button>
```

**Built-in spinner.** No custom code needed.

---

## Empty State (Polaris Component)

```typescript
import { EmptyState } from '@shopify/polaris';

{approvals.length === 0 && (
  <Card>
    <EmptyState
      heading="All clear!"
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <p>No pending approvals.</p>
    </EmptyState>
  </Card>
)}
```

**Standard Polaris image.** Looks professional, zero work.

---

## Error State (Banner Component)

```typescript
import { Banner } from '@shopify/polaris';

{error && (
  <Banner tone="critical" onDismiss={() => setError(null)}>
    <p>{error}</p>
  </Banner>
)}
```

**Red banner.** User knows something went wrong. Done.

---

## Complete Minimal ApprovalCard

```typescript
export function ApprovalCard({ approval }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleApprove = async () => {
    setLoading(true);
    try {
      await fetch(`/api/approvals/${approval.id}/approve`, { method: 'POST' });
      // Success - card will disappear on next refresh
    } catch (err) {
      setError('Failed to approve');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <BlockStack gap="400">
        {error && (
          <Banner tone="critical" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        )}
        
        <Text variant="headingMd" as="h2">
          Conversation #{approval.conversationId}
        </Text>
        
        <Text>Tool: {approval.tool}</Text>
        
        <InlineStack gap="200">
          <Button
            variant="primary"
            tone="success"
            onClick={handleApprove}
            loading={loading}
          >
            Approve
          </Button>
          <Button
            variant="primary"
            tone="critical"
            onClick={handleReject}
            loading={loading}
          >
            Reject
          </Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
```

**That's the whole component.** ~30 lines. Ships TODAY.

---

## What We're NOT Doing (For TODAY)

❌ Custom icons
❌ Fancy animations
❌ Risk level badges (can add post-launch)
❌ Timestamp formatting (can add post-launch)
❌ Tool argument display (can add post-launch)
❌ Keyboard shortcuts (can add post-launch)

✅ **SHIPPING WORKING APPROVAL UI TODAY**

---

## Implementation Checklist for Engineer

- [ ] Create `app/components/ApprovalCard.tsx` (copy code above)
- [ ] Create `app/routes/approvals/route.tsx` (fetch approvals, map to cards)
- [ ] Add approve/reject API routes
- [ ] Test: Can I approve/reject an approval?
- [ ] **DONE** - Ship it

**Timeline**: 1-2 hours max

---

## Designer Review (Quick)

Once Engineer implements:
1. Does it work? (Can I approve/reject?)
2. Does it look broken? (Polaris styling should look fine)
3. Any obvious visual bugs?

**Review time**: 15 minutes

If it works and looks reasonable → **SHIP IT**

We can polish post-launch.

---

**Evidence**: Minimal assets spec ready. Engineer can implement in 1-2h. TODAY LAUNCH ✅
