# Langfuse Self‑Host Execution Runbook (APPROVED)

Status: Approved (Option C)  
Owner: specialagent001 (execution), manager (approval)  
Scope: Additive‑only infra changes to deploy Langfuse on Fly (ClickHouse + MinIO) and wire the LLM gateway.  
Safety: No destructive DB ops. Only additive migrations. No schema resets.

---

## Change Control & Safeguards

- Additive‑only DB operations (migrations create tables/indexes; no DROP/RESET).
- Supabase: use a dedicated `langfuse` schema only. Do not touch app schemas.
- No deletion of volumes, buckets, or databases without separate approval.
- Validate each phase before advancing; keep a rollback checkpoint.

---

## Prerequisites

- Fly CLI authenticated; org access to HotDash apps.
- Vault file with secrets (not committed): `vault/hotrodan/llm-gateway-secrets.json` containing:
  - CLICKHOUSE_PASSWORD, MINIO_ROOT_USER, MINIO_ROOT_PASSWORD
  - LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_HOST (e.g., https://langfuse.hotrodan.com)
  - REDIS_URL (existing `hotdash-llm-cache`), SUPABASE_DIRECT_URL, SUPABASE_POOLED_URL
- Confirm apps exist or will be created:
  - ClickHouse: `hotdash-langfuse-clickhouse`
  - MinIO: `hotdash-langfuse-minio`
  - Gateway/UI/Worker: `hotdash-llm-gateway`

---

## Variables

```bash
export REGION=ord
export CLICKHOUSE_APP=hotdash-langfuse-clickhouse
export MINIO_APP=hotdash-langfuse-minio
export GATEWAY_APP=hotdash-llm-gateway
# From vault (example: source a script that exports these)
export CLICKHOUSE_PASSWORD=... # from vault
export MINIO_ROOT_USER=...    # from vault
export MINIO_ROOT_PASSWORD=...# from vault
export LANGFUSE_HOST=https://langfuse.hotrodan.com
export LANGFUSE_PUBLIC_KEY=...
export LANGFUSE_SECRET_KEY=...
export REDIS_URL=...                # existing managed Redis
export SUPABASE_DIRECT_URL=...      # for initial migrations
export SUPABASE_POOLED_URL=...      # for steady state
```

---

## Phase 1 – Provision ClickHouse (Additive)

```bash
# Create volume (additive)
fly volumes create langfuse_clickhouse_data --size 25 \
  --app $CLICKHOUSE_APP --region $REGION

# Deploy app
fly deploy -c fly/hotdash-llm-gateway/clickhouse/fly.toml

# Set secrets (no restarts needed until deploy)
fly secrets set CLICKHOUSE_PASSWORD="$CLICKHOUSE_PASSWORD" \
  CLICKHOUSE_USER="default" CLICKHOUSE_HTTP_PORT="8123" \
  -a $CLICKHOUSE_APP --stage

# Health
fly status -a $CLICKHOUSE_APP
```

Validation (non‑destructive):
```bash
fly ssh console -a $CLICKHOUSE_APP -C \
  "sh -lc 'clickhouse-client --query \"SELECT version()\"'"
```

---

## Phase 2 – Provision MinIO (Additive)

```bash
# Create volume (additive)
fly volumes create langfuse_minio_data --size 25 \
  --app $MINIO_APP --region $REGION

# Deploy app
fly deploy -c fly/hotdash-llm-gateway/minio/fly.toml

# Set secrets
fly secrets set MINIO_ROOT_USER="$MINIO_ROOT_USER" \
  MINIO_ROOT_PASSWORD="$MINIO_ROOT_PASSWORD" -a $MINIO_APP --stage

# Health
fly status -a $MINIO_APP
```

Validation:
```bash
fly logs -a $MINIO_APP | tail -n 50
```

---

## Phase 3 – Configure Gateway for Langfuse (Additive)

Secrets on gateway:
```bash
fly secrets set \
  LANGFUSE_HOST="$LANGFUSE_HOST" \
  LANGFUSE_PUBLIC_KEY="$LANGFUSE_PUBLIC_KEY" \
  LANGFUSE_SECRET_KEY="$LANGFUSE_SECRET_KEY" \
  CLICKHOUSE_URL="http://$CLICKHOUSE_APP.internal:8123?user=default&password=$CLICKHOUSE_PASSWORD" \
  MINIO_ENDPOINT="http://$MINIO_APP.internal:9000" \
  MINIO_ACCESS_KEY="$MINIO_ROOT_USER" \
  MINIO_SECRET_KEY="$MINIO_ROOT_PASSWORD" \
  REDIS_URL="$REDIS_URL" \
  SUPABASE_DIRECT_URL="$SUPABASE_DIRECT_URL" \
  SUPABASE_POOLED_URL="$SUPABASE_POOLED_URL" \
  -a $GATEWAY_APP --stage
```

Deploy gateway (first boot runs additive migrations against Supabase via DIRECT_URL):
```bash
fly deploy -c fly/hotdash-llm-gateway/fly.toml
fly logs -a $GATEWAY_APP -n 200 | rg -i "migrat|langfuse|clickhouse|minio"
```

Safety switches:
- If migrations fail, stop and capture logs. Do not retry with any destructive commands.
- Confirm tables created under `langfuse` schema; no DROPs.

---

## Phase 4 – Validation (No Writes beyond migrations)

- UI reachability: `curl -sSf $LANGFUSE_HOST | head -c 200`
- Traces: Trigger a small test (admin API) and confirm entries in Langfuse UI.
- ClickHouse check (non‑destructive):
```bash
fly ssh console -a $CLICKHOUSE_APP -C \
  "sh -lc 'clickhouse-client --query \"SHOW DATABASES\"'"
```
- MinIO health: `fly logs -a $MINIO_APP | tail -n 100` (no errors)

---

## Phase 5 – Rollback & Contingency

- If gateway errors increase: scale gateway back, remove Langfuse keys from config (no secrets deletion, only disable usage) and redeploy.
- If ClickHouse/MinIO issues: stop at app level; do not delete volumes. Gather logs and open an incident.
- No schema resets or destructive operations allowed.

---

## Artifacts & Logging

- Save provisioning logs and command transcripts to `artifacts/ops/langfuse/*`.
- Log a DecisionLog entry with action `langfuse_self_host_executed` and attach evidence paths.

---

## References

- Deployment plan: `docs/llm-infra/langfuse-deployment-plan.md`
- Monitoring: `docs/runbooks/llm-gateway-monitoring.md`
- Gateway config: `fly/hotdash-llm-gateway/config/litellm.config.yaml`

