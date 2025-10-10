# Weekly Insight Packet Outline — Target Delivery 2025-10-16

## Objective
Provide the manager with a reproducible weekly bundle that explains decision-sync health, KPI movement, and outstanding risks so operations can act without scraping raw exports.

## Deliverables
- Executive summary (1–2 paragraphs) highlighting key KPI deltas and notable incidents.
- KPI dashboard with 7-day trend charts for sales delta, SLA breach rate, and traffic anomalies.
- Decision-sync health appendix covering failure rates, latency percentiles, and retry depth.
- GA MCP readiness update summarizing parity status, outstanding credential blockers, and next remediation steps.
- Attachment bundle containing:
  - PDF or static images of charts.
  - Notebook (`notebooks/weekly_insights_2025-10-16.ipynb`) with SQL + chart generation code.
  - Latest analyzer JSON artifacts referenced in the narrative.

## Data Sources
- Supabase decision logs (`DecisionLog` table) via staging credentials once unblocked.
- Shopify admin telemetry warehouse (Prisma seeds + staging Supabase mirror).
- GA MCP mock dataset / live endpoint (post OCC-INF-221).
- Cached NDJSON exports from reliability (`artifacts/logs/*.ndjson`).

## Required Analyses
1. **KPI Trend Comparison**
   - Sales delta vs prior week.
   - SLA breach rate over rolling 7-day window.
   - Traffic anomaly counts segmented by severity.
2. **Decision-Sync Reliability**
   - Failure rate by hour and by decision scope.
   - p95/p99 latency trends post-mitigation.
   - Retry attempt distribution.
3. **GA MCP Parity**
   - Contract parity checklist status summary.
   - Discovered schema drifts or mismatched facts.
4. **Operational Backlog**
   - Outstanding action items from `feedback/data.md`.
   - Blocker status (credentials, exports, QA dependencies).

## Narrative Structure
1. Headline KPI callouts with bullet summary of changes vs last packet.
2. Decision-sync health deep-dive referencing analyzer visuals.
3. GA MCP readiness status with checklist progress.
4. Upcoming focus areas + asks for engineering/reliability.

## Visualization Plan
- Use Observable or Jupyter notebook to generate charts, export as PNG for the packet.
- Mermaid sequence diagram depicting end-to-end decision-sync retries.
- Table snapshot of GA MCP parity checklist highlighting incomplete gates.

## Next Steps Before 2025-10-16
1. Await new NDJSON export and rerun analyzer to populate charts.
2. Secure Supabase staging credentials and validate parity script output.
3. Populate notebook skeleton with reusable queries (`queries/weekly_insights/`).
4. Schedule QA/AI sync daily to capture regression log alignment; append highlights to packet.

