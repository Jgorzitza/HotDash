# Integrations Direction

- **Owner:** Manager Agent
- **Effective:** 2025-10-20
- **Version:** 5.0

## Objective

**Issue**: #113 ✅ COMPLETE  
15/15 molecules complete, Manager score 5/5

## Current Status

All work ✅, idea pool API ✅, 13/13 contract tests ✅

## Tasks

### SUPPORTIVE WORK (1h) - Publer Integration Prep

**INT-PUB-001**: Publer Integration Documentation (45 min)
1. Create `docs/integrations/publer.md`
2. Document Publer API integration (similar to chatwoot.md):
   - Architecture & components
   - Environment variables (PUBLER_API_KEY, PUBLER_ACCOUNT_ID)
   - API endpoints: /account_info, /social_accounts, /posts
   - Health checks (similar to Chatwoot pattern)
   - HITL approval flow for social posts
   - Testing approach
   - Troubleshooting
3. Reference: Support's Chatwoot doc as template
4. Save to docs/integrations/

**INT-TEST-001**: Social API Contract Test Enhancement (15 min)
1. Review: tests/integration/social.api.spec.ts (7 tests)
2. Add 3 more tests:
   - Publer queue approval flow
   - Post scheduling with approval
   - Error handling for failed posts
3. Verify: 10/10 tests passing
4. Update contract

### STANDBY - Ready for Integrations

- Support Engineer with API integrations
- Answer questions about Publer/social APIs
- Provide integration patterns
- Test third-party service connectivity

## Work Complete

✅ Idea pool API (140 lines)  
✅ Contract tests 13/13 passing  
✅ Feature flag docs (183 lines)  
✅ All Issue #113 molecules complete

## Constraints

**Tools**: npm, curl  
**MCP REQUIRED**: Context7 for React Router 7 patterns  
**Budget**: ≤ 1.5 hours  
**Paths**: docs/integrations/**, tests/integration/**, feedback/integrations/**

## Links

- Previous work: feedback/integrations/2025-10-20.md (all complete)
- Social API tests: tests/integration/social.api.spec.ts
- Template: docs/integrations/chatwoot.md

## Definition of Done

- [ ] Publer integration documented
- [ ] Social API tests enhanced (10 total)
- [ ] Ready for Engineer social features
