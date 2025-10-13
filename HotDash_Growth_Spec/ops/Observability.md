# Observability

## Logging
- Structured JSON logs for all services; include `action_id`, `request_id`, `source`.

## Metrics
- Ingest lag, webhook error rate, adapter success rate, time-to-approve, action acceptance %, CTR lift, revenue lift.

## Alerts
- Webhook verification failures > 1% for 5 min.
- Adapter write failures > 1% for 5 min.
- ETL lag > 12 hours.
