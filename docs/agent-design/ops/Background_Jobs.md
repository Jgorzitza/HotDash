# Background Jobs & Reliability SLOs

## Triggers
- **Schedules** (e.g., hourly, nightly) and **events** (Shopify webhooks, Chatwoot webhooks).
- Jobs are **idempotent** by natural keys (order_id, product_id, URL).

## SLOs
- Actions surfaced per day
- Median time‑to‑approve
- Queue latency and backlog size
- Failure rate & retry count

## Reliability rules
- Deduplicate by event ID + timestamp window.
- Backoff on API rate limits.
- Dead‑letter queue for irrecoverable events; weekly drain procedure documented.

## Acceptance
- Queue never blocks the UI.
- Each job emits evidence links (request_ids, dataset locations).
- Replays are safe and observable.
