-- Rollback Script: 2025-10-25 Data Migrations
-- Description: Rollback script for DATA agent migrations created on 2025-10-25
-- Date: 2025-10-22
-- Agent: data
-- Task: DATA-020

-- =============================================================================
-- ROLLBACK SCRIPT FOR DATA MIGRATIONS
-- =============================================================================

-- WARNING: This script will remove all tables and data created by the DATA agent
-- on 2025-10-25. Use with caution and ensure you have backups.

-- =============================================================================
-- ROLLBACK 1: Dev Memory Protection (DATA-019)
-- =============================================================================

-- Drop trigger and function for decision_log protection
DROP TRIGGER IF EXISTS trigger_audit_decision_log_changes ON decision_log;
DROP FUNCTION IF EXISTS audit_decision_log_changes();

-- Drop read-only view
DROP VIEW IF EXISTS decision_log_readonly;

-- Drop safe insertion function
DROP FUNCTION IF EXISTS safe_insert_decision_log(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB);

-- Drop integrity check function
DROP FUNCTION IF EXISTS check_decision_log_integrity();

-- Drop RLS policies for decision_log
DROP POLICY IF EXISTS "decision_log_read_authenticated" ON decision_log;
DROP POLICY IF EXISTS "decision_log_insert_authenticated" ON decision_log;
DROP POLICY IF EXISTS "decision_log_update_service_role_only" ON decision_log;
DROP POLICY IF EXISTS "decision_log_delete_service_role_only" ON decision_log;
DROP POLICY IF EXISTS "decision_log_service_role_all" ON decision_log;

-- =============================================================================
-- ROLLBACK 2: Approval Queue Table (DATA-106)
-- =============================================================================

-- Remove from Realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS approval_queue;

-- Drop functions
DROP FUNCTION IF EXISTS get_approval_queue(TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS approve_request(UUID, TEXT, TEXT, INTEGER);
DROP FUNCTION IF EXISTS reject_request(UUID, TEXT, TEXT, INTEGER);
DROP FUNCTION IF EXISTS create_approval_request(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB, TEXT, JSONB, JSONB, JSONB, TEXT, TEXT, TEXT, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS get_approval_queue_stats(TEXT);

-- Drop RLS policies
DROP POLICY IF EXISTS "approval_queue_read_shop" ON approval_queue;
DROP POLICY IF EXISTS "approval_queue_insert_authenticated" ON approval_queue;
DROP POLICY IF EXISTS "approval_queue_update_own_pending" ON approval_queue;
DROP POLICY IF EXISTS "approval_queue_approve_operators" ON approval_queue;
DROP POLICY IF EXISTS "approval_queue_service_role_all" ON approval_queue;

-- Drop triggers
DROP TRIGGER IF EXISTS set_approval_queue_updated_at ON approval_queue;
DROP TRIGGER IF EXISTS set_approval_queue_last_updated ON approval_queue;

-- Drop function
DROP FUNCTION IF EXISTS update_approval_queue_last_updated();

-- Drop table
DROP TABLE IF EXISTS approval_queue CASCADE;

-- =============================================================================
-- ROLLBACK 3: Notifications Table (DATA-105)
-- =============================================================================

-- Drop functions
DROP FUNCTION IF EXISTS get_user_notifications(UUID, TEXT, INTEGER, INTEGER, BOOLEAN, TEXT, TEXT);
DROP FUNCTION IF EXISTS mark_notification_read(UUID, UUID);
DROP FUNCTION IF EXISTS mark_all_notifications_read(UUID, TEXT);
DROP FUNCTION IF EXISTS archive_notification(UUID, UUID);
DROP FUNCTION IF EXISTS create_notification(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, JSONB, JSONB, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS get_notification_counts(UUID, TEXT);

-- Drop RLS policies
DROP POLICY IF EXISTS "notifications_read_own" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_own" ON notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
DROP POLICY IF EXISTS "notifications_service_role_all" ON notifications;
DROP POLICY IF EXISTS "notifications_read_operators" ON notifications;

-- Drop triggers
DROP TRIGGER IF EXISTS set_notifications_updated_at ON notifications;

-- Drop table
DROP TABLE IF EXISTS notifications CASCADE;

-- =============================================================================
-- ROLLBACK 4: User Preferences Table (DATA-104)
-- =============================================================================

-- Drop functions
DROP FUNCTION IF EXISTS get_user_preferences(UUID, TEXT);
DROP FUNCTION IF EXISTS update_user_preferences(UUID, TEXT, JSONB);

-- Drop RLS policies
DROP POLICY IF EXISTS "user_preferences_read_own" ON user_preferences;
DROP POLICY IF EXISTS "user_preferences_insert_own" ON user_preferences;
DROP POLICY IF EXISTS "user_preferences_update_own" ON user_preferences;
DROP POLICY IF EXISTS "user_preferences_delete_own" ON user_preferences;
DROP POLICY IF EXISTS "user_preferences_service_role_all" ON user_preferences;

-- Drop triggers
DROP TRIGGER IF EXISTS set_user_preferences_updated_at ON user_preferences;

-- Drop table
DROP TABLE IF EXISTS user_preferences CASCADE;

-- =============================================================================
-- ROLLBACK 5: ALC Calculation Tables (DATA-103)
-- =============================================================================

-- Drop functions
DROP FUNCTION IF EXISTS calculate_freight_allocation(UUID, UUID);
DROP FUNCTION IF EXISTS calculate_duty_allocation(UUID, UUID);
DROP FUNCTION IF EXISTS calculate_alc(TEXT, TEXT, INTEGER, DECIMAL, DECIMAL, DECIMAL, DECIMAL);
DROP FUNCTION IF EXISTS process_receipt_and_update_alc(UUID);
DROP FUNCTION IF EXISTS sync_alc_to_shopify();

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_sync_alc_to_shopify ON product_cost_history;
DROP TRIGGER IF EXISTS set_purchase_orders_updated_at ON purchase_orders;
DROP TRIGGER IF EXISTS set_purchase_order_receipts_updated_at ON purchase_order_receipts;
DROP TRIGGER IF EXISTS set_purchase_order_line_items_updated_at ON purchase_order_line_items;

-- Drop RLS policies
DROP POLICY IF EXISTS "po_read_authenticated" ON purchase_orders;
DROP POLICY IF EXISTS "po_insert_operators" ON purchase_orders;
DROP POLICY IF EXISTS "po_update_operators" ON purchase_orders;
DROP POLICY IF EXISTS "por_read_authenticated" ON purchase_order_receipts;
DROP POLICY IF EXISTS "por_insert_operators" ON purchase_order_receipts;
DROP POLICY IF EXISTS "por_update_operators" ON purchase_order_receipts;
DROP POLICY IF EXISTS "poli_read_authenticated" ON purchase_order_line_items;
DROP POLICY IF EXISTS "poli_insert_operators" ON purchase_order_line_items;
DROP POLICY IF EXISTS "poli_update_operators" ON purchase_order_line_items;
DROP POLICY IF EXISTS "pch_read_authenticated" ON product_cost_history;
DROP POLICY IF EXISTS "pch_insert_system" ON product_cost_history;
DROP POLICY IF EXISTS "cat_read_authenticated" ON cost_audit_trail;
DROP POLICY IF EXISTS "cat_insert_system" ON cost_audit_trail;

-- Drop tables
DROP TABLE IF EXISTS cost_audit_trail CASCADE;
DROP TABLE IF EXISTS product_cost_history CASCADE;
DROP TABLE IF EXISTS purchase_order_line_items CASCADE;
DROP TABLE IF EXISTS purchase_order_receipts CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;

-- =============================================================================
-- ROLLBACK 6: Bundle BOM Tables (DATA-102)
-- =============================================================================

-- Drop functions
DROP FUNCTION IF EXISTS calculate_bundle_virtual_stock(UUID, TEXT);
DROP FUNCTION IF EXISTS run_nightly_virtual_stock_reconciliation(TEXT);

-- Drop triggers
DROP TRIGGER IF EXISTS set_bundles_updated_at ON bundles;
DROP TRIGGER IF EXISTS set_bom_components_updated_at ON bom_components;

-- Drop RLS policies
DROP POLICY IF EXISTS "bundles_read_authenticated" ON bundles;
DROP POLICY IF EXISTS "bundles_insert_operators" ON bundles;
DROP POLICY IF EXISTS "bundles_update_operators" ON bundles;
DROP POLICY IF EXISTS "bom_components_read_authenticated" ON bom_components;
DROP POLICY IF EXISTS "bom_components_insert_operators" ON bom_components;
DROP POLICY IF EXISTS "bom_components_update_operators" ON bom_components;
DROP POLICY IF EXISTS "vsc_read_authenticated" ON virtual_stock_calculations;
DROP POLICY IF EXISTS "vsc_insert_system" ON virtual_stock_calculations;
DROP POLICY IF EXISTS "reconciliation_jobs_read_operators" ON reconciliation_jobs;
DROP POLICY IF EXISTS "reconciliation_jobs_insert_system" ON reconciliation_jobs;

-- Drop tables
DROP TABLE IF EXISTS reconciliation_jobs CASCADE;
DROP TABLE IF EXISTS virtual_stock_calculations CASCADE;
DROP TABLE IF EXISTS bom_components CASCADE;
DROP TABLE IF EXISTS bundles CASCADE;

-- =============================================================================
-- ROLLBACK 7: Growth Engine Data Architecture (DATA-109)
-- =============================================================================

-- Drop functions
DROP FUNCTION IF EXISTS is_mcp_evidence_required(TEXT, TEXT);
DROP FUNCTION IF EXISTS is_heartbeat_required(TEXT, INTEGER);
DROP FUNCTION IF EXISTS validate_mcp_evidence(TEXT, TEXT);
DROP FUNCTION IF EXISTS check_heartbeat_staleness(TEXT, TEXT);

-- Drop RLS policies
DROP POLICY IF EXISTS "ge_phases_read_authenticated" ON growth_engine_phases;
DROP POLICY IF EXISTS "ge_phases_manage_operators" ON growth_engine_phases;
DROP POLICY IF EXISTS "mcp_evidence_read_authenticated" ON mcp_evidence_logs;
DROP POLICY IF EXISTS "mcp_evidence_insert_agents" ON mcp_evidence_logs;
DROP POLICY IF EXISTS "heartbeat_read_authenticated" ON agent_heartbeat_logs;
DROP POLICY IF EXISTS "heartbeat_insert_agents" ON agent_heartbeat_logs;
DROP POLICY IF EXISTS "ban_violations_read_operators" ON dev_mcp_ban_violations;
DROP POLICY IF EXISTS "ban_violations_insert_system" ON dev_mcp_ban_violations;
DROP POLICY IF EXISTS "metrics_read_authenticated" ON growth_engine_metrics;
DROP POLICY IF EXISTS "metrics_insert_system" ON growth_engine_metrics;
DROP POLICY IF EXISTS "guard_results_read_authenticated" ON ci_guard_results;
DROP POLICY IF EXISTS "guard_results_insert_system" ON ci_guard_results;

-- Drop tables
DROP TABLE IF EXISTS ci_guard_results CASCADE;
DROP TABLE IF EXISTS growth_engine_metrics CASCADE;
DROP TABLE IF EXISTS dev_mcp_ban_violations CASCADE;
DROP TABLE IF EXISTS agent_heartbeat_logs CASCADE;
DROP TABLE IF EXISTS mcp_evidence_logs CASCADE;
DROP TABLE IF EXISTS growth_engine_phases CASCADE;

-- =============================================================================
-- ROLLBACK 8: Vendor Master Tables (DATA-101)
-- =============================================================================

-- Drop triggers
DROP TRIGGER IF EXISTS set_vendors_updated_at ON vendors;
DROP TRIGGER IF EXISTS set_vendor_skus_updated_at ON vendor_skus;

-- Drop RLS policies
DROP POLICY IF EXISTS "vendors_read_authenticated" ON vendors;
DROP POLICY IF EXISTS "vendors_insert_operators" ON vendors;
DROP POLICY IF EXISTS "vendors_update_operators" ON vendors;
DROP POLICY IF EXISTS "vendor_skus_read_authenticated" ON vendor_skus;
DROP POLICY IF EXISTS "vendor_skus_insert_operators" ON vendor_skus;
DROP POLICY IF EXISTS "vendor_skus_update_operators" ON vendor_skus;

-- Drop tables
DROP TABLE IF EXISTS vendor_skus CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;

-- =============================================================================
-- ROLLBACK COMPLETE
-- =============================================================================

-- This rollback script removes all tables, functions, triggers, and policies
-- created by the DATA agent on 2025-10-25. The database will be returned to
-- its state before these migrations were applied.

-- WARNING: This will permanently delete all data in these tables.
-- Make sure you have backups before running this script.
