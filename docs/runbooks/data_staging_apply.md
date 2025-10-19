# Data Staging Apply Runbook

> Purpose: Rehearse Supabase migrations against staging using the IPv4 pooler, capture rollback evidence, and hand off a clean audit trail for manager sign-off.

## Prerequisites

- Repository checked out at `/home/justin/HotDash/hot-dash`.
- Vault access for Supabase staging secrets: `vault/occ/supabase/database_url_staging.env` and `vault/occ/supabase/service_key_staging.env`.
- Supabase CLI ≥ 2.48 installed (`supabase --version`).
- `psql` available in `PATH`.
- Feedback file for the day created at `feedback/data/<YYYY-MM-DD>.md`.
- `/tmp/data_plan.json` updated with the active molecule(s).

## 0. Alignment & Logging

1. Run through `docs/runbooks/agent_startup_checklist.md`.
2. Skim today’s direction at `docs/directions/data.md` for scope changes.
3. Start the daily header in `feedback/data/<YYYY-MM-DD>.md` with:
   - Objective
   - Planned commands
   - Artifact folder you will write to.

## 1. Environment Setup

```bash
cd /home/justin/HotDash/hot-dash
export LOG_ROOT="artifacts/ops/$(date -u +%Y-%m-%d)"
mkdir -p "$LOG_ROOT"
set -a
source vault/occ/supabase/database_url_staging.env  # exports DATABASE_URL (IPv4 pooler, sslmode=require)
source vault/occ/supabase/service_key_staging.env   # exports SUPABASE_SERVICE_KEY when needed
set +a
```

- **Do not** mutate the DSN—staging connections must flow through the IPv4 session pooler; IPv6 hosts fail today.
- Capture the exact commands above in your feedback log.
- **MCP Credentials (browser-less workflow):** the Supabase CLI stores your OAuth session at `~/.supabase/access-token`. When MCP tooling or parity scripts need access, export it just-in-time without writing secrets to disk:

  ```bash
  export SUPABASE_ACCESS_TOKEN="$(cat ~/.supabase/access-token)"
  export SUPABASE_SERVICE_KEY="$(SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" \
    supabase projects api-keys get mmbjiyhsvniqxibzgyvx --output json \
    | jq -r '.[] | select(.name=="service_role").api_key')"
  ```

  - Never commit these values; they are rotated per the Supabase dashboard.
  - Use the inline `curl`/MCP calls immediately, then `unset` both variables once evidence has been captured.

## 2. Connectivity Check (Evidence Required)

```bash
psql "$DATABASE_URL" -c "select current_database(), inet_server_addr(), now();" \
  | tee "$LOG_ROOT/ipv4_pooler_check_$(date -u +%H%M%S).log"
```

Confirm the server address resolves to the IPv4 pooler and attach the log path in your feedback.

## 3. Inventory Pending Migrations

```bash
supabase migration list --db-url "$DATABASE_URL" \
  | tee "$LOG_ROOT/migration_status_pre_$(date -u +%H%M%S).txt"
```

- Identify the migrations you expect to touch (inventory bundle, knowledge base tables, analytics/dashboard RPCs).
- Note missing rollback scripts or prior partial applies; stage fixes before proceeding.

## 4. Non-Destructive Apply Rehearsal

1. Create a timestamped rehearsal directory:

   ```bash
   export REHEARSAL_DIR="$LOG_ROOT/rehearsal_$(date -u +%Y%m%dT%H%M%SZ)"
   mkdir -p "$REHEARSAL_DIR"
   ```

2. Apply each migration file individually with `ON_ERROR_STOP` so failures surface quickly. Example pattern:

   ```bash
   for file in supabase/migrations/2025101109*.sql \
               supabase/migrations/2025101114*.sql \
               supabase/migrations/20251015*.sql \
               supabase/migrations/20251019004500_programmatic_seo_blueprints.sql \
               supabase/migrations/20251019013000_guided_selling_graph.sql \
               supabase/migrations/20251019021500_cwv_revenue_telemetry.sql \
               supabase/migrations/20251019024000_ab_harness_exposures.sql; do
     echo "==> $file" | tee -a "$REHEARSAL_DIR/migration_apply.log"
     psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file" \
       >> "$REHEARSAL_DIR/migration_apply.log" 2>&1 || {
       echo "!! failure: $file" | tee -a "$REHEARSAL_DIR/migration_apply.log"
     }
     echo >> "$REHEARSAL_DIR/migration_apply.log"
   done
   ```

3. If a statement fails:
   - Record the error (line number, object) in feedback.
   - Attempt **up to three** fixes/replays per molecule, logging each attempt (`mcp_attempt#.jsonl`).
   - Update `/tmp/data_plan.json` with the new status and evidence paths.

## 5. Rollback Rehearsal

1. Locate companion rollback SQL in `supabase/migrations.backup/`.
2. For every migration you executed, run the rollback script in isolation:

   ```bash
   for file in supabase/migrations.backup/*rollback*.sql; do
     echo "==> rollback $file" | tee -a "$REHEARSAL_DIR/migration_rollback.log"
     psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file" \
       >> "$REHEARSAL_DIR/migration_rollback.log" 2>&1 || {
       echo "!! rollback failure: $file" | tee -a "$REHEARSAL_DIR/migration_rollback.log"
     }
     echo >> "$REHEARSAL_DIR/migration_rollback.log"
   done
   ```

3. Capture any missing rollback coverage and open a follow-up task if scripts are absent.

## 6. RLS Contract Verification

Run the canonical RLS contract tests against staging (after re-applying forward migrations if you rolled them back):

```bash
psql "$DATABASE_URL" -f supabase/rls_tests.sql \
  | tee "$REHEARSAL_DIR/rls_contract.log"
```

- All tests must pass. Log any failure with the schema/table affected. The script now asserts RLS/policy coverage for the Programmatic SEO tables (`programmatic_seo_blueprints`, `programmatic_seo_generation_runs`, `programmatic_seo_internal_links`) in addition to inventory + approvals datasets.
- If the contract file is missing, halt and escalate to the manager.

## 7. Post-Run Cleanup

1. Re-run `supabase migration list --db-url "$DATABASE_URL"` and save to `"$REHEARSAL_DIR/migration_status_post.txt"`.
2. Move any intermediate `psql` transcripts into the rehearsal directory for a single artifact bundle.
3. Update `/tmp/data_plan.json` with:
   - `status` for each molecule (`completed`, `blocked`, etc.).
   - `evidence` arrays referencing the new log paths.
4. Append results to `artifacts/data/<date>/mcp_attempt#.jsonl` if you used MCP server calls.

## 8. Feedback & Hand-off

In `feedback/data/<YYYY-MM-DD>.md` document:

- Summary of apply + rollback outcomes.
- Links to key logs (connectivity check, apply log, rollback log, RLS contract).
- Any blockers (missing tables, duplicate indexes, absent rollback scripts).
- Next actions or escalations (e.g., coordination with DevOps for production window).

Finally, notify the manager per `docs/directions/data.md` if production scheduling or additional approvals are required.

## 9. Troubleshooting

- **IPv6 errors:** Ensure you sourced the pooler DSN from vault; the host should end with `.pooler.supabase.co`.
- **Duplicate object errors:** Amend migrations to use `IF NOT EXISTS` / `DROP ... IF EXISTS` guards before the next rehearsal.
- **Missing tables or columns:** Verify prior migrations applied in staging; fetch history with `supabase migration fetch`.
- **Permission denied:** Confirm `service_key_staging.env` was sourced; some admin checks require `SUPABASE_SERVICE_KEY`.
- **Long-running statements:** Use `psql --set=lock_timeout='5s'` for rehearsal if locks persist; document any contention in feedback.

## Version History

- 2025-10-18: Recreated runbook with IPv4 pooler workflow, apply/rollback evidence requirements, and RLS contract validation.
