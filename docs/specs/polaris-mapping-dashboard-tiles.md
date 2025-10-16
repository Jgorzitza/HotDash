# Polaris Mappings — Dashboard Tiles

Status: Draft (2025-10-16)
Owner: Designer
Scope: Component-by-component mapping for each tile

---

## Conventions
- Layout: Grid (columns), BlockStack/InlineStack for spacing
- Container: Card or Box with border/shadow tokens
- Text: Text component with variant (e.g., bodySm, headingLg)
- Icons: Icon with tone (success/critical/subdued) and accessibilityLabel
- Feedback: Banner (critical/warning) and EmptyState
- Skeletons: SkeletonDisplayText, SkeletonBodyText

---

## Revenue
- Structure: Card > BlockStack
- Components & props:
  - Text variant="bodySm" (title)
  - Text variant="headingLg" fontWeight="bold" (value)
  - InlineStack gap="200": Icon tone="success" + Text (trend)
- Skeleton: SkeletonDisplayText (value), SkeletonBodyText (1 line)
- Error/Empty: Banner (critical)/EmptyState
- A11y: Icon accessibilityLabel (e.g., "Up 15 percent"); card aria-label="Open Revenue details"

## AOV
- Structure: Card > BlockStack
- Components & props:
  - Text (title), Text (value), Badge tone by trend
- Skeleton: SkeletonDisplayText, SkeletonBodyText
- Error/Empty: Banner/EmptyState
- A11y: Badge has accessible text (e.g., "+2.1 percent vs previous")

## Returns
- Structure: Card > BlockStack
- Components & props:
  - Text (title), Text (count), Text (pendingReview)
  - Icon tone="critical" when trend negative
- Skeleton: SkeletonDisplayText (count), SkeletonBodyText
- Error/Empty: Banner/EmptyState
- A11y: Include units in accessible name (e.g., "15 returns; 3 pending review")

## Stock Risk
- Structure: Card > BlockStack
- Components & props:
  - Text (title), Text (skuCount), Text (subtitle)
  - Badge tone based on risk level
- Skeleton: SkeletonDisplayText, SkeletonBodyText
- Error/Empty: Banner/EmptyState
- A11y: Avoid color-only risk; include "High risk" text

## SEO
- Structure: Card > BlockStack
- Components & props:
  - Text (title), Text (alertCount), Text (topAlert)
  - Icon tone based on alert severity
- Skeleton: SkeletonDisplayText, SkeletonBodyText
- Error/Empty: Banner/EmptyState
- A11y: Announce count and severity; link to details is a Button/Link

## CX
- Structure: Card > BlockStack
- Components & props:
  - Text (title), Text (escalationCount), Badge (slaStatus)
- Skeleton: SkeletonDisplayText, SkeletonBodyText
- Error/Empty: Banner/EmptyState
- A11y: Badge text spells out SLA state; avoid color-only cues

## Approvals
- Structure: Card > BlockStack
- Components & props:
  - Text (title), Text (pendingCount), InlineStack of Filter Chips (optional)
- Skeleton: SkeletonDisplayText, SkeletonBodyText
- Error/Empty: Banner/EmptyState
- A11y: Accessible name includes "Pending approvals: <n>"

