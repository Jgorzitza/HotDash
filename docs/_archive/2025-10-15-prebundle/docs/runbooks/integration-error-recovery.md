# Integration Error Handling & Recovery Runbook

**Task:** 6E  
**Owner:** Integrations + Operations  
**Created:** 2025-10-12  
**Purpose:** Practical procedures for handling integration failures

---

## Quick Reference

| Error Type        | Immediate Action              | Recovery Time      | Escalation          |
| ----------------- | ----------------------------- | ------------------ | ------------------- |
| Shopify 429       | Automatic retry (implemented) | < 2 seconds        | None needed         |
| Shopify 500       | Automatic retry (implemented) | < 5 seconds        | If persists > 5min  |
| Chatwoot Timeout  | Manual retry                  | < 1 minute         | If persists > 15min |
| GA Quota Exceeded | Wait for reset                | Next day 00:00 UTC | Alert team          |
| OpenAI 429        | SDK auto-retry                | < 10 seconds       | None needed         |

---

## Error Scenarios & Recovery

### Scenario 1: Shopify API Rate Limit (429)

**Detection:** Error message "Exceeded 2 calls per second"

**Current Handling:** ✅ Automatic

- Retry logic in `app/services/shopify/client.ts`
- Exponential backoff: 500ms, 1000ms
- Max 2 retries

**Recovery:** Automatic (no action needed)

**If Persists:**

1. Check Shopify status: https://status.shopify.com
2. Review API call patterns (reduce frequency)
3. Contact Shopify Partner Support if needed

---

### Scenario 2: Chatwoot Service Unavailable

**Detection:** HTTP 503 or connection timeout

**Current Handling:** ❌ No retry (needs implementation)

**Manual Recovery:**

1. Check Chatwoot status: `curl https://hotdash-chatwoot.fly.dev/hc`
2. Check Fly.io status: https://status.flyio.net
3. Restart Chatwoot app: `flyctl restart hotdash-chatwoot`
4. Verify: Wait 30s, test again

**Prevention:** Implement retry logic (Task D recommendation)

---

### Scenario 3: Google Analytics Quota Exhausted

**Detection:** Error code "RESOURCE_EXHAUSTED"

**Current Handling:** ❌ No retry (quota won't help)

**Recovery:**

1. Wait until quota resets (00:00 UTC daily)
2. OR: Reduce polling frequency temporarily
3. OR: Request quota increase from Google

**Prevention:** Monitor quota usage (alert at 80%)

---

### Scenario 4: Webhook Signature Verification Failure

**Detection:** "Invalid webhook signature" in logs

**Possible Causes:**

1. Webhook secret mismatch
2. Payload modification in transit
3. Attack attempt

**Recovery:**

1. Verify webhook secret matches between Chatwoot and Supabase
2. Check observability logs for patterns
3. If attack: Block IP address
4. If misconfiguration: Rotate and update secret

---

### Scenario 5: Database Connection Failure

**Detection:** Supabase connection errors

**Recovery:**

1. Check Supabase status: https://status.supabase.com
2. Verify connection string in environment
3. Check connection pool (max connections)
4. Restart application if needed

**Escalation:** Contact Supabase support if > 15min

---

## Recovery Procedures

### Procedure 1: Integration Health Check

```bash
# Run comprehensive health check
./scripts/ops/mcp-health-check.sh

# Review results
cat artifacts/integrations/mcp-health-checks/health-check-*.json | tail -1 | jq
```

### Procedure 2: Restart Integration Services

```bash
# Restart Chatwoot (Fly.io)
flyctl restart hotdash-chatwoot

# Restart application (if needed)
# Coordinate with deployment team
```

### Procedure 3: Validate API Credentials

```bash
# Test Shopify credentials
./scripts/ops/test-shopify-integration.sh

# Test Chatwoot credentials
./scripts/ops/test-chatwoot-integration.sh

# Test Google Analytics
./scripts/ops/test-ga-integration.sh
```

---

## Escalation Matrix

**Level 1: Automatic** (< 1 minute)

- Retry logic handles transient errors
- No human intervention needed

**Level 2: Operations** (1-15 minutes)

- Operations team investigates
- Uses runbooks for recovery
- Logs incident

**Level 3: Engineering** (15-60 minutes)

- Complex issues requiring code changes
- Engineer On-Call engaged
- Incident manager assigned

**Level 4: Vendor** (> 1 hour)

- Vendor-side issues
- Contact vendor support
- Escalate through proper channels

---

## Success Criteria

- ✅ All automatic retry scenarios recover in < 10 seconds
- ✅ Manual recovery procedures documented
- ✅ Escalation paths clear
- ✅ No data loss during failures

---

**Runbook Complete:** 2025-10-12 03:47 UTC  
**Evidence:** Practical recovery procedures for all integration failure scenarios
