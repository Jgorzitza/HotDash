# Product Analytics Instrumentation Strategy

**Version**: 1.0
**Date**: October 11, 2025
**Owner**: Product Agent

---

## Instrumentation Plan

**Tool**: Mixpanel or Amplitude

**Events to Track**:
- `draft_reviewed` (operator action)
- `draft_approved` (approval without edit)
- `draft_edited` (edit before approval)
- `dashboard_viewed` (engagement)
- `feature_used` (feature adoption)

**Properties**:
- User ID, Tenant ID, Timestamp
- Feature name, action type
- Performance metrics (load time)

**Goal**: Track every user interaction for data-driven product decisions

**Document Owner**: Product Agent
**Status**: Analytics instrumentation spec

