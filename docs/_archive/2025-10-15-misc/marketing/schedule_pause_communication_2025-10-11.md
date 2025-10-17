---
epoch: 2025.10.E1
doc: docs/marketing/schedule_pause_communication_2025-10-11.md
owner: product
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---

# HotDash OCC Schedule Pause Communication — 2025-10-11T01:15Z

## To: Marketing, Support, Enablement

**Subject:** URGENT: HotDash OCC Launch Schedule Paused - Action Required

### Current Status

The HotDash Operator Control Center launch schedule is **PAUSED** effective 2025-10-11T01:15Z pending resolution of critical gating dependencies.

### Gating Dependencies

1. **DEPLOY-147 QA Evidence Bundle**
   - Sub-300ms `?mock=0` performance proof required
   - Playwright test suite rerun and artifact attachment
   - QA signoff on staging environment performance

2. **Shopify Admin Embed Token Resolution**
   - Embed token validation and compliance clearance
   - Staging access confirmation for all teams
   - Legal/compliance approval for token usage patterns

3. **SCC/DPA Compliance Approvals**
   - Supabase Standard Contractual Clauses countersignature (ticket #SUP-49213)
   - OpenAI Data Processing Agreement finalization
   - GA MCP data residency confirmation

4. **Nightly AI Logging Cadence Alignment**
   - Automated evidence bundling implementation
   - Index freshness validation with QA and Data teams
   - Retention policy compliance verification

### Next Review Window

- **Immediate:** All teams to acknowledge receipt by **2025-10-11T18:00Z**
- **Daily Check:** 09:30 UTC and 16:30 UTC blocker status updates in feedback/product.md
- **Go/No-Go Decision:** Pending all four dependencies clearing with evidence

### Required Acknowledgements

Please reply to this communication with:

1. **Confirmation:** "Acknowledged - HotDash OCC launch paused as of 2025-10-11"
2. **Impact Assessment:** Any downstream timeline adjustments or resource impacts
3. **Next Steps:** How your team will track resumption once dependencies clear

### Supporting Documentation

- Primary tracker: `feedback/product.md#deploy-147-tracking`
- Compliance status: `docs/compliance/evidence/vendor_dpa_status.md`
- Memory entry: `packages/memory/logs/ops/decisions.ndjson` (ops-deploy-147-evidence-anchor-20251011T010600)

### Contact

Product Agent monitoring blockers twice daily. Escalate urgent coordination issues to feedback/product.md or #occ-stakeholders channel.

---

**This is a controlled communication. Do not forward externally without manager approval.**
