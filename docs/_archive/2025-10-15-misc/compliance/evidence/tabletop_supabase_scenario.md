---
epoch: 2025.10.E1
doc: docs/compliance/evidence/tabletop_supabase_scenario.md
owner: compliance
last_reviewed: 2025-10-09
doc_hash: TBD
expires: 2025-10-16
---

# Supabase Incident Tabletop Template — Draft

> Placeholder structure for Supabase decision logging incident exercise. Populate once reliability/support confirm scope and scheduling.

## Scenario Overview

- **Objective**: Validate detection, containment, communication, and recovery steps for Supabase decision logging breach/outage.
- **Trigger**: TBD (e.g., audit log anomaly, sync failure alert, credential exposure).

## Participants

- Compliance (Incident Lead)
- Reliability (On-call, Supabase admin)
- Engineering (Decision logging maintainer)
- Support (Operator comms)
- Marketing/Comms (External messaging)

## Agenda Outline

1. Kickoff & Roles
2. Detection timeline review
3. Containment simulation (credential rotation, RLS adjustments)
4. Communication planning (internal, merchants, regulators)
5. Recovery validation (data parity, cron jobs)
6. Post-incident actions & evidence logging

## Evidence Checklist

- [ ] Incident log entry in `feedback/compliance.md`
- [ ] Supabase audit extracts archived
- [ ] Cron job verification output stored in `docs/compliance/evidence/retention_runs/`
- [ ] Postmortem draft in `docs/compliance/evidence/INCIDENT_ID/postmortem.md`

## Follow-ups

- Capture action items with owners + due dates.
- Update `docs/runbooks/incident_response_supabase.md` with any changes.
