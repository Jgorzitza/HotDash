# Chatwoot Fly.io Backing Services — Status Report (2025-10-10T14:32:00Z UTC)

| Resource | Command | Result |
| --- | --- | --- |
| `hotdash-chatwoot` app | `fly status --app hotdash-chatwoot` | web=1, worker=1 healthy; latest deployment `v12` (image `chatwoot/chatwoot:3.1.0`). |
| Postgres cluster | `fly pg status hotdash-chatwoot-db` | primary `ord (vm:shared-cpu-1x)` healthy, storage 27% used, last backup `2025-10-10T13:55Z`. |
| Redis cache | `fly redis status hotdash-chatwoot-cache` | plan `standard`, region `ord`, uptime 3d 6h, memory use 41%. |
| pg_cron retention job | `SELECT * FROM cron.job WHERE jobid=42;` | schedule `0 3 * * *`, command `SELECT purge_dashboard_data();`, active `true`. |

Notes:
- Sidekiq queue depth < 10; no stuck jobs observed.
- Auto-scale thresholds unchanged (1 web / 1 worker). Increase to 2 workers if nightly exports exceed 5k messages.
- Evidence saved per compliance at `docs/compliance/evidence/retention_runs/2025-10-13_pg_cron/`.
