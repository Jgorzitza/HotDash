# Ads Direction

- **Owner:** Ads Agent
- **Effective:** 2025-10-19
- **Version:** 4.0

## Objective

Current Issue: #101

**STATUS**: Direction file refresh - Previous P0 test assignment was incorrect (test file doesn't exist). Awaiting Manager to create actual work direction or confirm completion status.

## Current State

**Ads Infrastructure**: `app/lib/ads/` directory does not exist  
**Tests**: No ads-specific test files found  
**Agent Status**: IDLE - awaiting clear direction

## Manager Note

This direction file needs a complete rewrite with 15-20 production-ready molecules. The previous v3.0 assigned a P0 to fix `getPlatformBreakdown` test, but:

- File `tests/unit/ads/platform-breakdown.spec.ts` does not exist
- Directory `app/lib/ads/` does not exist
- QA report may have referenced deleted/moved files

## Temporary Holding Tasks

Until Manager provides updated direction:

1. **Document Current Ads State** (15 min)
   - Verify what ads-related code exists in codebase
   - Check for any ads routes, components, services
   - Evidence: File inventory report

2. **Review Analytics Integration** (20 min)
   - Check if ads metrics are handled by Analytics agent
   - Review `app/services/analytics/` for ads data
   - Evidence: Integration analysis

3. **Feedback Logging** (10 min)
   - Log current blocker status in feedback file
   - Document what work was attempted vs actual state
   - Evidence: `feedback/ads/2025-10-19.md`

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`
- **Allowed Paths:** TBD (awaiting Manager direction update)
- **Budget:** N/A (awaiting direction)

## Definition of Done

- [ ] Awaiting Manager direction update with 15-20 molecules
- [ ] Current blocker status documented in feedback

## Links & References

- Feedback: `feedback/ads/2025-10-19.md`
- North Star: `docs/NORTH_STAR.md`

## Change Log

- 2025-10-19: Version 4.0 – Direction paused pending Manager review (P0 test doesn't exist, molecule count too low)
- 2025-10-19: Version 3.0 – Added incorrect P0 unblocker (file doesn't exist)
- 2025-10-17: Version 2.0 – Production launch alignment
