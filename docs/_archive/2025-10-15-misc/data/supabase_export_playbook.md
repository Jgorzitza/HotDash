---
runbook: Supabase Decision Sync Quickstart
owner: data
last_updated: 2025-10-12
---

# Supabase Decision Sync — Analyzer & Parity Quickstart

Use this checklist when the `decision_sync_events` view comes back online so analyzer and parity artifacts publish immediately.

## 1. Environment

- Ensure `.env` or shell exports are set:
  ```bash
  export SUPABASE_URL=https://mmbjiyhsvniqxibzgyvx.supabase.co
  export SUPABASE_SERVICE_KEY=$(grep SUPABASE_SERVICE_KEY vault/occ/supabase/service_key_staging.env | cut -d= -f2)
  ```

## 2. Pull Latest Decision Export

```bash
mkdir -p artifacts/logs
curl -s "${SUPABASE_URL}/rest/v1/decision_sync_events?select=decisionId,status,durationMs,errorCode,attempt,timestamp,scope&order=timestamp.desc" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Accept: application/json" | jq -c '.[]' \
  > artifacts/logs/supabase_decision_export_$(date -u +%Y-%m-%dT%H-%M-%SZ).ndjson
```

## 3. Analyzer Summary

```bash
LATEST_NDJSON=$(ls -t artifacts/logs/supabase_decision_export_*.ndjson | head -n1)
npx -y tsx scripts/ops/analyze-supabase-logs.ts --input "$LATEST_NDJSON" \
  | tee artifacts/monitoring/supabase-sync-summary-$(date -u +%Y-%m-%dT%H-%M-%SZ).json
cp artifacts/monitoring/supabase-sync-summary-*.json artifacts/monitoring/supabase-sync-summary-latest.json
```

## 4. Parity Check

```bash
npm run ops:check-analytics-parity | tee artifacts/monitoring/supabase-parity-$(date -u +%Y-%m-%dT%H-%M-%SZ).json
```

## 5. Weekly Insight Notebook

- Open `notebooks/weekly_insights_2025-10-16.ipynb`
- Update the "Supabase Decision Sync" section with the new summary metrics (records, failure rate, p95, timeout IDs).

## 6. Logging

- Update `feedback/data.md`, `feedback/ai.md`, `feedback/qa.md`, and `docs/runbooks/incident_response_supabase.md` with the new artifact paths.
- Share export + summary in #occ-sync for AI/QA.

Keep this playbook fresh after each export to minimize turnaround time.
