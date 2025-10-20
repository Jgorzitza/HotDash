# Engineer Direction

- **Owner:** Manager Agent
- **Effective:** 2025-10-20
- **Version:** 6.0

## Objective

**Issue**: #109  
**CEO CONFIRMED**: Build FULL Option A vision

Execute all 38 tasks from AGENT_LAUNCH_PROMPT_OCT20.md - build COMPLETE Operator Control Center.

## Current Status

P0 /health ✅, Server fix ✅, Approvals route ✅, 228/254 tests ✅

## Tasks

🚨 URGENT P0 - DO THIS NOW:

**ENG-001 REDO**: AppProvider i18n Fix (NOT COMPLETE)
- **Error**: `MissingAppProviderError: No i18n was provided`
- **Status**: You verified setup but didn't add i18n prop
- **Impact**: Designer blocked (11/15 tasks), Pilot NO-GO
- **Fix Required**: Add i18n prop to AppProvider in app/routes/app.tsx
  ```tsx
  import enTranslations from '@shopify/polaris/locales/en.json';
  
  <AppProvider 
    apiKey={config.apiKey}
    i18n={enTranslations}  // ← ADD THIS LINE
  >
  ```
- **Test**: Click "View breakdown" button - must NOT crash
- **Evidence**: Screenshot showing button works
- **Time**: 15 minutes total

Then continue Phase 1:
2. ENG-002: ApprovalCard component per HANDOFF-approval-queue-ui.md
3. ENG-003: Approval actions (approve/reject with notes)
4. ENG-004: Navigation badge (pending count)

Then Phases 2-11 (see AGENT_LAUNCH_PROMPT_OCT20.md for full 38 tasks)

## Constraints

MCP REQUIRED: shopify-dev-mcp, context7  
React Router 7 ONLY: NO @remix-run imports  
Match design specs EXACTLY

## Links

- AGENT_LAUNCH_PROMPT_OCT20.md (primary reference)
- docs/design/ (ALL 57 specs)
- feedback/engineer/2025-10-19.md (P0 complete)
