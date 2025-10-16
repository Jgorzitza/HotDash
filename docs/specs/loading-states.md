# Loading States & Skeletons

Status: Draft (2025-10-16)
Owner: Designer
Applies to: Dashboard tiles, Approvals drawer sections

---

## Principles
- Perceived performance: show immediate structure
- Avoid layout shift: reserve space with skeletons
- Communicate context: hint at what is loading

## Tiles
- Skeletons: title line (short), value block (large), trend line (short)
- Duration: min 300ms to avoid flicker; max 10s before fallback
- Transition: fade-in content over 150–250ms when ready
- Accessibility: skeletons have aria-hidden; announce "Loading <tile>"

## Approvals Drawer
- Header: skeleton title
- Evidence list: 3–5 skeleton rows
- Validation section: muted placeholder blocks

## Polaris Mapping
- Use SkeletonDisplayText for value
- Use SkeletonBodyText (1–2 lines) for title/trend
- Use SkeletonThumbnail for icon placeholders if present

## Empty vs. Loading
- Loading: skeletons visible; no call-to-action
- Empty: informative state with action (see error-states)

## Acceptance
- No CLS when data appears
- Screen readers announce loading and completion
- Skeletons match final layout dimensions

