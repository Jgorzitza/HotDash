# Telemetry — GA4 Only (Phase‑Now) + Bing Webmaster

## GA4
- Property ID: **339826228** (prod). Put Measurement ID (G‑XXXX) in env `GA4_MEASUREMENT_ID`.
- Use **Data API (runReport)** for landers, CTR, revenue; windows: today / 7d / 28d.
- Show **freshness windows** on tiles. Note if GA4 thresholds/sampling apply on small datasets.

## Dimensions/Metrics (suggested)
- Dimensions: `pagePath`, `pageTitle`, `sessionDefaultChannelGroup`, `date`
- Metrics: `sessions`, `screenPageViews`, `totalRevenue`, `itemRevenue`, `sessionConversionRate`, `bounceRate`

## Action‑linked attribution
Create a GA4 **custom dimension** `hd_action_key` (scope: event). When an Action is approved,
attach `hd_action_key=<slug>` to relevant events (view, click, purchase) so we can re‑rank Top‑10 by realized ROI.

## Bing Webmaster (add now)
- Verify site ownership (DNS is simplest).  
- Enable submissions (optional: IndexNow/URL submission).  
- Mirror GA4 dashboards at a high level (impressions/clicks/CTR by page) when time permits.

> GSC property exists but we are **not** enabling Bulk Export/BigQuery now. Keep GA4‑only for this sprint.
