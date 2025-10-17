# Weekly Support Health Report (Template)

Week of: YYYY-MM-DD
Owner: Support Agent

## Snapshot
- Tickets received: __
- SLA adherence (response <15m): __%
- Escalations: __ (to AI-Customer / to Human)
- Replied by AI (drafted by agent): __%
- Avg Grades — Tone: __, Accuracy: __, Policy: __

## Trends
- Volume: ▲/▼ vs last week (__%)
- SLA: ▲/▼ vs last week (__ pp)
- Quality (grades): Tone __ / Accuracy __ / Policy __
- Learning: median edit distance __ (lower is better)

## Incidents & Retries
- Chatwoot webhook retries: __ (count)
- Long-running retries (>5 min): __ (list)
- Root causes & fixes: 
  - [ ] Item 1

## Action Items
- [ ] Improve latency on __ route (owner: __, due: __)
- [ ] Reduce low-accuracy drafts in __ category (owner: __, due: __)

## How to Generate
1) Ensure signals are populated (see `docs/runbooks/support_signals_coordination.md`).
2) Query Supabase rollups (SLA, grades, edit distance, escalations).
3) Fill this template; attach charts to feedback/support/YYYY-MM-DD.md.

