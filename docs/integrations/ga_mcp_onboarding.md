---
epoch: 2025.10.E1
doc: docs/integrations/ga_mcp_onboarding.md
owner: integrations
last_reviewed: 2025-10-08
doc_hash: TBD
expires: 2025-10-18
---
# GA MCP Production Credential Onboarding

## Current Status
- **Integration mode:** Mock (`GA_USE_MOCK=1`); live MCP blocked on credential delivery from infrastructure.
- **Goal:** Receive `GA_MCP_HOST` endpoint + service credentials and store them in approved secrets locations to unlock the 24-hour go-live checklist (`docs/data/ga_mcp_go_live_checklist.md`).
- **Next milestone:** Manager + infrastructure sync at 18:30 UTC (2025-10-08) to secure ETA or contingency plan; prepare fallback evidence bundle in parallel.

## Credential Inventory
| Artifact | Description | Storage Target | Owner | Status |
| --- | --- | --- | --- | --- |
| `GA_MCP_HOST` | Base URL for MCP gateway (e.g., `https://ga-mcp.hotdash.internal`) | Vault (`vault/occ/ga_mcp/host.env`) + GitHub Actions secret | Infrastructure | ⏳ Pending |
| `GA_MCP_CREDENTIALS` | Service account key / auth token bundle for MCP | GitHub Actions secret (`GA_MCP_CREDENTIALS`) | Infrastructure → Reliability (custodian) | ⏳ Pending |
| `GA_PROPERTY_ID` | Google Analytics Property ID for production store | Config file `.env.production` + GitHub secret (`GA_PROPERTY_ID`) | Data | ⏳ Pending confirmation |
| Runbook evidence | Screenshots/logs proving successful MCP auth + rate-limit checks | `artifacts/integrations/ga-mcp/` | Integrations | 🚧 In progress |

## Onboarding Checklist
| # | Task | Owner | Due | Status | Evidence/Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | Submit credential request form to Infrastructure (host + service account) | Integrations | 2025-10-07 | ✅ Submitted | Ticket OCC-INF-221 logged with infra queue (awaiting assignment) |
| 2 | Provide final GA property scope + data retention requirements | Data | 2025-10-07 | ⏳ Pending | Need confirmation that production property matches mock schema per `docs/data/ga_mock_dataset.md` |
| 3 | Infrastructure provisions MCP host + credentials | Infrastructure | 2025-10-08 | ⏳ Pending | Blocked until ticket OCC-INF-221 picked up; escalated to manager 2025-10-08 15:10 UTC; manager coordinating with infra at 18:30 UTC |
| 4 | Reliability stores credentials in vault + GitHub, documents rotation cadence (`docs/runbooks/secret_rotation.md`) | Reliability | 2025-10-08 | ⏳ Pending | Secret rotation entry already stubbed (`GA_MCP_CREDENTIALS`) |
| 5 | Integrations validates MCP connectivity (`curl` smoke test + auth) | Integrations | 2025-10-08 | ⏳ Pending | Use `docs/data/ga_mcp_go_live_checklist.md` connectivity steps |
| 6 | Data runs contract tests against live MCP (`tests/unit/contracts/ga.sessions.contract.test.ts`) | Data | 2025-10-08 | ⏳ Pending | Toggle `GA_USE_MOCK=0` locally with new host |
| 7 | Reliability monitors rate limits & alerting integration (`docs/data/data_quality_monitoring.md`) | Reliability | 2025-10-09 | ⏳ Pending | Capture screenshots of Grafana alerts once wired |
| 8 | Manager approval to flip dashboard to live MCP | Manager | 2025-10-09 | ⏳ Pending | Requires evidence bundle + fallback confirmation |

## Contact Log
| Date (UTC) | Contact | Role / Team | Channel | Summary | Next Step |
| --- | --- | --- | --- | --- | --- |
| 2025-10-07 | Jordan Malik | Infrastructure Duty Lead | #infra-requests (internal channel) | Filed OCC-INF-221 with host + credential requirements; requested ETA before 2025-10-08 review. | Await infra assignment + ETA update (follow up if no response by 18:00 UTC). |
| 2025-10-07 | Jordan Malik | Infrastructure Duty Lead | internal direct message | Follow-up ping requesting ticket assignment + ETA; flagged 24h go-live dependency. | Waiting on response; escalate to manager if no reply by 2025-10-08 15:00 UTC. |
| 2025-10-08 | Priya Singh | Manager | #occ-standup (internal channel) | Escalated OCC-INF-221 due to missed SLA; requested direct ETA and contingency options. | Manager to sync with infrastructure lead; update expected 2025-10-08 18:00 UTC. |
| 2025-10-08 | Priya Singh | Manager | #occ-standup (internal channel) | Manager confirmed infra sync scheduled 18:30 UTC; no ETA yet. | Await post-sync summary; prepare fallback plan update if host remains blocked. |
| 2025-10-07 | Casey Lin | Compliance Lead | Email | Flagged upcoming credential receipt for DPIA update; confirmed storage in vault is acceptable once access logs captured. | Share credential evidence bundle once infrastructure delivers. |
| 2025-10-07 | Riley Chen | Ops Lead / Stakeholder | Standup note | Communicated mock-mode limitation and go-live dependency on GA MCP credentials. | Provide go-live timing once infrastructure confirms. |
| 2025-10-10 | Jordan Malik | Infrastructure Duty Lead | #infra-requests | Posted 19:25Z follow-up (see `artifacts/integrations/ga-mcp/2025-10-10/ping_infra_2025-10-10T19-25Z.md`) requesting credential delivery ETA by 21:00Z. | If no response by 20:30Z, escalate via direct message per direction. |

### Pending Update — Manager/Infrastructure Sync (2025-10-08 18:30 UTC)
- **Outcome summary:** Awaiting infra update; 2025-10-10 19:25Z follow-up posted in `#infra-requests` requesting ETA.
- **Credential ETA / fallback:** Pending infra response; fallback remains extended mock mode until MCP host/credentials arrive.
- **Action items:**
  - Infra owner + due date: Jordan Malik to provide ETA by 2025-10-10 21:00Z.
  - Integrations follow-up: Escalate via direct message if no reply by 20:30Z; prepare escalation draft in artifacts.
  - Reliability / Compliance tasks: Stand by to store credentials in vault + GitHub once delivered.
- **Notes for evidence bundle:** Ensure credential delivery artifacts are archived under `artifacts/integrations/ga-mcp/2025-10-10/` alongside follow-up ping.

## Verification & Evidence Requirements
- **Credential receipt:** Screenshot or log of MCP host URL + credential bundle delivered (store in `artifacts/integrations/ga-mcp/2025-10-07/`).
- **Secret storage proof:** GitHub Actions secret audit screenshot + vault entry confirmation from reliability.
- **Connectivity validation:** `curl` transcript hitting `/landing-pages` endpoint with 200 response, plus application log excerpt showing `GA MCP mode enabled`.
- **Rate-limit check:** Brief load test (10 sequential requests) with timestamps to demonstrate stable latency (<1s) and no 429s.
- **Fallback validation:** Screenshot proving `GA_USE_MOCK=1` continues to function when host unavailable (documented rollback path).

## Dependencies & Risks
- Infrastructure backlog may delay host provisioning past 2025-10-08; escalate to manager if no confirmed ETA by 2025-10-08 15:00 UTC (in progress).
- Service account scope must include `analytics.readonly`; missing scope will fail contract tests—coordinate with data agent during validation.
- Ensure compliance sign-off before storing credentials; DPIA updates live in `docs/compliance/data_inventory.md`.
- Maintain mock dataset parity until go-live; do not flip feature flag without completing `docs/data/ga_mcp_go_live_checklist.md`.

## Timeline Snapshot
| Date | Milestone |
| --- | --- |
| 2025-10-07 | Credential request submitted; compliance + stakeholders notified |
| 2025-10-08 | Manager/infra sync to secure host credentials and ETA |
| 2025-10-09 | Aim to complete evidence bundle and request manager approval |
| 2025-10-10 | Buffer for remediation / follow-up if issues found |
