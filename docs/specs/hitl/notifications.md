Status: Planned only — do NOT seed or ship yet

# Notifications + Business Hours Orchestration

Unify run‑time notifications across features with business hours applied (America/Edmonton). Ensure CEO alerts are timely in‑hours and quiet off‑hours, with offline capture. Provide consistent idempotency and rate‑limit controls.

## Channels

- In‑app (always on)
- Email (CEO)
- SMS (CEO; selective in‑hours only)
- Slack (optional, planning)

## Business Hours

- Primary source: `docs/specs/hitl/customer-replies.config.json` businessHours (America/Edmonton)
- Shared access: all features query this module; no per‑feature drift
- Behavior:
  - In‑hours: enable CEO SMS/email for live chat; enable in‑app notices
  - Off‑hours: disable CEO SMS; convert live chat to offline email capture; queue daily summary at open

## Triggers (Day‑1)

Customer Replies

- Live chat started (in‑hours): SMS + Email to CEO; include conversation preview & link
- Live chat started (off‑hours): Email only (offline capture); no SMS
- Over‑SLA (in‑hours): in‑app + optional email

Approvals

- Pending threshold crossed (e.g., ≥8) or P0 present: in‑app + email digest (hourly max)
- Over‑SLA present: in‑app badge only

Inventory

- Settlement failure: in‑app + email
- Settlement missed (>26h): in‑app badge

Social

- Failed publish: in‑app + email (digest, 1/hr)
- Pipeline gap (< min scheduled next 7d): in‑app badge

## Idempotency & Rate Limits

- Key: `${event_type}:${subject_id}:${date_hour}` for digestible events
- Live chat alerts: suppress duplicates for the same conversation within 10 minutes
- Email digests: 1 per hour per category (approvals, social failures)

## Templates

- SMS (live chat): `New live chat: {customer} — {snippet} — {link}` (truncate snippet)
- Email (digest): HTML with counts by category, top 5 items with links

## Security

- No PII beyond minimal context in SMS; redact in emails where not needed
- Links direct into internal views (Approvals, Chatwoot, Calendar)

## Config & Sources

- CEO phone/email: from `docs/specs/hitl/customer-replies.config.json`
- Business hours: from the same config; single source of truth
- Thresholds: tiles/spec configs

## Open Items

- Slack webhook integration (opt‑in)
- Quiet hours override for exceptional launches (feature flag)
