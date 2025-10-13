# CEO Dashboard Analytics Implementation Guide

**Version**: 1.0  
**Date**: October 13, 2025  
**Owner**: Product Agent  
**Purpose**: Guide for implementing dashboard usage analytics tracking  
**Status**: Ready for Engineer implementation  

---

## Overview

**Goal**: Track how Hot Rodan CEO uses HotDash dashboard to measure pilot success

**What We Track**:
1. **Sessions**: Login frequency, duration, device type
2. **Tile Interactions**: Which tiles used, how often, what actions
3. **Approval Actions**: Approval queue usage, decision speed, action types

**Why**: Prove ROI, identify valuable features, spot friction, guide iteration

---

## Database Schema

### Migration Applied
- **File**: `supabase/migrations/20251013223000_ceo_dashboard_usage_analytics.sql`
- **Tables**: 3 tables + 3 analytics views
- **Status**: Ready to apply to staging/production

### Tables Created

#### 1. dashboard_sessions
Tracks each login session with duration and device info.

**Key Fields**:
- `session_id`: Unique UUID for each session
- `user_id`: User identifier (CEO email or ID)
- `login_at`: Session start timestamp
- `logout_at`: Session end timestamp (NULL if active)
- `session_duration_seconds`: Auto-calculated on logout
- `device_type`: desktop/mobile/tablet
- `customer_id`: Always 'hot-rodan' for pilot

**Indexes**: user_id, customer_id, login_at (for fast queries)

#### 2. tile_interactions
Tracks every tile interaction (view, click, refresh, export).

**Key Fields**:
- `session_id`: Links to dashboard_sessions
- `tile_name`: Name of tile (e.g., 'seo-pulse', 'sales-pulse')
- `interaction_type`: view/click/expand/refresh/export
- `interaction_data`: JSONB for additional context
- `interaction_at`: Timestamp of interaction

**Indexes**: session_id, tile_name, user_id, interaction_at

#### 3. approval_actions
Tracks approval queue decisions.

**Key Fields**:
- `session_id`: Links to dashboard_sessions
- `approval_type`: Type of approval (e.g., 'order-refund', 'discount-code')
- `action`: approve/reject/defer/edit
- `approval_data`: JSONB with approval details
- `time_to_decision_seconds`: How long to decide
- `approved_at`: Decision timestamp

**Indexes**: session_id, user_id, approval_type, approved_at

### Analytics Views

#### v_daily_usage_summary
Daily rollup of session metrics per user.

**Columns**:
- `usage_date`: Date of usage
- `total_sessions`: Number of sessions that day
- `avg_session_duration_seconds`: Average session length
- `first_login`, `last_login`: First and last login times
- `mobile_sessions`, `desktop_sessions`: Device breakdown

**Use Case**: Track daily engagement trends

#### v_tile_usage_summary
Daily rollup of tile interaction metrics.

**Columns**:
- `tile_name`: Name of tile
- `usage_date`: Date of usage
- `total_interactions`: All interactions
- `unique_users`, `unique_sessions`: Reach metrics
- `views`, `clicks`, `refreshes`, `exports`: Action breakdown

**Use Case**: Identify most valuable tiles

#### v_approval_queue_metrics
Daily rollup of approval queue performance.

**Columns**:
- `approval_type`: Type of approval
- `approval_date`: Date of approvals
- `total_approvals`: Count of all actions
- `approved_count`, `rejected_count`, `deferred_count`, `edited_count`: Action breakdown
- `avg_decision_time_seconds`, `median_decision_time_seconds`: Speed metrics

**Use Case**: Measure approval efficiency

---

## Implementation Steps

### Step 1: Apply Migration (Data Team)

**Command**:
```bash
cd ~/HotDash/hot-dash
supabase db push
```

**Verify**:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('dashboard_sessions', 'tile_interactions', 'approval_actions');
```

**Expected**: 3 rows returned

---

### Step 2: Instrument Frontend (Engineer Team)

#### 2.1 Track Session Start

**Location**: `app/routes/_index.tsx` or main dashboard route

**Code**:
```typescript
import { createClient } from '@supabase/supabase-js';

// On dashboard load
useEffect(() => {
  const sessionId = crypto.randomUUID();
  const userId = user.email; // From auth context
  
  supabase.from('dashboard_sessions').insert({
    session_id: sessionId,
    user_id: userId,
    user_email: user.email,
    customer_id: 'hot-rodan',
    device_type: getDeviceType(), // 'desktop' | 'mobile' | 'tablet'
    user_agent: navigator.userAgent,
    login_at: new Date().toISOString()
  });
  
  // Store sessionId in localStorage or context
  localStorage.setItem('dashboard_session_id', sessionId);
}, []);

function getDeviceType() {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}
```

#### 2.2 Track Session End

**Location**: Same route, cleanup

**Code**:
```typescript
useEffect(() => {
  const handleBeforeUnload = async () => {
    const sessionId = localStorage.getItem('dashboard_session_id');
    if (sessionId) {
      await supabase.from('dashboard_sessions')
        .update({ logout_at: new Date().toISOString() })
        .eq('session_id', sessionId);
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, []);
```

#### 2.3 Track Tile Interactions

**Location**: Each tile component (e.g., `SEOPulseTile.tsx`)

**Code**:
```typescript
const trackTileInteraction = async (
  tileName: string, 
  interactionType: 'view' | 'click' | 'expand' | 'refresh' | 'export',
  interactionData?: Record<string, any>
) => {
  const sessionId = localStorage.getItem('dashboard_session_id');
  const userId = user.email;
  
  await supabase.from('tile_interactions').insert({
    session_id: sessionId,
    user_id: userId,
    customer_id: 'hot-rodan',
    tile_name: tileName,
    interaction_type: interactionType,
    interaction_data: interactionData,
    interaction_at: new Date().toISOString()
  });
};

// On tile mount
useEffect(() => {
  trackTileInteraction('seo-pulse', 'view');
}, []);

// On tile click
const handleTileClick = () => {
  trackTileInteraction('seo-pulse', 'click', { 
    anomaly_count: anomalies.length 
  });
};

// On refresh button
const handleRefresh = () => {
  trackTileInteraction('seo-pulse', 'refresh');
  // ... refresh logic
};
```

#### 2.4 Track Approval Actions

**Location**: Approval queue component

**Code**:
```typescript
const trackApprovalAction = async (
  approvalType: string,
  action: 'approve' | 'reject' | 'defer' | 'edit',
  approvalData: Record<string, any>,
  timeToDecisionSeconds: number
) => {
  const sessionId = localStorage.getItem('dashboard_session_id');
  const userId = user.email;
  
  await supabase.from('approval_actions').insert({
    session_id: sessionId,
    user_id: userId,
    customer_id: 'hot-rodan',
    approval_type: approvalType,
    action: action,
    approval_data: approvalData,
    time_to_decision_seconds: timeToDecisionSeconds,
    approved_at: new Date().toISOString()
  });
};

// On approval action
const handleApprove = (approval) => {
  const timeToDecision = Date.now() - approval.created_at;
  trackApprovalAction(
    approval.type,
    'approve',
    { approval_id: approval.id, amount: approval.amount },
    Math.floor(timeToDecision / 1000)
  );
  // ... approval logic
};
```

---

### Step 3: Create Analytics Dashboard (Designer + Engineer)

**Location**: New route `/dashboard/analytics` (admin only)

**Components**:
1. **Daily Engagement Chart**: Line chart of sessions per day
2. **Tile Usage Heatmap**: Which tiles used most
3. **Approval Queue Metrics**: Approval rate, decision speed
4. **Session Duration Distribution**: Histogram of session lengths
5. **Device Breakdown**: Pie chart of desktop vs mobile

**Data Source**: Query analytics views

**Example Query**:
```typescript
// Daily engagement
const { data: dailyUsage } = await supabase
  .from('v_daily_usage_summary')
  .select('*')
  .eq('customer_id', 'hot-rodan')
  .gte('usage_date', '2025-10-15')
  .order('usage_date', { ascending: true });

// Tile usage
const { data: tileUsage } = await supabase
  .from('v_tile_usage_summary')
  .select('*')
  .eq('customer_id', 'hot-rodan')
  .gte('usage_date', '2025-10-15')
  .order('total_interactions', { ascending: false });

// Approval metrics
const { data: approvalMetrics } = await supabase
  .from('v_approval_queue_metrics')
  .select('*')
  .eq('customer_id', 'hot-rodan')
  .gte('approval_date', '2025-10-15');
```

---

## Success Metrics

### Week 1 Targets (Oct 15-21)
- **Login Frequency**: CEO logs in ≥5 days
- **Session Duration**: 2-10 minutes average
- **Tile Usage**: All tiles viewed at least once
- **Approval Actions**: ≥3 approvals processed

### Week 2-4 Targets
- **Login Frequency**: CEO logs in ≥6 days/week
- **Session Duration**: Stable 2-10 minutes (efficiency)
- **Tile Usage**: 2-3 tiles used daily (favorites emerge)
- **Approval Actions**: ≥10 approvals/week, <30s decision time

### Red Flags
- **No logins for 2+ days**: CEO not using dashboard
- **Session duration <1 min**: Not actually engaging
- **Session duration >15 min**: Dashboard too complex
- **Zero tile interactions**: Technical issue or UX problem
- **Zero approvals**: Approval queue not working

---

## Testing Checklist

### QA Validation (Before Launch)

**Test 1: Session Tracking**
- [ ] Login to dashboard
- [ ] Verify session record created in `dashboard_sessions`
- [ ] Logout or close tab
- [ ] Verify `logout_at` and `session_duration_seconds` populated
- [ ] Check device_type matches actual device

**Test 2: Tile Interaction Tracking**
- [ ] View SEO Pulse tile
- [ ] Verify 'view' interaction logged in `tile_interactions`
- [ ] Click tile to expand
- [ ] Verify 'click' interaction logged
- [ ] Click refresh button
- [ ] Verify 'refresh' interaction logged

**Test 3: Approval Action Tracking**
- [ ] Open approval queue
- [ ] Approve one item
- [ ] Verify approval logged in `approval_actions`
- [ ] Check `time_to_decision_seconds` is reasonable
- [ ] Verify `action` = 'approve'

**Test 4: Analytics Views**
- [ ] Query `v_daily_usage_summary`
- [ ] Verify today's data appears
- [ ] Query `v_tile_usage_summary`
- [ ] Verify tile interactions counted
- [ ] Query `v_approval_queue_metrics`
- [ ] Verify approval metrics calculated

**Test 5: RLS Policies**
- [ ] Login as CEO user
- [ ] Verify can read own session data
- [ ] Verify cannot read other users' data
- [ ] Verify service_role has full access

---

## Monitoring & Alerts

### Daily Checks (Product Team)
- Run analytics queries to check data flowing
- Verify CEO sessions logged
- Check for missing data or errors

### Weekly Review (Product + Manager)
- Review analytics dashboard
- Compare actuals vs targets
- Identify trends (good and bad)
- Plan iterations based on usage

### Alerts to Set Up
- **No CEO login for 48 hours**: Email Product + Manager
- **Zero tile interactions in session**: Log warning (possible bug)
- **Session duration >20 minutes**: Log warning (UX issue?)
- **Approval queue empty for 7 days**: Check if feature working

---

## Privacy & Compliance

### Data Retention
- **Sessions**: Keep 90 days, then archive
- **Tile Interactions**: Keep 90 days, then archive
- **Approval Actions**: Keep 90 days, then archive

### PII Handling
- User email stored but not exposed in analytics views
- IP addresses stored for security, not analytics
- No sensitive approval data in `approval_data` JSONB

### Access Control
- CEO can see own data only
- Product team (service_role) can see all data
- Analytics dashboard requires admin role

---

## Next Steps

1. **Data Team**: Apply migration to staging (5 min)
2. **Engineer Team**: Instrument frontend tracking (2-3 hours)
3. **QA Team**: Validate tracking works (1 hour)
4. **Designer Team**: Design analytics dashboard (3 hours)
5. **Engineer Team**: Build analytics dashboard (3-4 hours)
6. **Product Team**: Set up monitoring and alerts (1 hour)

**Timeline**: Ready for pilot launch (Oct 15)

---

**Evidence**: 
- Migration file: `supabase/migrations/20251013223000_ceo_dashboard_usage_analytics.sql`
- Implementation guide: `docs/product/analytics_implementation_guide.md`
- Timestamp: 2025-10-13T22:35:00Z
