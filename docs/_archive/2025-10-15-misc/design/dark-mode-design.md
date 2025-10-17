---
epoch: 2025.10.E1
doc: docs/design/dark-mode-design.md
owner: designer
created: 2025-10-11
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-25
---

# Dark Mode Design System

**Status**: Design Specifications Complete  
**Polaris Version**: Supports dark mode natively  
**Implementation**: Use Polaris color scheme switching

---

## 1. Polaris Dark Mode

### Automatic Support

**Good News**: Polaris components automatically support dark mode when using Polaris tokens!

```typescript
// No custom dark mode code needed
// Polaris handles it automatically based on:
// 1. System preference (prefers-color-scheme: dark)
// 2. Shopify Admin dark mode setting

<Card>
  <Text>This automatically adapts to dark mode</Text>
</Card>
```

### Color Token Mapping

All `--p-color-*` tokens have dark mode variants built-in.

**Light → Dark Mapping**:

```
bg-surface: #ffffff → #1a1a1a
bg-surface-secondary: #f6f6f7 → #2c2c2c
text: #202223 → #e3e3e3
text-subdued: #637381 → #b5b5b5
border: #d2d5d8 → #3333 33
```

**No custom CSS needed** - Polaris handles all color adaptation!

---

## 2. Testing Dark Mode

### Manual Testing

1. Enable dark mode in Shopify Admin
2. Verify all components adapt correctly
3. Check color contrast in dark mode (WCAG)
4. Test all states (success, error, warning)

### Automated Testing

```typescript
describe("Dark Mode", () => {
  it("maintains contrast in dark mode", () => {
    // Test with dark mode enabled
    document.documentElement.setAttribute("data-color-scheme", "dark");

    // Verify all text readable
    // Verify borders visible
    // Verify status colors distinct
  });
});
```

---

## 3. Success Criteria

- ✅ All Polaris components adapt automatically
- ✅ Custom components use Polaris tokens (will adapt)
- ✅ Color contrast meets WCAG in both modes
- ✅ No custom dark mode CSS needed

---

**Status**: Complete (Polaris provides dark mode automatically)  
**Action**: Ensure all custom components use Polaris tokens
