# Deployment

## Environments

- `dev` → feature branches; `staging` → pre-prod; `prod` → live.
- Database migrations via migration tool; zero-downtime deploys.

## Jobs & Queues

- Nightly ETL cron at off-peak.
- Webhook consumers behind HTTP queue; idempotency keys for each event.

## Rollbacks

- Use blue/green or canary for Action Service and adapters.
- Keep theme revert scripts for storefront changes.
