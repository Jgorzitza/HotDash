---
epoch: 2025.10.E1
doc: docs/design/empty-state-library.md
owner: designer
created: 2025-10-11
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-25
---

# Empty State Design Library

**Status**: Complete Component Library  
**Polaris**: Uses EmptyState component

---

## 1. Empty State Patterns

### Pattern 1: Success Empty (No Issues)

```typescript
<EmptyState
  heading="All caught up!"
  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
>
  <Text variant="bodyMd" alignment="center">
    No items need your attention right now. Great work!
  </Text>
</EmptyState>
```

**Use For**:
- No pending approvals
- No escalations
- No errors

---

### Pattern 2: First-Time Empty (New Feature)

```typescript
<EmptyState
  heading="Waiting for first activity"
  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-apps.png"
>
  <BlockStack gap="400">
    <Text variant="bodyMd" alignment="center">
      Content will appear here when available.
    </Text>
    <Button url="/help">Learn More</Button>
  </BlockStack>
</EmptyState>
```

**Use For**:
- New installations
- Features not yet configured
- First-time user experience

---

### Pattern 3: Filtered Empty (No Matches)

```typescript
<EmptyState
  heading="No results found"
  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-search.png"
>
  <BlockStack gap="300">
    <Text variant="bodyMd" alignment="center">
      Try adjusting your filters to see more results.
    </Text>
    <Button onClick={clearFilters}>Clear Filters</Button>
  </BlockStack>
</EmptyState>
```

**Use For**:
- Search with no results
- Filtered views with no matches
- Date range with no data

---

### Pattern 4: Error Empty (Something Went Wrong)

```typescript
<EmptyState
  heading="Unable to load data"
  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-error.png"
>
  <BlockStack gap="400">
    <Text variant="bodyMd" alignment="center">
      We encountered an error loading this content.
    </Text>
    <ButtonGroup>
      <Button onClick={retry}>Retry</Button>
      <Button url="mailto:customer.support@hotrodan.com" variant="plain">
        Contact Support
      </Button>
    </ButtonGroup>
  </BlockStack>
</EmptyState>
```

**Use For**:
- API failures
- Network errors
- Permission errors

---

## 2. Loading State Library

### Skeleton Patterns

**Card Skeleton**:
```typescript
<Card>
  <BlockStack gap="400">
    <SkeletonDisplayText size="small" />
    <SkeletonBodyText lines={3} />
    <SkeletonBodyText lines={2} />
  </BlockStack>
</Card>
```

**Table Skeleton**:
```typescript
<Card>
  <DataTable
    columnContentTypes={['text', 'numeric', 'numeric']}
    headings={['Name', 'Count', 'Rate']}
    rows={[]} 
  />
  <SkeletonBodyText lines={5} />
</Card>
```

**Metric Skeleton**:
```typescript
<Card>
  <BlockStack gap="200">
    <SkeletonDisplayText size="small" />
    <SkeletonBodyText lines={1} />
  </BlockStack>
</Card>
```

---

## 3. Error State Library

### Network Error

```typescript
<Banner tone="critical" title="Connection Lost">
  <Text>Unable to connect. Check your internet and try again.</Text>
</Banner>
```

### API Error

```typescript
<Banner tone="critical" title="Service Unavailable">
  <Text>Our team has been notified. Please try again shortly.</Text>
</Banner>
```

### Permission Error

```typescript
<EmptyState
  heading="Access Denied"
  image="..."
>
  <Text>You don't have permission to view this content.</Text>
  <Button url="mailto:admin">Request Access</Button>
</EmptyState>
```

---

## 4. Component Inventory

**Created** (reusable components):
- SuccessEmptyState
- FirstTimeEmptyState  
- FilteredEmptyState
- ErrorEmptyState
- CardSkeleton
- TableSkeleton
- MetricSkeleton

---

**Status**: Complete Empty State Library  
**Created**: 2025-10-11  
**Owner**: Designer Agent


