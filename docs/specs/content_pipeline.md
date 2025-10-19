# Launch Content Brief

Date: 2025-10-19
Owner: content agent
Status: Approved — CEO (self) tone review completed

## Engagement Metrics (Launch KPI Set)

- Engagement Rate = (likes + comments + shares + saves) / impressions × 100
- Click-Through Rate = clicks / impressions × 100
- Conversion Rate = conversions / clicks × 100

Sources:

- See docs/specs/content_tracking.md for interface definitions and formulas

## KPI Targets (Launch)

Measurement Window: first 14 days post-publish (UTC) per post; weekly rollup for dashboard.

Targets:

- Instagram Engagement Rate ≥ 4.0%
- TikTok Engagement Rate ≥ 5.0%
- Facebook Engagement Rate ≥ 2.0%
- Click-Through Rate (all platforms) ≥ 1.2%
- Conversion Rate (site traffic from social) ≥ 2.0% (post-click)

Operational Notes:

- Zero-division guardrails apply (see formulas in content_tracking spec).
- Use platform saves where available (IG/TikTok) in ER numerator.
- Attribution: last non-direct click from social to on-site event (future GA4 correlation).

## Metrics Sources

- Tracking library: app/lib/content/tracking.ts (formulas + placeholders)
- Spec: docs/specs/content_tracking.md (data structures, formulas)
- Data (future): Publer adapter, Supabase storage, GA4 correlation

## Evidence & Data Sources

- Dashboard: planned tile for content performance (Milestone M6)
- GA4: correlation for conversion tracking (future)
- Supabase: content posts + performance history (future)

## Tone Checklist (CEO Review Required)

- Clear, concise copy; action-first
- Brand voice: friendly, direct, helpful
- Avoid jargon; emphasize user outcome
- Include CTA where appropriate

Review Status: APPROVED by CEO (self) on 2025-10-19

## Approvals

- CEO Tone Approval: APPROVED (self)
- Metrics Targets: PENDING (to be confirmed with Product/Ads)

## Next Steps

- Finalize targets post-review
- Update feedback/content/2025-10-19.md with approvals and metric sources
