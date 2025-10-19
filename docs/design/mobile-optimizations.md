# Mobile-Specific Optimizations (<768px)

**Owner:** Designer  
**Date:** 2025-10-19  
**Version:** 1.0  
**Purpose:** Mobile viewport optimization patterns

---

## 1. Layout Adaptations

### 1.1 Grid to Stack

**Desktop/Tablet Grid:**

```tsx
<Grid gridTemplateColumns="repeat(2, 1fr)" gap="base">
```

**Mobile:**

```tsx
<Stack gap="base">{/* All columns become vertical stack */}</Stack>
```

### 1.2 Touch Target Sizing

**Minimum:** 44x44px for all interactive elements

```tsx
<Button style={{ minHeight: "44px", minWidth: "44px" }}>Action</Button>
```

---

## 2. Typography Scaling

**Font Scale: 0.9 on mobile**

| Desktop | Mobile  | Element    |
| ------- | ------- | ---------- |
| 1.5rem  | 1.35rem | heading2xl |
| 1.15rem | 1.04rem | headingMd  |
| 1rem    | 0.9rem  | body       |
| 0.85rem | 0.77rem | bodySm     |

---

## 3. Component Adaptations

### 3.1 Modals → Full Screen

```tsx
<Modal
  size={{ xs: "fullscreen", md: "large" }}
  heading={title}
>
```

### 3.2 Tables → Cards

**Desktop Table:**

```tsx
<Table>...</Table>
```

**Mobile Cards:**

```tsx
<Stack gap="small">
  {data.map((item) => (
    <Card key={item.id}>
      <Stack gap="small-200">
        <Text fontWeight="semibold">{item.title}</Text>
        <InlineStack gap="base">
          <Text variant="bodySm">Qty: {item.qty}</Text>
          <Text variant="bodySm">ROP: {item.rop}</Text>
        </InlineStack>
      </Stack>
    </Card>
  ))}
</Stack>
```

---

## 4. Gesture Support

- Swipe to dismiss modals
- Pull to refresh dashboards
- Pinch to zoom images
- Long press for context menus

---

## Change Log

- **2025-10-19:** v1.0 - Mobile optimization patterns
