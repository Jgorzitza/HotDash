# LLM Gateway Monitoring Runbook

**Audience:** DevOps, Support on-call

This runbook documents how to observe the LiteLLM + Langfuse + Redis stack after production cutover.

---

## 1. Dashboards

| Layer | Location | Key Panels |
| --- | --- | --- |
| Gateway (LiteLLM) | Langfuse → `Projects > hotdash-llm-gateway` | Request volume, cache hit %, token usage, error rate |
| Model costs | Langfuse Cost Explorer | Daily spend by team (`prod_customer`, `prod_ceo`, etc.) |
| Redis | Fly metrics (`fly dashboard -a hotdash-llm-gateway`) | Memory usage, evictions, connection count |
| ClickHouse | `fly ssh console -a hotdash-langfuse-clickhouse --command "clickhouse-client --query 'SELECT count() FROM langfuse.events'"` | Confirm ingestion progressing |
| MinIO | `mc admin info` (via Fly console) | Bucket size, free space, health |

Create saved Langfuse dashboard filters per agent to compare latency before/after cutover.

---

## 2. Alerts

Set up the following warning + critical thresholds (Langfuse or custom Prometheus scraper):

- **Gateway HTTP 5xx > 1% for 5 min** → notify `#oncall-devops`
- **Cache hit rate < 25% for 30 min** → possible Redis/semantic degration
- **Daily spend > 80% of budget** (per team) → escalate to product owner
- **Redis used_memory > 220 MB** (Fly plan is 256 MB) → plan upgrade
- **ClickHouse INSERT errors** (Langfuse ingestion warnings) → check worker process

---

## 3. Routine Checks (Daily)

1. **Langfuse UI**: verify latest traces exist for each production agent.
2. **Quotas**: run `fly logs -a hotdash-llm-gateway --since 10m | grep -i quota` to ensure limiter triggers appear (should be present but not continuous).
3. **Redis TTL sanity**: `fly ssh console -a hotdash-llm-gateway --command "redis-cli --scan | head"` to confirm keys exist; optionally check TTL for random key.
4. **Semantic cache index**: `redis-cli FT.INFO litellm_semantic_cache_index` (ensures RediSearch index healthy).
5. **ClickHouse storage**: `fly ssh console -a hotdash-langfuse-clickhouse --command "du -sh /var/lib/clickhouse"` (<10 GB expected initially).
6. **MinIO buckets**: `mc ls local/langfuse-events` to confirm object growth.

Log findings via `logDecision()` if anomalies detected.

---

## 4. Incident Response

| Symptom | Diagnostics | Mitigation |
| --- | --- | --- |
| Gateway 5xx spike | `fly logs -a hotdash-llm-gateway`, Langfuse error tab | Restart affected machine (`fly machines restart`) after snapshot; if persistent, switch agents back to OpenAI direct per cutover rollback. |
| Cache miss spike | Check Redis availability (`fly ps -a hotdash-llm-gateway --apps redis`), inspect `redis-cli info` | If Redis down, redeploy `hotdash-llm-cache`. Temporarily disable caching via secret `LITELLM_CACHE_DISABLED=true`. |
| Langfuse ingest lag | Worker process logs (`fly logs -a hotdash-llm-gateway --process worker`) | Scale worker to 2 machines (`fly scale count worker=2`) or restart. Check ClickHouse space. |
| Cost anomaly | Langfuse cost explorer + raw traces | Freeze offending team key via LiteLLM admin UI (`/admin/api_keys`) and inform stakeholder. |
| MinIO capacity warning | `mc admin info` | Expand volume or attach new Fly volume; consider lifecycle policies for old traces. |

---

## 5. Reporting + Evidence

- Weekly summary: cache hit %, total spend vs. budget, incidents.
- Attach Langfuse dashboard export + Fly metrics screenshot to `logDecision()` evidence for historical auditing.

---

## 6. Useful Commands

```bash
# Tail gateway logs (gateway process only)
fly logs -a hotdash-llm-gateway --process gateway

# Tail semantic cache stats
fly ssh console -a hotdash-llm-gateway --command "redis-cli info | egrep 'connected_clients|used_memory'"

# Inspect LiteLLM quota state via admin API
curl -H "Authorization: Bearer $ADMIN_KEY" https://gateway.hotrodan.com/admin/spend/teams

# Verify Langfuse worker queue depth
curl -u $LANGFUSE_PUBLIC_KEY:$LANGFUSE_SECRET_KEY \
  https://langfuse.hotrodan.com/api/public/ready
```

Keep this runbook updated when thresholds change or new tooling is introduced.
