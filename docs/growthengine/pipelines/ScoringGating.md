# Scoring & Gating

## Impact Score (SEO)
For a candidate page/query pair:
```
expected_clicks = impressions7d * max(0, target_ctr - current_ctr)
expected_revenue = expected_clicks * cvr * aov
score = expected_revenue * confidence * ease
```
- `target_ctr` comes from the sitewide CTR curve by rank bucket.
- `confidence` uses historical win rates by change type and operator-edit similarity.
- `ease` = 1 for text-only, 0.7 for page create, 0.5 for multi-asset changes.

## Impact Score (Merch)
```
expected_revenue = traffic7d * (attach_uplift_pp / 100) * aov * margin
```

## Risk & Autopublish Tiers
- **Tier 0 (auto)** — meta description edits under 160 chars; link-only fixes; perf image compression with exact targets; programmatic page **unpublish** rollback.
- **Tier 1 (approve)** — new titles, new programmatic pages, bundle offers, chat replies.
- **Tier 2 (never auto)** — price text, brand promises, safety-critical content.

## Gating Checks
- Helpful, people-first content checklist (author/date, purpose clear, original visuals/tables).
- Structured data present for Product/Offer; returns & shipping declared.
- Webhook/adapter dry-run renders cleanly.
