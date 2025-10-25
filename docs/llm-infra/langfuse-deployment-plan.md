# Langfuse Deployment Plan (ClickHouse + MinIO + Redis + Supabase)

**Owner:** specialagent001  
**Date:** 2025-10-25  
**Status:** Approved – Manager Decision (Option C: Self-host on Fly)
**Approval Date:** 2025-10-25
**Execution Runbook:** docs/runbooks/langfuse_self_host_execution.md

---

## 1. Objectives

- Stand up production-ready Langfuse observability for LLM gateway traffic.
- Self-host ClickHouse and MinIO on Fly.io to remain inside the existing infrastructure perimeter.
- Reuse existing Supabase project (`langfuse` schema) and managed Fly Redis (`hotdash-llm-cache`).
- Provide clear sizing, cost expectations, and a step-by-step rollout so the manager can green-light execution.

---

## 2. Target Architecture

```
┌─────────────────────────┐
│ hotdash-llm-gateway     │  (LiteLLM API + Langfuse UI + worker processes)
│   • PORT 4000 gateway   │
│   • PORT 3000 ui        │
│   • PORT 3030 worker    │
└────────────┬────────────┘
             │
     ┌───────┴────────┐
     │ Fly Private Net│
┌────▼───────┐  ┌─────▼─────┐
│hotdash-    │  │hotdash-   │
│langfuse-   │  │langfuse-  │
│clickhouse  │  │minio      │
└────┬───────┘  └────┬──────┘
     │               │
     │         ┌─────▼─────────┐
     │         │ Fly Redis     │ (hotdash-llm-cache)
     │         └─────┬─────────┘
     │               │
┌────▼───────┐  ┌────▼─────────┐
│ Supabase   │  │ S3 Gateway   │ (MinIO)
│ langfuse.* │  │ buckets      │
└────────────┘  └──────────────┘
```

- **LiteLLM gateway** continues to run in `hotdash-llm-gateway`.
- **Langfuse worker** pushes traces into ClickHouse, stores attachments in MinIO, and coordinates cache metadata with Redis.

---

## 3. Resource Sizing & Estimated Monthly Cost

| Component | Fly Plan | vCPUs | RAM | Storage | Est. Cost/Month | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `hotdash-llm-gateway` (shared app) | `shared-cpu-2x` | 2 | 2 GB | N/A | **$18.00** | Existing; scale to 2 shared cores to absorb Langfuse worker load. |
| `hotdash-langfuse-clickhouse` | `performance-1x` | 1 | 4 GB | 25 GB volume | **$32.00 compute + $2.50 storage** | ClickHouse CPU-biased; 4 GB RAM minimum for Langfuse ingest. |
| `hotdash-langfuse-minio` | `shared-cpu-1x` | 1 | 1 GB | 25 GB volume | **$5.00 compute + $2.50 storage** | S3-compatible object storage. Volume sized for ~90 days of traces. |
| `hotdash-llm-cache` (Redis) | Managed 256 MB plan | — | — | — | **$1.94** | Already provisioned. |
| Supabase (langfuse schema) | Existing project | — | — | — | **Included** | No extra cost. |
| DNS/TLS | Fly Certificates | — | — | — | **Included** | Covered by Fly free certs. |

**Total incremental monthly cost:** ≈ **$59.44**

### Scaling Guidance

- **ClickHouse:** If daily ingest exceeds ~10M rows or CPU saturation >70%, upgrade to `performance-2x` ( +$64/month) and enlarge volume to 50 GB.
- **MinIO:** Monitor `langfuse-media` bucket; plan to expand volume in 10 GB increments if retention policies require longer history.
- **Gateway:** If request throughput doubles post-cutover, scale `hotdash-llm-gateway` to two machines (active/active) and enable Fly autoscaling.

---

## 4. Rollout Plan

### Phase 0 – Prep (0.5h)
1. Generate secrets per `vault/hotrodan/llm-gateway-secrets.json` (Langfuse admin, ClickHouse, MinIO).
2. Create vault entry updates and stage Fly secrets commands for each app.

### Phase 1 – Provision Supporting Services (1.0h)
1. **ClickHouse**
   - `fly volumes create langfuse_clickhouse_data --size 25 --app hotdash-langfuse-clickhouse --region ord`
   - `fly deploy -c fly/hotdash-llm-gateway/clickhouse/fly.toml`
   - `fly secrets set CLICKHOUSE_PASSWORD=... --app hotdash-langfuse-clickhouse`
2. **MinIO**
   - `fly volumes create langfuse_minio_data --size 25 --app hotdash-langfuse-minio --region ord`
   - `fly deploy -c fly/hotdash-llm-gateway/minio/fly.toml`
   - `fly secrets set MINIO_ROOT_USER=... MINIO_ROOT_PASSWORD=... --app hotdash-langfuse-minio`
3. Verify health checks pass (`fly status -a ...`).

### Phase 2 – Configure Gateway App (0.5h)
1. Set ClickHouse/MinIO URLs as secrets on `hotdash-llm-gateway`.
2. Update `config/litellm.config.yaml` to include semantic cache + Langfuse keys.
3. Ensure `LITELLM_MASTER_KEY`, team keys, and Redis URL are set.

### Phase 3 – Deploy & Run Migrations (0.5h)
1. Deploy `hotdash-llm-gateway` to run UI + worker migrations (first boot uses Supabase direct URL).
2. Tail logs to confirm Langfuse migrations complete; switch to pooled URL after success.

### Phase 4 – Validation (1.0h)
1. Run smoke test via admin key.
2. Confirm traces appear in Langfuse UI (`https://langfuse.hotrodan.com`).
3. Execute cache/quota/failover tests described in `docs/runbooks/llm-gateway-cutover.md`.

### Phase 5 – Handoff (0.5h)
1. Log completion with evidence (Langfuse dashboards, Fly deploy IDs).
2. Notify manager that infra is ready for Phase 2 agent cutover tasks.

---

## 5. Risks & Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| ClickHouse resource exhaustion | Trace ingestion lag | Monitor CPU + disk via Fly metrics; scale to `performance-2x` if >70% sustained. |
| MinIO capacity overflow | Loss of historical attachments | Apply lifecycle policy to move old objects to cold storage; increase volume in 10 GB steps. |
| Migration failure on first boot | Langfuse UI unavailable | Capture logs, rerun with direct Supabase URL, ensure credentials set correctly before switching to pooled connection. |
| Redis outage | Cache hit rate drops | Redeploy managed Redis or temporarily disable caching (`LITELLM_CACHE_DISABLED=true`) per runbook. |

---

## 6. Next Steps Pending Approval

1. Manager sign-off on sizing/cost ($59.44/mo baseline).
2. Proceed with Phase 0 preparation and provisioning (unblocks `SPECIALAGENT001-INFRA-001`).
3. Coordinate with regular dev team for post-deployment cutover according to `docs/runbooks/llm-gateway-cutover.md`.

Once approved, the above schedule enables end-to-end infrastructure deployment within ~4 hours of focused work, followed by validation and documentation updates.
