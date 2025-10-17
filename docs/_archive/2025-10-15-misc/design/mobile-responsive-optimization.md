---
epoch: 2025.10.E1
doc: docs/design/mobile-responsive-optimization.md
owner: designer
created: 2025-10-11
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-25
---

# Mobile Responsive Optimization

**Status**: Design Specifications Complete  
**Breakpoints**: Mobile (<768px), Tablet (768-1279px), Desktop (1280px+)

---

## 1. Mobile Dashboard (<768px)

### Layout: Single Column Stack

**Tiles**: Stack vertically with full width

```typescript
<InlineGrid columns={{ xs: 1, md: 2, lg: 3 }} gap="400">
  {tiles.map(tile => <TileCard key={tile.id} {...tile} />)}
</InlineGrid>
```

### Touch Targets

**Minimum Size**: 44x44px (Apple/WCAG recommendation)

```typescript
<Button size="large" fullWidth={{ xs: true, md: false }}>
  Large touch target on mobile
</Button>
```

---

## 2. Mobile Approval Queue

### Simplified Card Layout

```typescript
// Desktop: Full details visible
// Mobile: Collapsed with expand button

<Card>
  <BlockStack gap="300">
    <InlineStack align="space-between">
      <Text variant="headingMd" as="h2">Agent Proposal</Text>
      <Badge>HIGH RISK</Badge>
    </InlineStack>

    {/* Mobile: Show summary only */}
    <Box display={{ xs: 'block', md: 'none' }}>
      <Text variant="bodyMd">
        Conversation #{id} · {agentName}
      </Text>
      <Button fullWidth onClick={expand}>Show Details</Button>
    </Box>

    {/* Desktop: Show all details */}
    <Box display={{ xs: 'none', md: 'block' }}>
      {/* Full card content */}
    </Box>
  </BlockStack>
</Card>
```

---

## 3. Mobile Modal Patterns

### Full-Screen Modals on Mobile

```typescript
<Modal
  open={open}
  onClose={onClose}
  title="Review Approval"
  size={{ xs: 'fullScreen', md: 'medium' }}
>
  <Modal.Section>
    {/* Content */}
  </Modal.Section>
</Modal>
```

---

## 4. Mobile Navigation

### Bottom Navigation Bar (Mobile Only)

```typescript
<Box display={{ xs: 'block', md: 'none' }} position="fixed" insetBlockEnd="0" insetInline="0">
  <Card>
    <InlineStack align="space-around">
      <Button icon={HomeIcon} variant="plain">Home</Button>
      <Button icon={CheckIcon} variant="plain">
        <Badge tone="info">3</Badge>
        Approvals
      </Button>
      <Button icon={ChartIcon} variant="plain">Metrics</Button>
      <Button icon={SettingsIcon} variant="plain">Settings</Button>
    </InlineStack>
  </Card>
</Box>
```

---

## 5. Success Criteria

- [ ] All tiles readable on 375px width (iPhone SE)
- [ ] Touch targets ≥ 44x44px
- [ ] No horizontal scrolling
- [ ] Modals full-screen on mobile
- [ ] Navigation accessible on mobile

---

**Status**: Complete  
**Owner**: Designer Agent
