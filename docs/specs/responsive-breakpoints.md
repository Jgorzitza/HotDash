# Responsive Breakpoints (Dashboard)

Status: Draft (2025-10-16)
Owner: Designer
Scope: Dashboard tiles grid + Approvals drawer references

---

## Breakpoints
- Mobile: 320-767px
- Tablet: 768-1023px
- Desktop: 1024px+

## Grid Columns
- Mobile: 4 columns
- Tablet: 8 columns
- Desktop: 12 columns

## Gutters & Padding
- Gutters: 16 (mobile), 20 (tablet), 24 (desktop)
- Tile Padding: 16 (mobile), 20 (tablet), 24 (desktop)

## Tile Sizing
- Min width: 1 col (mobile), 2 cols (tablet), 3 cols (desktop)
- Min height: 120 (compact), 160 (standard)
- Aspect guidance: avoid overly tall tiles; prioritize scannability

## Wrapping & Order
- Mobile: single column stacks permitted
- Tablet: two-up common; prioritize top tiles
- Desktop: three-up+ grid; maintain reading order left-to-right, top-to-bottom

## Typography Scaling
- Value: 24 (mobile), 28 (tablet), 32 (desktop)
- Title: 14 across breakpoints
- Trend: 14 across; maintain contrast spacing

## Approvals Drawer (reference)
- Mobile: full-screen modal behavior
- Tablet: side drawer 80% width
- Desktop: side drawer 480-576px
- Focus management: trap within drawer; restore on close

## Acceptance
- Layouts render cleanly at 360, 768, 1024, 1440 px
- No overflow/clip at card edges
- Hit targets >= 44 px for interactive elements

