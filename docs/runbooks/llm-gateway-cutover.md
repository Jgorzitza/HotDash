# LLM Gateway Cutover Runbook

**Audience:** DevOps + LLM Infra team (specialagent001)  
**Goal:** Transition production agents from direct OpenAI usage to the Fly-hosted LiteLLM + Langfuse stack without downtime.

---

## 1. Prerequisites

- `hotdash-llm-gateway`, `hotdash-langfuse-clickhouse`, and `hotdash-langfuse-minio` Fly apps deployed in region `ord` and healthy (`fly status -a <app>`).
- Supabase `langfuse` schema created and migrations applied (Langfuse entrypoint handles this automatically on first boot).
- `hotdash-llm-cache` Fly Redis provisioned; `REDIS_URL` secret configured on the gateway app.
- DNS + TLS certificates issued for:
  - `gateway.hotrodan.com` → LiteLLM gateway
  - `langfuse.hotrodan.com` → Langfuse UI
- Vault entry `vault/hotrodan/llm-gateway-secrets.json` populated with the generated credentials and synced to Fly secrets (gateway, clickhouse, minio apps).
- Production agent configs prepared to switch `baseUrl` to `https://gateway.hotrodan.com` and new API keys staged.

---

## 2. Verify Infrastructure Health

1. **Fly Machines**
   - `fly status -a hotdash-llm-gateway`
   - Confirm 3 processes (gateway/ui/worker) are running and passing health checks.
2. **ClickHouse**
   - SSH/console: `fly ssh console -a hotdash-langfuse-clickhouse --command "clickhouse-client --query 'SELECT 1'"`
3. **MinIO**
   - `fly ssh console -a hotdash-langfuse-minio --command "mc ready local"`
4. **Langfuse UI**
   - Browse to `https://langfuse.hotrodan.com` and log in using credentials from the vault.
   - Confirm dashboards load and no migration banner is displayed.

---

## 3. Smoke Tests (Pre-cutover)

Run from a trusted workstation using the admin key.

```bash
ADMIN_KEY="$(pass show infra/litellm/admin-key)"
BASE="https://gateway.hotrodan.com"

curl -s "$BASE/v1/chat/completions" \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Cutover smoke test"}]
  }' | jq '.choices[0].message.content'
```
- Expect HTTP 200 in < 2s and trace visible in Langfuse.

---

## 4. Cache Verification

### 4.1 Exact Cache
1. Send identical request 3 times (admin key).
2. Measure latency (e.g., `time curl ...`).
3. Expect request #1 > request #2/#3 (<100 ms) with cache hit recorded in Langfuse (`cache.hit == true`).

### 4.2 Semantic Cache
1. Issue semantically similar prompts:
   - "What is the return policy?"
   - "How do I get a refund?"
2. Expect second response to be served from semantic cache (check Langfuse trace metadata).

---

## 5. Quota + Failover Tests

1. **RPM enforcement**
   - Run 101 requests in a loop with the `prod_customer` key (limit 100 rpm).
   - Expect the 101st request to receive HTTP 429. Confirm Langfuse logs the throttle event.
2. **Failover**
   - Send a prompt with >2,000 tokens (e.g., repeat lorem text) to force escalation from `gpt-4o-mini` → `gpt-4o`.
   - Confirm Langfuse trace shows model override and cost attribution.

---

## 6. Update Production Agents

1. Rotate API credentials in vault (LiteLLM team keys) and push them to Fly secrets (`fly secrets set TEAM_KEY_prod_customer=...`).
2. Update agent configuration (e.g., `app/agents/config/agents.json` or runtime secrets) to reference `https://gateway.hotrodan.com` and the new LiteLLM keys.
3. Deploy agent configuration changes through the standard CI/CD pipeline.
4. Monitor Langfuse for live traffic (per-agent dashboards) and verify steady cache hit rate (>30%).

---

## 7. Rollback Plan

| Scenario | Action |
| --- | --- |
| LiteLLM unavailable | Update agent configs to use direct OpenAI key/endpoint (previous values stored in vault). |
| Langfuse migrations fail | Revert gateway secrets `DATABASE_URL` back to pooled connection (6543) only after database is reachable; re-run `fly deploy`. |
| Cache outage (Redis down) | Disable caching by setting `LITELLM_CACHE_DISABLED=true` secret, redeploy gateway, and escalate to Fly to restore Redis. |

Maintain 30 minutes of heightened monitoring post-cutover. If error rate exceeds 2% or latency doubles, initiate rollback immediately.

---

## 8. Evidence Logging

- Log completion via `npx tsx --env-file=.env scripts/agent/complete-task.ts SPECIALAGENT001-INFRA-001 "Cutover complete"` with links to Langfuse dashboards and Fly deploy hashes.
- Attach cache hit metrics and quota test outputs to the decision log for auditing.
