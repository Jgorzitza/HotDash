# Accessibility Annotations (WCAG 2.1 AA)

Status: Draft (2025-10-16)
Owner: Designer
Scope: Dashboard tiles + Approvals drawer

---

## Perceivable
- Text contrast ≥ 4.5:1 (normal), ≥ 3:1 (≥ 18px or 14px bold)
- Non-text contrast (icons/graphs) ≥ 3:1
- Provide text alternatives for icons conveying trend

## Operable
- Keyboard: All actions reachable via Tab / Shift+Tab
- Focus: Clear visible focus ring; order follows visual order
- Timing: Avoid timeouts; if needed, provide extend option
- Motion: Respect prefers-reduced-motion (limit animations)

## Understandable
- Copy: Simple, concise labels (title/value/trend)
- Errors: Clear messages with guidance
- Consistency: Same control = same behavior across tiles

## Robust
- Semantics: Buttons use <button>; clickable card has role=button + aria-label
- ARIA: Only when native semantics insufficient; avoid misuse
- Names: Accessible name includes tile title and action (e.g., “Open Revenue details”)

## Screen Reader Announcements
- Loading: "Loading <Tile Title>"
- Loaded: "<Tile Title> updated"
- Errors: Announce via role=alert + focus management

## Testing Checklist
- Navigate all interactive elements with keyboard only
- Verify contrast with tooling (axe/Polaris a11y checks)
- Validate names/roles via browser Accessibility panel
- Verify announcements with VoiceOver/NVDA

