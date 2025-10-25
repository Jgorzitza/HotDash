# Pilot Go-Live Run-of-Show & Contingency Playbook

## 1. Launch Overview
- **Launch date window:** T0 = production enablement at 10:00 local (PST).
- **Scope:** Activate HotDash control center for production operators with live approvals + analytics.
- **Primary goals:** Ensure zero downtime, maintain HITL guardrails, capture metrics + operator sentiment during cutover.

## 2. Roles & Responsibilities
| Role | Owner | Responsibilities | Channels |
|------|-------|------------------|----------|
| Launch Commander | Pilot lead | Orchestrate run-of-show, chair standups, decision authority for pause/rollback. | Zoom bridge, Slack `#launch-war-room` |
| Incident Scribe | QA | Maintain live incident log, timestamp events, ensure handoffs documented. | Google Sheet, Slack updates |
| Engineering On-Call | Engineer agent | Owns application fixes, staging/prod verification, DB health. | PagerDuty, Slack |
| DevOps | DevOps agent | Fly.io deployments, infrastructure monitoring, log ingestion. | PagerDuty, Fly dashboard |
| CX Representative | Support agent | Verifies Chatwoot integrations, customer communications coordination. | Chatwoot, Slack |
| Executive Stakeholder | CEO | Final go/no-go approval, business communications. | Slack DM, Email |

## 3. Timeline (All times PST)
- **T-24h:** Dry run in staging, confirm feature flags, verify incident log template, final user-testing sign-off.
- **T-12h:** Lock code changes (freeze), ensure MCP evidence archived, confirm data snapshots.
- **T-2h:** Pre-flight checklist call; verify on-call lineup, monitoring dashboards, alert thresholds.
- **T-30m:** Warm staging + production sessions, run smoke tests (approvals queue, inventory tile, CX queue).
- **T0 (10:00):** Enable production feature flag, announce launch message in `#launch-war-room` and operator channel.
- **T+15m:** Verify metrics (latency, error rates), confirm operators logged in, address immediate questions.
- **T+1h:** First business checkpoint with CEO; summarize incidents, adoption metrics.
- **T+4h:** Secondary checkpoint; decide on widening access or rollback.
- **T+24h:** Post-launch retrospective scheduling + final metrics report.

## 4. Communication Cadence & Templates
- **Launch announcement (T0):**
  > “HotDash Control Center is now live in production. Please begin using it for daily operations. Report issues in #launch-war-room. Operators: follow the approvals HITL flow; all changes require acknowledgment.”
- **Incident notification:**
  > “INCIDENT [severity]: Summary, impact, workaround. Owner: @name. Next update at HH:MM.”
- **Status heartbeat (every 30m first 4h):**
  > “Status Update – Time HH:MM. Incidents open: X (list). Latency: N ms. Operator engagement: Y active sessions. Next checkpoint HH:MM.”
- **Rollback broadcast (if triggered):**
  > “Rollback initiated at HH:MM due to [trigger]. Operators: revert to legacy workflows immediately. Follow instructions in Runbook §6.”

## 5. Monitoring & Success Metrics
- App health: web error rate <1%, P95 latency <1.5s, SSE stream stable.
- Workflow adoption: ≥80% target operators logged in; approvals processed through HITL queue.
- Incident threshold: No outstanding Critical incidents past 15 minutes without plan.
- Evidence: MCP heartbeat maintained, decision log capturing approvals and rollback events.

## 6. Rollback Triggers & Procedure
### Triggers
- Critical blocker preventing approvals or causing data corruption.
- Sustained outage >10 minutes for Supabase, Fly, or Shopify Admin APIs.
- Security/PII exposure path discovered.

### Procedure
1. Launch Commander calls for rollback; CEO informed immediately.
2. Engineering disables production feature flag (`HOTDASH_CONTROL_CENTER=off`).
3. DevOps runs verified rollback script (see `scripts/ops/rollback-control-center.ts`).
4. Support notifies operators to resume legacy tools; provide fallback links.
5. Incident Scribe documents timeline + resolution; schedule post-incident review within 24 hours.

## 7. Contingency Scenarios
| Scenario | Immediate Action | Owner | Notes |
|----------|------------------|-------|-------|
| Shopify Admin outage | Switch monitoring to queued mode; pause approvals; notify operators of delay. | DevOps | Use Shopify status page for updates. |
| Supabase latency spike | Reduce polling frequency, monitor long-running queries, escalate to Data team. | Engineer | Capture query IDs for triage. |
| Chatwoot API failure | Route CX tickets to email fallback; log public notice for customers if >30m. | Support | Reference Chatwoot health runbook. |
| Metrics desync | Cross-check GA/GtmHub; if mismatch >10%, freeze dashboard tiles and issue alert. | Analytics | Provide manual report in standup. |
| Operator confusion | Deploy training snippet, host live Zoom walkthrough, gather feedback for UX improvements. | Pilot lead | Schedule follow-up session. |

## 8. Escalation Paths
- **Critical:** Launch Commander → Engineering On-Call → CEO (if business impact) → Exec comms.
- **High:** Launch Commander → relevant specialist (Analytics, Support) → log decision entry.
- **Medium/Low:** Record in incident sheet; triaged in daily standup.
- Escalation time limits: Critical (within 5m), High (within 15m), Medium (next checkpoint).

## 9. Checklists
### Pre-Launch
- [ ] Feature flag staged with planned toggle time.
- [ ] Incident log sheet prepared with owners.
- [ ] Monitoring dashboards bookmarked.
- [ ] Communication templates pre-filled with names/times.
- [ ] Rollback script dry-run in staging same day.

### During Launch
- [ ] Zoom bridge live and recorded.
- [ ] 30m heartbeat posted.
- [ ] Incident log updated real-time.
- [ ] MCP heartbeat appended for long-running tasks.

### Post Launch (T+24h)
- [ ] Final metrics compiled (usage, incidents, response times).
- [ ] Retrospective scheduled with cross-functional attendees.
- [ ] Lessons learned captured in `artifacts/pilot/<date>/retro.md`.

## 10. Documentation & Artifact Storage
- Store run-of-show updates and incident logs in `artifacts/pilot/<YYYY-MM-DD>/launch/`.
- Upload Zoom recordings to secure drive with 14-day retention.
- Link decision log entries to relevant incidents for traceability.

## 11. Sign-Off Process
- **Launch Commander:** Confirms all checklists complete.
- **Engineering On-Call:** Verifies system metrics within thresholds.
- **Support Lead:** Confirms CX workflows stable.
- **CEO:** Provides final “launch accepted” or “rollback” decision based on incident summary.
