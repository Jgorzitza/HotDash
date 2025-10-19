# Polaris Token Mapping — Engineer Reference

**Owner:** Designer  
**For:** Engineering Team  
**Date:** 2025-10-19  
**Purpose:** Map Hot Rod AN design requirements to Polaris component props

---

## 1. Spacing Tokens

### Gap (Stack/Grid/InlineStack)

| Design Requirement | Polaris Prop      | Pixel Value | Usage                        |
| ------------------ | ----------------- | ----------- | ---------------------------- |
| Tile grid gap      | `gap="large"`     | 20px        | Between tiles in dashboard   |
| Internal tile gap  | `gap="base"`      | 16px        | Between sections within tile |
| Compact spacing    | `gap="small"`     | 8px         | Between badge and text       |
| Tight spacing      | `gap="small-200"` | 4px         | Icon and label inline        |

**Example:**

```tsx
// Tile grid
<Grid gap="large">
  <TileCard />
  <TileCard />
</Grid>

// Internal tile
<Stack gap="base">
  <Text variant="headingMd">Section</Text>
  <Text>Content</Text>
</Stack>
```

### Padding (Box/Container)

| Design Requirement | Polaris Prop      | Pixel Value | Usage           |
| ------------------ | ----------------- | ----------- | --------------- |
| Tile padding       | `padding="large"` | 20px        | All tiles       |
| Section padding    | `padding="base"`  | 16px        | Modal sections  |
| Compact padding    | `padding="small"` | 8px         | Badges, chips   |
| No padding         | `padding="none"`  | 0px         | Grid containers |

**Example:**

```tsx
<Box padding="large" borderRadius="base">
  {/* Tile content with 20px padding */}
</Box>
```

---

## 2. Typography Tokens

### Text Variants

| Design Element               | Polaris Variant     | Size    | Weight   | Usage                |
| ---------------------------- | ------------------- | ------- | -------- | -------------------- |
| Large metrics (5/5, revenue) | `heading2xl`        | 1.5rem  | bold     | Tile primary metrics |
| Tile headings                | `headingMd`         | 1.15rem | semibold | Tile titles          |
| Section headings             | `headingMd`         | 1.15rem | semibold | Within tiles         |
| Body text                    | `bodyLg` or default | 1rem    | regular  | Main content         |
| Meta text (timestamps)       | `bodySm`            | 0.85rem | regular  | "Last refreshed..."  |

**Example:**

```tsx
// Large metric
<Text variant="heading2xl" fontWeight="bold">
  5/5
</Text>

// Meta text
<Text variant="bodySm" tone="subdued">
  Last refreshed 2 minutes ago • Source: fresh
</Text>
```

### Font Weight

| Design Requirement | Polaris Prop            | Value | Usage                         |
| ------------------ | ----------------------- | ----- | ----------------------------- |
| Bold metrics       | `fontWeight="bold"`     | 700   | Primary numbers               |
| Semibold labels    | `fontWeight="semibold"` | 600   | Tile titles, section headings |
| Regular text       | `fontWeight="regular"`  | 400   | Body content (default)        |

---

## 3. Color Tokens

### Text Tones

| Design Requirement | Polaris Prop      | Color   | Usage                 |
| ------------------ | ----------------- | ------- | --------------------- |
| Primary text       | default           | #202223 | Headlines, body text  |
| Subdued text       | `tone="subdued"`  | #637381 | Meta text, timestamps |
| Success text       | `tone="success"`  | Green   | Positive messages     |
| Critical text      | `tone="critical"` | Red     | Error messages        |
| Warning text       | `tone="warning"`  | Yellow  | Warnings, cautions    |

**Example:**

```tsx
<Text>Primary text (default)</Text>
<Text tone="subdued">Last refreshed 2 min ago</Text>
<Text tone="critical">Error: Validation failed</Text>
```

### Badge Tones

| Status    | Polaris Tone      | Color  | Usage                        |
| --------- | ----------------- | ------ | ---------------------------- |
| Healthy   | `tone="success"`  | Green  | ok state, Full, Approved     |
| Attention | `tone="critical"` | Red    | error state, Errors          |
| Warning   | `tone="warning"`  | Yellow | Filling, Pending, Warnings   |
| Info      | `tone="info"`     | Blue   | Draft, informational         |
| Neutral   | default           | Gray   | Kind badges (CX_REPLY, etc.) |

**Example:**

```tsx
<Badge tone="success">Full</Badge>
<Badge tone="warning">Filling</Badge>
<Badge tone="critical">Attention needed</Badge>
<Badge tone="info">Draft</Badge>
<Badge>CX_REPLY</Badge>  {/* default/neutral */}
```

### Button Tones

| Action Type      | Polaris Props                       | Color     | Usage                        |
| ---------------- | ----------------------------------- | --------- | ---------------------------- |
| Primary action   | `variant="primary"`                 | Blue      | Approve, Save, Submit        |
| Secondary action | `variant="secondary"`               | Gray      | Cancel, Save as draft        |
| Critical action  | `variant="primary" tone="critical"` | Red       | Reject, Delete, Cancel order |
| Tertiary action  | `variant="tertiary"`                | Text only | Less important actions       |

**Example:**

```tsx
<Button variant="primary">Approve</Button>
<Button variant="secondary">Request changes</Button>
<Button variant="primary" tone="critical">Reject</Button>
```

---

## 4. Border & Radius Tokens

### Border Radius

| Design Element | Polaris Prop          | Value | Usage            |
| -------------- | --------------------- | ----- | ---------------- |
| Tiles          | `borderRadius="base"` | 12px  | All tile cards   |
| Buttons        | Polaris default       | 8px   | Standard buttons |
| Badges         | Polaris default       | 4px   | Status badges    |
| No radius      | `borderRadius="none"` | 0px   | Tables, dividers |

**Example:**

```tsx
<Box borderRadius="base" padding="large">
  {/* Tile with 12px rounded corners */}
</Box>
```

### Border Width & Color

| Design Requirement | Polaris Props                         | Usage                 |
| ------------------ | ------------------------------------- | --------------------- |
| Subtle border      | `border="base" borderColor="subdued"` | Tile containers       |
| Strong border      | `border="base" borderColor="strong"`  | Active/focused states |
| No border          | `border="none"`                       | Default tiles         |

---

## 5. Layout Tokens

### Grid Template

**Dashboard Grid:**

```tsx
<div
  style={{
    display: "grid",
    gap: "var(--p-space-500)", // 20px (Polaris "large")
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  }}
>
  {tiles.map((tile) => (
    <TileCard key={tile.id} {...tile} />
  ))}
</div>
```

**Two-Column Layout:**

```tsx
<Grid gridTemplateColumns="1fr 1fr" gap="base">
  <Box>Left</Box>
  <Box>Right</Box>
</Grid>
```

### Flex Patterns

**Space Between:**

```tsx
<InlineStack align="space-between">
  <Text>Label</Text>
  <Text fontWeight="semibold">Value</Text>
</InlineStack>
```

**Centered:**

```tsx
<InlineStack align="center" blockAlign="center">
  <Spinner />
</InlineStack>
```

---

## 6. Shadow & Elevation

### Card Shadows

| State   | Polaris Component   | Shadow              | Usage              |
| ------- | ------------------- | ------------------- | ------------------ |
| Default | `<Card>` or `<Box>` | Polaris card shadow | Tile default state |
| Hover   | CSS `:hover`        | Elevated shadow     | Interactive tiles  |
| Active  | CSS `:active`       | Pressed shadow      | Button pressed     |

**Polaris handles shadows automatically for Card/Box components.**

---

## 7. Responsive Tokens

### Breakpoint Values

```tsx
// Polaris breakpoints (use Polaris utilities)
const breakpoints = {
  xs: 0, // Mobile
  sm: 490, // Small mobile
  md: 768, // Tablet
  lg: 1024, // Desktop
  xl: 1280, // Large desktop
};
```

### Responsive Props

**Stack Direction:**

```tsx
<Stack
  direction={{
    xs: "block", // Mobile: vertical
    md: "inline", // Tablet+: horizontal
  }}
  gap="base"
>
  <Box>Item 1</Box>
  <Box>Item 2</Box>
</Stack>
```

**Conditional Rendering:**

```tsx
// Mobile: hide non-critical metadata
<Box display={{ xs: "none", md: "block" }}>
  <Text variant="bodySm">Last refreshed 2 min ago</Text>
</Box>
```

---

## 8. Animation Tokens

### Transition Durations

| Animation         | Duration  | Easing      | Usage                |
| ----------------- | --------- | ----------- | -------------------- |
| Drawer open       | 300ms     | ease-out    | Modal slide-in       |
| Badge tone change | 200ms     | ease        | Status transitions   |
| Skeleton shimmer  | 1.5s loop | ease-in-out | Loading state        |
| Button hover      | 150ms     | ease        | Interactive feedback |

**Polaris Components:**

```tsx
// Polaris Modal handles animation automatically
<Modal onClose={close}>...</Modal>

// Custom animations (use CSS)
.occ-skeleton {
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
```

---

## 9. Icon System

### Polaris Icon Types

**Common Icons:**

```tsx
<Icon type="check" />          // Approve, complete
<Icon type="x" />              // Close, reject
<Icon type="alert-circle" />   // Error, attention
<Icon type="info-filled" />    // Information
<Icon type="refresh" />        // Reload, retry
<Icon type="external" />       // External link
```

### Icon Sizing

| Context     | Polaris Prop   | Size | Usage                    |
| ----------- | -------------- | ---- | ------------------------ |
| Button icon | `size="base"`  | 20px | Standard buttons         |
| Small icon  | `size="small"` | 16px | Inline with text         |
| Large icon  | Custom         | 24px | Empty states, large CTAs |

**Example:**

```tsx
<Button accessibilityLabel="Refresh">
  <Icon type="refresh" size="base" />
</Button>
```

---

## 10. Implementation Patterns

### Pattern 1: Tile with Status

```tsx
<Box padding="large" borderRadius="base" border="base" borderColor="subdued">
  <Stack gap="base">
    <InlineStack align="space-between">
      <Text variant="headingMd">{title}</Text>
      <Badge tone={statusTone}>{statusLabel}</Badge>
    </InlineStack>

    <Text variant="bodySm" tone="subdued">
      Last refreshed {timeAgo} • Source: {source}
    </Text>

    {renderContent(data)}
  </Stack>
</Box>
```

### Pattern 2: Metric Display

```tsx
<Stack gap="small">
  <Text variant="heading2xl" fontWeight="bold">
    {metricValue}
  </Text>
  <Text variant="bodySm" tone="subdued">
    {metricLabel}
  </Text>
</Stack>
```

### Pattern 3: Count with Label

```tsx
<InlineStack align="space-between">
  <Text variant="bodySm" tone="subdued">
    Pending
  </Text>
  <Text variant="bodySm" fontWeight="semibold">
    {count}
  </Text>
</InlineStack>
```

### Pattern 4: Error Banner

```tsx
<Banner tone="critical" role="alert">
  <Stack gap="small">
    <Text fontWeight="semibold">Validation Errors</Text>
    <ul>
      {errors.map((e) => (
        <li key={e.field}>{e.message}</li>
      ))}
    </ul>
  </Stack>
</Banner>
```

---

## 11. Anti-Patterns (DO NOT USE)

### ❌ Custom CSS for Polaris Props

```tsx
// ❌ Bad
<div style={{ padding: '20px', gap: '16px' }}>

// ✅ Good
<Stack gap="base" padding="large">
```

### ❌ Inline Color Styles

```tsx
// ❌ Bad
<span style={{ color: '#1a7f37' }}>Healthy</span>

// ✅ Good
<Badge tone="success">Healthy</Badge>
```

### ❌ Hard-Coded Font Sizes

```tsx
// ❌ Bad
<h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Title</h2>

// ✅ Good
<Text variant="heading2xl" fontWeight="bold">Title</Text>
```

### ❌ Non-Semantic Markup

```tsx
// ❌ Bad
<div className="button" onClick={click}>Click</div>

// ✅ Good
<Button onClick={click}>Click</Button>
```

---

## 12. Quick Token Lookup

### Most Common Props

**Stack/InlineStack:**

- `gap="base"` → 16px (most common)
- `gap="small"` → 8px (compact)
- `gap="large"` → 24px (spacious)

**Box/Container:**

- `padding="large"` → 20px (tiles)
- `padding="base"` → 16px (sections)
- `borderRadius="base"` → 12px (tiles)

**Text:**

- `variant="heading2xl"` → Large metrics
- `variant="headingMd"` → Tile titles
- `variant="bodySm"` → Meta text
- `tone="subdued"` → Secondary text

**Badge:**

- `tone="success"` → Green (healthy)
- `tone="warning"` → Yellow (pending)
- `tone="critical"` → Red (errors)
- `tone="info"` → Blue (draft)

**Button:**

- `variant="primary"` → Blue (main actions)
- `variant="secondary"` → Gray (alternate)
- `tone="critical"` → Red (destructive)

---

## 13. Verification Checklist

Before committing:

- [ ] No hard-coded pixel values (use Polaris props)
- [ ] No inline color styles (use `tone` props)
- [ ] No custom font-size (use `variant` props)
- [ ] All spacing via `gap`/`padding` props
- [ ] Run `npm run lint` (0 jsx-a11y errors)
- [ ] Visual check matches design spec

---

## Change Log

- **2025-10-19:** v1.0 - Initial Polaris token mapping for engineers
