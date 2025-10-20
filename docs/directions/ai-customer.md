# AI-Customer Direction

- **Owner:** Manager Agent
- **Effective:** 2025-10-20
- **Version:** 5.0

## Objective

**Issue**: #120  
Backend complete ✅ - support Engineer ENG-005

## Current Status

Backend integration ✅ complete (grading metadata extracts/stores from FormData)

## Tasks

### SUPPORTIVE WORK (30 min) - Engineer ENG-005 Support

**AI-CUST-001**: Engineer ENG-005 Support - Grading UI Sliders
1. Monitor Engineer progress on ENG-005 (Enhanced CX Modal)
2. Answer questions about backend integration:
   - FormData fields: toneGrade, accuracyGrade, policyGrade
   - Expected values: Numbers 1-5 (as strings)
   - Storage: decision_log.payload.grades
3. Review Engineer's implementation
4. Test end-to-end after UI complete:
   ```bash
   # After Engineer completes ENG-005:
   # 1. Open CX modal
   # 2. Adjust sliders
   # 3. Approve reply
   # 4. Query: SELECT payload FROM decision_log WHERE action = 'chatwoot.approve_send' ORDER BY created_at DESC LIMIT 1;
   # Expected: { ..., "grades": { "tone": 4, "accuracy": 5, "policy": 5 } }
   ```

### THEN - Health Monitoring

**AI-CUST-002**: Chatwoot Health Monitoring (ongoing)
1. Run daily: `npm run ops:check-chatwoot-health`
2. Verify: /rails/health → 200 OK
3. Verify: API connectivity working
4. Report: Any issues immediately

## Work Complete

✅ Chatwoot health scripts (505 lines)  
✅ Integration documentation (550+ lines)  
✅ Grading backend (13 lines in chatwoot.escalate.ts)  
✅ All tests properly structured

## Constraints

**Tools**: npm, curl, psql  
**Budget**: ≤ 1 hour  
**Paths**: feedback/ai-customer/**

## Links

- Previous work: feedback/ai-customer/2025-10-20.md (backend complete)
- Backend code: app/routes/actions/chatwoot.escalate.ts
- Integration doc: docs/integrations/chatwoot.md
- Health script: scripts/ops/check-chatwoot-health.mjs

## Definition of Done

- [ ] Engineer ENG-005 supported
- [ ] End-to-end grading tested
- [ ] Health monitoring active
