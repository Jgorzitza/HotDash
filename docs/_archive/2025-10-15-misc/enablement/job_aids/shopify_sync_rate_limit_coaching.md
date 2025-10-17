---
epoch: 2025.10.E1
doc: docs/enablement/job_aids/shopify_sync_rate_limit_coaching.md
owner: enablement
last_reviewed: 2025-10-09
doc_hash: TBD
expires: 2025-10-16
---

# Shopify Sync Rate-Limit Recovery — Coaching Snippets

## Quick Context

Shopify Admin GraphQL enforces a 1,000 cost/minute throttle window. When the Operator Control Center pulls fresh metrics (orders, inventory, fulfillment) too quickly, Shopify responds with `API rate limit exceeded.` The dashboard surfaces this as a banner or stale timestamp. Operators need a calm, repeatable script to confirm status, wait for the retry window, and log the event for auditing.

## Operator Script (First Hit)

> **"Looks like Shopify is rate-limiting our dashboard refresh. Give me about a minute — the system will automatically retry once the window resets. If the timestamp is still stale after that, I'll capture the request ID and loop in reliability."**

- Coach operators to read the banner verbatim (`API rate limit exceeded.`) so the support team can match the copy in tickets.
- Remind them that the dashboard retries with exponential backoff (15s, 30s, 60s) — no manual refresh spam.
- Prompt operators to note the `Last updated` timestamp on the tile for later logging.

## Verification Checklist

1. Confirm Shopify status page (`https://status.shopify.com`) shows no ongoing incidents.
2. Open the Operator Control Center debug drawer (`Cmd/Ctrl` + `.`) and capture:
   - `X-Request-ID` header
   - GraphQL cost header (`X-GraphQL-Cost` → `requestedCost`, `actualCost`, `throttleStatus.currentlyAvailable`, `throttleStatus.maximumAvailable`)
3. Record the time the banner appeared and the tile(s) affected (`Sales Pulse`, `Inventory Heatmap`, etc.).
4. Wait for the automatic retry (up to 60 seconds). If the banner clears and `Last updated` advances, close the loop.

## Escalation Script (Persistent After 2 Retries)

> **"The rate limit is still active after the retry window. I'm escalating to reliability with the request ID and throttle headers so they can check for stuck jobs. You'll continue to see the last successful data until they confirm recovery."**

- File a note in `feedback/support.md` (include time, tile, request ID).
- Ping `#occ-reliability` with the request ID, throttle values, and whether the retry cleared the banner.
- Ask operators to avoid manual bulk operations (e.g., `Re-run sync`) until reliability confirms the queue is healthy.

## Recovery Actions for Reliability/Product

- Reliability replays the stalled job via `npm run ops:retry-shopify-sync -- --scope all` once OK'd.
- Product/support update decision logs or operator comms with the impact window (tiles stale minutes, affected scenarios).
- AI agent logs the incident in `feedback/ai.md` if recommendations were skipped due to stale data.

## Evidence to Capture

- Reference support playbook steps if escalation needed (`docs/runbooks/shopify_rate_limit_recovery.md`).
- Screenshot of the dashboard banner + tile timestamp.
- Debug drawer snippet with `X-Request-ID` and throttle status JSON.
- Timestamped note in `feedback/support.md` and link to the internal channel thread.
- Once resolved, add the recovery confirmation (time banner cleared, retry ID or command used).

## Training Tips

- Role-play both the first-hit reassurance and the escalation handoff so operators internalize the calm tone.
- Pair the snippet with a quick refresher on Shopify's cost-based throttling (1,000 points per minute; most OCC queries cost 10-50).
- Encourage operators to keep a pre-filled template for rate-limit incidents; support will house the final copy in the shared incident template directory once published.
