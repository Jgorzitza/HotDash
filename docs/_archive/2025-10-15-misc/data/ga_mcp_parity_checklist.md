---
epoch: 2025.10.E1
doc: docs/data/ga_mcp_parity_checklist.md
owner: data
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-19
---
# GA MCP Parity Checklist — 2025-10-10 Refresh

## Credential ETA Summary
| Artifact | Owner | Status (2025-10-10) | Target / ETA | Notes |
| --- | --- | --- | --- | --- |
| `GA_MCP_HOST` | Infrastructure (OCC-INF-221) | ⏳ Pending | Awaiting updated ETA; escalate to CIO queue 2025-10-11 09:00 UTC if still silent | Manager re-escalated after missed 17:00 UTC drop; integrations standing by to validate once delivered. |
| `GA_MCP_CREDENTIALS` (service bundle) | Infrastructure → Reliability custodian | ⏳ Pending | Bundled with host delivery | Reliability prepped vault/GitHub scripts; needs bundle to mirror into `vault/occ/ga_mcp/` + Actions secrets. |
| `GA_PROPERTY_ID` | Data | 🚧 Draft | Confirm production property (matches mock schema) once host lands | Alignment pending with marketing/compliance on property scope; placeholder stored in secure notes. |
| Vault + GitHub secret storage evidence | Reliability | ⏳ Pending | <24h after credential receipt | Run `scripts/deploy/sync-ga-mcp-secrets.sh` (once host bundle exists) and attach audit logs. |
| DPIA / compliance update | Compliance | ⏳ Pending | Trigger immediately after credential delivery | DPIA request filed 2025-10-07; compliance waiting on evidence bundle references. |

## Pre-Flight Prep (as of 2025-10-10T07:23Z)
- **Evidence workspace:** `artifacts/integrations/ga-mcp/2025-10-10/` seeded with escalation note and placeholders for curl transcripts + rate-limit logs.
- **Escalation path:** 07:23 UTC ping posted in #infra-requests referencing OCC-INF-221; response outstanding before CIO escalation window (2025-10-11 09:00 UTC).
- **Validation scripts:** Contract tests live in `tests/unit/contracts/ga.sessions.contract.test.ts`; env toggle steps remain documented in the GA MCP go-live checklist so we can unskip and rerun immediately once credentials drop (`GA_USE_MOCK=0`, host swap, property ID verification).
- **Monitoring handoff:** Reliability prepped to run `scripts/deploy/shopify-dev-mcp-staging-auth.sh` + mirror GA MCP bundle using `scripts/deploy/sync-ga-mcp-secrets.sh` for GitHub/vault evidence capture.
- **Fallback alignment:** Mock-mode parity baseline documented in `docs/data/ga_mock_dataset.md` so QA can diff results post-switch.

## Readiness Gates
| # | Checklist Item | Owner | Command / Evidence | Status |
| --- | --- | --- | --- | --- |
| 1 | Confirm host reachable with auth token | Integrations + Data | `curl -H "Authorization: Bearer $GA_MCP_TOKEN" "$GA_MCP_HOST/landing-pages"` | Blocked — awaiting host; curl template staged in evidence plan. |
| 2 | Swap app config to MCP mode locally | Data | Set `GA_USE_MOCK=0`, `GA_MCP_HOST=<host>`, `GA_PROPERTY_ID=<id>`; restart dev server | Blocked — config toggle checklist ready pending credentials. |
| 3 | Run contract tests vs live MCP | Data | `npm run test:unit -- ga.sessions.contract.test.ts` (unskip) | Blocked — contract suite poised to unskip once host + token land. |
| 4 | Regenerate cache metrics & parity report | Data + Reliability | `npm run ops:analyze-supabase` (for MCP metadata) + attach to `feedback/data.md` | Blocked — metrics command waiting on live response payloads. |
| 5 | Validate dashboard tile parity (mock vs live) | QA/Enablement | Capture screenshots + fact IDs (`docs/enablement/shopify_admin_testing_fact_ids.md`) | Blocked — QA plan prepped; needs live tiles after host validation. |
| 6 | Configure monitoring & alerting | Reliability | Grafana alarms for MCP latency/error rate; evidence in `artifacts/monitoring/ga-mcp/` | Blocked — reliability on standby with alert template. |
| 7 | Compliance sign-off | Compliance | DPIA addendum + vault access log | Blocked — compliance awaiting credential proof bundle. |
| 8 | Manager go-live approval | Manager | Evidence bundle review (tests + monitoring + DPIA) | Blocked — dependent on prior gates. |

## Parity Validation Steps (Execute Immediately After Credentials Drop)
1. Mirror credential bundle into vault + GitHub `staging` and `production` environments (`scripts/deploy/sync-ga-mcp-secrets.sh`).
2. Toggle local env to MCP mode (`GA_USE_MOCK=0`) and run unit contract tests to confirm schema parity.
3. Hit MCP endpoint via `curl` to verify auth + response shape; store transcript in `artifacts/integrations/ga-mcp/<date>/`.
4. Run dashboard in MCP mode, capture tile output + fact IDs, and compare against mock dataset baseline (`docs/data/ga_mock_dataset.md`).
5. Execute cache + rate-limit probe (10 sequential requests) logging latency stats; attach summary to `feedback/data.md`.
6. Coordinate with reliability to enable monitoring alerts and capture screenshots/logs for compliance bundle.
7. Update marketing/compliance stakeholders with go-live timing and fallback plan; log decisions in `packages/memory` once available.

> Command templates for steps 1–5 are staged in `artifacts/integrations/ga-mcp/2025-10-10/parity_commands.md` for immediate execution once credentials land.

## Blockers & Next Actions
- Await OCC-INF-221 resolution; 07:23 UTC escalation posted in #infra-requests with CIO queue escalation slated for 2025-10-11 09:00 UTC if silence continues.
- Data to finalize GA property mapping once host delivered; ensure compliance receives DPIA evidence simultaneously.
- Prep contract test un-skip patch so parity validation can run as soon as credentials land.
- Document parity results + credential delivery timestamps in `feedback/data.md` and `docs/integrations/ga_mcp_onboarding.md`.

## References
- Direction: `docs/directions/data.md`
- Onboarding log: `docs/integrations/ga_mcp_onboarding.md`
- Mock dataset plan: `docs/data/ga_mock_dataset.md`
- Enablement fact IDs: `docs/enablement/shopify_admin_testing_fact_ids.md`
- Policy: `docs/policies/mcp-allowlist.json`
