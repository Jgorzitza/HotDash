# HotDash UI — Action-First

## Screens

### Action Dock (Home)

- Top 10 Actions with tags: type, expected $$, confidence, ease, and due-soon markers.
- Quick filters: SEO, Merch, Chat, Perf; "Auto-publish candidates".

### Action Detail

- **Draft**: rendered preview (title/meta/body; banner; reply).
- **Diff**: side-by-side or unified diff with <ins>/<del> highlights.
- **Evidence**: short panel (key queries, CTR/rank deltas, inventory levels, attach-rate).
- **Controls**: Approve, Edit, Dismiss, Rollback (if executed).

### Settings → Gates

- Toggle auto-publish tiers; set thresholds for confidence and risk types.
- Manage synonyms (e.g., `-6AN`, `AN6`, `6-AN`) for on-site search.

## UX Notes

- Latency: all actions should preview instantly (cached drafts).
- Accessibility: keyboard-first; clear focus; color-blind-safe diff marks.
