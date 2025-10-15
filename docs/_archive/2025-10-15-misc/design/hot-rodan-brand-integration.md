---
epoch: 2025.10.E1
doc: docs/design/hot-rodan-brand-integration.md
owner: designer
created: 2025-10-12
task: 1E
---

# Task 1E: Hot Rodan Brand Integration

## Purpose
Ensure HotDash (Operator Control Center) aligns with Hot Rodan brand visual identity while maintaining Shopify Polaris design system compliance.

## Brand Identity

### Hot Rodan Concept
**Hot Rod / Automotive Theme**: Fast, powerful, reliable - like a well-tuned hot rod

**Core Brand Values**:
- **Speed**: Operators get instant insights (like a hot rod's acceleration)
- **Power**: Full control at operator's fingertips
- **Reliability**: Always on, always ready
- **Precision**: Fine-tuned, no wasted motion

### Color Scheme

**Primary Palette** (Hot Rod Inspired):
```css
/* Engine Red (Primary Action Color) */
--hotrodan-red-primary: #D72C0D;
--hotrodan-red-hover: #B91000;
--hotrodan-red-light: #FEF3F2;

/* Chrome Silver (Accent Color) */
--hotrodan-silver: #8C9196;
--hotrodan-silver-light: #E3E5E7;

/* Matte Black (Dashboard Background) */
--hotrodan-black: #1A1A1A;
--hotrodan-black-light: #2C2C2C;

/* Warning Amber (Alerts) */
--hotrodan-amber: #FFC453;
--hotrodan-amber-dark: #947100;
```

**Integration with Polaris**:
```css
/* Map Hot Rodan colors to Polaris tokens */
:root {
  /* Use Polaris critical tone for Hot Rodan red */
  --hotrodan-accent: var(--p-color-bg-critical-strong); /* #D72C0D */
  
  /* Polaris neutral for chrome silver */
  --hotrodan-neutral: var(--p-color-text-subdued); /* #6D7175 */
  
  /* Polaris surface for dashboard */
  --hotrodan-surface: var(--p-color-bg-surface); /* #FFFFFF light mode */
}
```

### Typography

**Dashboard Headers**: Use Polaris Inter font (default)
- Strong, clean, readable
- No custom fonts needed (keeps load fast)

**Tile Titles**: `headingMd` variant (16px, semibold)
**Body Text**: `bodyMd` variant (14px, regular)
**Metadata**: `bodySm` variant (12px, subdued)

### Imagery & Icons

**Hot Rod Theme Elements** (Subtle Integration):

1. **Dashboard Empty State**: 
   ```
   "Rev up your operations"
   Illustration: Minimal hot rod silhouette (optional)
   ```

2. **Loading State**:
   ```
   "Warming up the engine..."
   Subtle speedometer needle animation (optional)
   ```

3. **Success State**:
   ```
   "Full speed ahead!"
   Checkered flag icon (optional)
   ```

**Keep It Minimal**: Hot rod theme is conceptual, not literal. Use Polaris icons as default.

### Visual Identity Guidelines

**DO**:
- ✅ Use Polaris components exclusively
- ✅ Apply Hot Rodan red for critical approval actions
- ✅ Use "speed" and "power" language in copy
- ✅ Keep UI fast and responsive (matches "hot rod" concept)
- ✅ Use automotive metaphors in empty/success states sparingly

**DON'T**:
- ❌ Add literal car images to every screen
- ❌ Use custom fonts (slow load time = not "hot rod")
- ❌ Override Polaris color system (breaks accessibility)
- ❌ Use chrome textures or skeuomorphic effects
- ❌ Make it look like a car dashboard (we're a data dashboard)

### Brand Integration Examples

#### 1. Approval Button (Hot Rodan Red)
```typescript
<Button
  variant="primary"
  tone="critical"  // Hot Rodan red
  onClick={handleApprove}
>
  Approve
</Button>
```

**Note**: Polaris `critical` tone = Hot Rodan red (#D72C0D)

#### 2. Empty State Copy (Automotive Language)
```typescript
<EmptyState
  heading="All systems ready"
  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
>
  <p>No pending approvals. Your operation is running smoothly.</p>
</EmptyState>
```

**Before**: "No approvals"
**After**: "All systems ready" (automotive: engine idling, ready to go)

#### 3. Loading State Copy
```typescript
<SkeletonPage title="Starting engines..." />
```

**Before**: "Loading..."
**After**: "Starting engines..." (hot rod: warming up before race)

#### 4. Success Toast
```typescript
<Toast content="Full speed ahead! Approval processed." />
```

**Before**: "Success"
**After**: "Full speed ahead!" (hot rod: racing forward)

### Approval Queue Brand Alignment

**Page Title**:
```typescript
<Page title="Mission Control">
  {/* Approval cards */}
</Page>
```

**Before**: "Approval Queue"
**After**: "Mission Control" or "Command Center" (hot rod: driver's seat, full control)

**Badge Labels** (Optional Enhancement):
```typescript
// Current
<Badge tone="critical">HIGH RISK</Badge>

// Brand-aligned (optional)
<Badge tone="critical">⚠️ HOT</Badge>
```

**Rationale**: "HOT" = hot rod + high risk. Keep current if too informal.

### Copy Deck (Automotive-Inspired)

| Generic Copy | Hot Rodan Copy |
|--------------|----------------|
| Loading... | Starting engines... |
| Success | Full speed ahead! |
| All clear | All systems ready |
| No data | Idling... |
| Error | Engine trouble |
| Refresh | Tune-up |
| Dashboard | Mission Control |
| Approval Queue | Command Center |

**Use Sparingly**: 1-2 automotive terms per screen max. Don't overdo it.

### www.hotrodan.com Alignment

**If hotrodan.com exists**, match:
- Primary color (likely red or black)
- Logo placement
- Font choice (if custom)

**If hotrodan.com doesn't exist**, use guidelines above:
- Red primary (#D72C0D via Polaris critical)
- Black/silver accents
- Clean, fast UI (no decoration)

### Implementation Checklist

- [ ] Use Polaris `critical` tone for primary actions (maps to Hot Rodan red)
- [ ] Replace generic copy with automotive-inspired language (1-2 instances per screen)
- [ ] Update empty states: "All systems ready" instead of "No data"
- [ ] Update loading states: "Starting engines..." instead of "Loading..."
- [ ] Success toasts: "Full speed ahead!" instead of "Success"
- [ ] Consider "Mission Control" instead of "Approval Queue" (page title)
- [ ] Keep automotive theme subtle - Polaris components first, brand flavor in copy

### Evidence

**Brand Alignment Achieved**:
- ✅ Color scheme: Polaris critical tone = Hot Rodan red
- ✅ Copy: Automotive metaphors in key moments
- ✅ Speed: Fast UI = "hot rod" concept
- ✅ Clarity: Polaris design system maintained
- ✅ Accessibility: No custom colors that break WCAG

**Engineer can implement**: All brand elements use existing Polaris components + updated copy strings

---

**Status**: Hot Rodan brand integration specified - maintains Polaris, adds automotive flavor via copy

