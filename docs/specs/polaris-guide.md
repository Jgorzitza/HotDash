# Polaris Component Usage Guide (Dashboard & Approvals)

Status: Draft (2025-10-16)
Owner: Designer

---

## Principles
- Default to Polaris primitives (Card/Box, Grid/Stack) for layout
- Prefer built-in feedback (Banner, EmptyState) over custom
- Reuse Skeleton components for loading

## Dashboard Tiles
- Container: Card or Box with shadow + border tokens (padding 16/20/24 per breakpoint)
- Layout: Grid (columns), InlineStack/BlockStack for internal spacing (gap="200" typical)
- Text: Text component (title: bodySm; value: headingLg, fontWeight="bold")
- Indicators: Icon (tone: success/critical/subdued) + Badge when applicable
- Actions: Button/Link for drill-down; use variant hierarchy per Polaris

## Approvals Drawer
- Structure: Page/Frame + side Drawer (layout)
- Lists: ResourceList for evidence items (or legacy IndexTable if needed)
- Forms: FormLayout, TextField, Select, Checkbox
- Feedback: Banner (critical/warning), InlineError for fields

## Skeletons
- SkeletonDisplayText for headline value areas
- SkeletonBodyText (1–2 lines) for labels/metadata
- SkeletonThumbnail for icons/images

## Do / Don’t
- Do use Grid for responsive layouts; Don’t hand-code breakpoints if Polaris provides helpers
- Do use Banner for errors; Don’t build custom alert boxes
- Do use Button variants for clear hierarchy; Don’t rely on color alone

## References
- Pair this with: responsive-breakpoints.md, loading-states.md, error-states.md, accessibility.md, design-tokens.md

