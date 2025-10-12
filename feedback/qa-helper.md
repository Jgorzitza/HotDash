---
epoch: 2025.10.E1
agent: qa-helper
started: 2025-10-12
---

# QA Helper — Comprehensive MCP-Driven Audit

## 🚨 CRITICAL SECURITY FINDINGS - 2025-10-12T09:20:00Z

### **SECURITY ISSUE #1: Row Level Security (RLS) Disabled on 86+ Tables** ⚠️ CRITICAL
**Status**: 🔴 CRITICAL - Production Security Risk
**MCP Tool**: Supabase Advisor (Security)

**Tables Without RLS** (86 found, sample):
- `notifications`, `platform_apps`, `portals`, `reporting_events`, `sla_events`, `sla_policies`
- `taggings`, `tags`, `teams`, `users`, `webhooks`, `conversations`, `contacts`
- `messages`, `access_tokens`, `accounts`, `agent_bots`, `attachments`, `audits`
- `automation_rules`, `campaigns`, `categories`, `inboxes`, `macros`, `notes`
- `decision_sync_event_logs`, `inventory_snapshots`, `fulfillment_tracking`, `cx_conversations`

**Risk**: Tables exposed to PostgREST without RLS = anyone can access data
**Remediation**: https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public
**Action Required**: Enable RLS on all public tables OR move to protected schema

---

### **SECURITY ISSUE #2: 54 Views with SECURITY DEFINER** ⚠️ HIGH
**Status**: 🟠 HIGH - Security Best Practice Violation
**MCP Tool**: Supabase Advisor (Security)

**Affected Views** (54 found, sample):
- `v_stockout_prediction`, `v_export_daily_performance`, `v_data_freshness`
- `v_audit_quality_checks`, `v_data_quality_checks`, `v_category_profitability`
- `v_customer_cohorts`, `v_churn_prediction`, `v_revenue_trends_30d`
- `v_operator_workload`, `v_operator_rankings`, `v_growth_rates`
- `v_time_to_value_roi`, `v_operator_sla_compliance`, `v_anomaly_detection_multi`

**Risk**: Views execute with creator permissions, bypassing RLS policies
**Remediation**: https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view
**Action Required**: Review each view, remove SECURITY DEFINER or add explicit RLS checks

---

### **SECURITY ISSUE #3: 10 Functions with Mutable search_path** ⚠️ WARN
**Status**: 🟡 WARN - Potential Privilege Escalation

**Affected Functions**:
- `campaigns_before_insert_row_tr`, `export_data_batch`, `conversations_before_insert_row_tr`
- `run_data_quality_checks`, `camp_dpid_before_insert`, `get_shop_audit_trail`
- `export_audit_logs`, `accounts_after_insert_row_tr`, `export_analytics_full`
- `archive_old_audit_logs`

**Risk**: Functions without fixed search_path can be exploited for privilege escalation
**Remediation**: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
**Action Required**: Set `search_path` parameter on all functions

---

### **SECURITY ISSUE #4: pg_trgm Extension in Public Schema** ⚠️ WARN
**Status**: 🟡 WARN - Security Best Practice

**Extension**: `pg_trgm` installed in public schema
**Remediation**: https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public
**Action Required**: Move extension to dedicated schema

---

## ⚡ CRITICAL PERFORMANCE FINDINGS

### **PERFORMANCE ISSUE #1: RLS Policies Re-evaluating auth() Functions** ⚠️ HIGH
**Status**: 🟠 HIGH - Query Performance Degradation at Scale
**MCP Tool**: Supabase Advisor (Performance)

**Affected Tables** (13 found):
- `product_categories`, `customer_segments`, `sales_metrics_daily`, `sku_performance`
- `inventory_snapshots`, `fulfillment_tracking`, `cx_conversations`, `shop_activation_metrics`
- `operator_sla_resolution`, `ceo_time_savings`, `notification_settings`, `notification_subscriptions`
- `Session`

**Issue**: RLS policies call `auth.uid()` or `current_setting()` for EACH ROW instead of once
**Performance Impact**: Queries slow down exponentially with row count
**Fix**: Replace `auth.uid()` with `(select auth.uid())`
**Remediation**: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

---

### **PERFORMANCE ISSUE #2: 180+ Unused Indexes** ⚠️ MEDIUM
**Status**: 🟡 MEDIUM - Wasted Storage & Write Performance

**Impact**: 
- Wasted disk space
- Slower INSERT/UPDATE/DELETE operations
- No benefit (indexes never used)

**Sample Unused Indexes**:
- `messages_embedding_idx`, `orders_processed_at_idx`, `orders_shop_placed_idx`
- `events_unprocessed_idx`, `conversations_shop_status_idx`, `DashboardFact_shopDomain_factType_idx`
- `DecisionLog_scope_createdAt_idx`, `reporting_events__account_id__name__created_at`
- 170+ more...

**Remediation**: https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index
**Action Required**: Drop unused indexes to improve write performance

---

### **PERFORMANCE ISSUE #3: Multiple Permissive RLS Policies** ⚠️ WARN
**Status**: 🟡 WARN - Suboptimal Query Performance

**Affected Tables** (130+ instances across 12 tables):
- `ceo_time_savings`: 9 roles × 2 policies each = 18 duplicates
- `customer_segments`: 9 roles × 2 policies each = 18 duplicates
- `cx_conversations`: 9 roles × 2 policies each = 18 duplicates
- `fulfillment_tracking`, `inventory_snapshots`, `notification_settings`, `notification_subscriptions`
- `operator_sla_resolution`, `product_categories`, `sales_metrics_daily`, `shop_activation_metrics`
- `sku_performance`

**Issue**: Multiple permissive policies for same role+action means each policy executes
**Performance Impact**: Queries execute N policies per row
**Remediation**: https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies
**Action Required**: Consolidate policies into single permissive policy per role+action

---

### **PERFORMANCE ISSUE #4: Table Without Primary Key** ⚠️ INFO
**Status**: 🔵 INFO - Suboptimal Table Design

**Table**: `portals_members`
**Impact**: Inefficient table operations at scale
**Remediation**: https://supabase.com/docs/guides/database/database-linter?lint=0004_no_primary_key
**Action Required**: Add primary key to table

---

## 📊 COMPREHENSIVE AUDIT SUMMARY

**MCP Tools Used**:
✅ Supabase Security Advisor
✅ Supabase Performance Advisor
✅ Shopify Admin API (conversation ID: 6853b54d-efe0-4c7a-9504-aa51eeffc4fe)

**Critical Issues Found**: 4 security + 4 performance = **8 critical issues**

**Security Score**: 🔴 **NEEDS IMMEDIATE ATTENTION**
- 86+ tables without RLS
- 54 SECURITY DEFINER views
- 10 functions with privilege escalation risk

**Performance Score**: 🟡 **MODERATE - Optimization Needed**
- 13 tables with suboptimal RLS
- 180+ unused indexes
- 130+ duplicate policies

---

## 🎯 NEXT STEPS - CONTINUING COMPREHENSIVE AUDIT

**Completed**:
✅ Supabase security audit (MCP)
✅ Supabase performance audit (MCP)

**In Progress**:
⏳ Shopify GraphQL pattern audit
⏳ React component patterns audit
⏳ Code duplication scan
⏳ TypeScript type safety audit
⏳ Environment variable security scan

**Status**: Comprehensive MCP-driven audit in progress...

---

_Audit initiated: 2025-10-12T09:15:00Z_
_Using MCP tools exclusively per direction_
