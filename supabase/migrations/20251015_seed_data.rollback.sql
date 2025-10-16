-- Rollback: Seed Data
-- Date: 2025-10-15
-- WARNING: This removes all seed data

-- Delete seed data (in reverse order of dependencies)
DELETE FROM audit_logs WHERE actor IN ('justin@hotrodan.com', 'system') AND created_at >= CURRENT_DATE - 7;
DELETE FROM growth_metrics_daily WHERE metric_date >= CURRENT_DATE - 7;
DELETE FROM cx_metrics_daily WHERE metric_date >= CURRENT_DATE - 7;
DELETE FROM picker_payouts WHERE picker_email IN ('john@example.com', 'jane@example.com');
DELETE FROM approval_grades WHERE reviewer = 'justin@hotrodan.com';
DELETE FROM approvals WHERE created_by IN ('ai-customer', 'ai-inventory', 'ai-growth') AND created_at >= CURRENT_DATE - 7;

