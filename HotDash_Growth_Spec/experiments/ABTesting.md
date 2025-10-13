# A/B Testing (Lightweight)

## Assignment
- Randomly assign visitor to `variant = control|A|B` via first-party cookie.
- Persist assignment for 30 days.

## Instrumentation
- Send `ab_variant` as a GA4 custom dimension.
- Log experiment metadata in Postgres (`experiments` table).

## Analysis
- For SEO/UX experiments, use GA4 and GSC deltas post-publication.
- Auto-promote winners after minimum sample thresholds.

## Guardrails
- No SEO cloaking. Same content to bots and humans.
- Keep experiments few and focused.
