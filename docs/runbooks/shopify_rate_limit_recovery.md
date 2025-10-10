---
epoch: 2025.10.E1
doc: docs/runbooks/shopify_rate_limit_recovery.md
owner: support
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-17
---
# Shopify Rate-Limit Recovery Playbook — Support

## Purpose
Give support a rapid response plan when the Operator Control Center hits Shopify's GraphQL rate limits. Pair this playbook with the enablement coaching snippets (`docs/enablement/job_aids/shopify_sync_rate_limit_coaching.md`) so operators receive calm, consistent guidance while we capture evidence and escalate appropriately.

## Trigger
- Dashboard surfaces the `API rate limit exceeded.` banner or tiles show stale `Last updated` timestamps during an operator interaction.
- Support receives a report that metrics are not refreshing and retries have already begun.

## Escalation Contacts
| Purpose | Contact | Notes |
|---------|---------|-------|
| Reliability handoff | Slack `#occ-reliability` | Include request ID, throttle JSON, first banner timestamp |
| Operator comms alignment | Support lead on duty | Confirm operator messaging + incident tracking |

## Immediate Response (First Banner)
1. **Acknowledge:** Reassure the operator using the coaching script. Remind them that retries occur automatically (15s, 30s, 60s backoff).
2. **Verify Shopify status:** Check `https://status.shopify.com` for active incidents.
3. **Capture headers:** Open the OCC debug drawer (`Cmd/Ctrl` + `.`) and note:
   - `X-Request-ID`
   - GraphQL cost header (`X-GraphQL-Cost.requestedCost`, `.actualCost`, `.throttleStatus.currentlyAvailable`, `.throttleStatus.maximumAvailable`)
4. **Record context:** Document tile(s) affected and the current `Last updated` timestamp.
5. **Wait for automatic retry:** Allow up to 60 seconds. If the banner clears and timestamps advance, log the recovery and close the loop.

## Escalation Path (Banner Persists After 2 Retries)
1. Inform the operator using the escalation snippet and advise against manual refresh spam.
2. Log an entry in `feedback/support.md` (timestamp, tiles, request ID, throttle values).
3. Ping `#occ-reliability` with:
   - Request ID and throttle JSON
   - When the banner first appeared
   - Whether retries advanced the `Last updated` timestamp
4. Capture a screenshot of the banner + timestamp for evidence (store in `artifacts/support/incidents/<date>/`).
5. Track follow-up in the operator Q&A template if the incident happened during a live session (`docs/runbooks/operator_training_qa_template.md`).

## Reliability / Product Coordination
- Reliability may rerun `npm run ops:retry-shopify-sync -- --scope all` after reviewing throttling.
- Product/support should note duration of stale data and update decision logs or operator comms accordingly.
- AI agent to log recommendation impact in `feedback/ai.md` if CX suggestions were skipped due to stale data.

## Evidence Checklist
- [ ] Shopify status page screenshot or confirmation (if incident present)
- [ ] Debug drawer capture with request/throttle headers
- [ ] Dashboard banner screenshot with timestamp
- [ ] `feedback/support.md` entry + Slack permalink to `#occ-reliability`
- [ ] Post-recovery note (time banner cleared, actions taken)

## Reference Materials
- Operator coaching snippets: `docs/enablement/job_aids/shopify_sync_rate_limit_coaching.md`
- Operator training agenda staging steps: `docs/runbooks/operator_training_agenda.md`
- Dry run prep checklist: `docs/runbooks/shopify_dry_run_checklist.md`
- Integration readiness: `docs/integrations/shopify_readiness.md`
- Restart cycle checklist: `docs/runbooks/restart_cycle_checklist.md`

## Change Log
| Date | Author | Change |
|------|--------|--------|
| 2025-10-10 | support | Initial playbook drafted to align with rate-limit coaching direction |
| 2025-10-10 | support | Added Shopify staging install checklist for dry run prep |
## Shopify Staging Install Checklist
- [ ] Shopify Admin demo store credentials received (DEPLOY-147) with vault path + GitHub secret timestamp noted
- [ ] Confirm OCC app install in staging store (Shopify Admin → Apps → HotDash) with `?mock=1` param validated
- [ ] Verify feature flags (`FEATURE_MODAL_APPROVALS`, `FEATURE_AI_ESCALATIONS`) enabled per dry run scenario plan
- [ ] Supabase decision log access confirmed (service key/test query run)
- [ ] Evidence stored in artifacts/ops/dry_run_2025-10-16/logs/
