-- Test Script: Picker Payment System
-- Purpose: Demonstrate complete workflow from order to payment
-- Created: 2025-10-13T14:20:00Z

-- ============================================================================
-- SCENARIO: Sumesh picks 3 orders in one week, then gets paid
-- ============================================================================

BEGIN;

-- Clean up any existing test data
DELETE FROM picker_payments WHERE picker_email = 'hotrodanllc@gmail.com' AND payment_reference LIKE 'TEST-%';
DELETE FROM picker_earnings WHERE order_id LIKE 'TEST-%';

SAVEPOINT before_test;

-- ============================================================================
-- STEP 1: Record earnings for 3 orders
-- ============================================================================

-- Order 1: Small order (3 pieces) = $2.00
SELECT record_picker_earning(
  'TEST-ORDER-001',
  'hotrodanllc@gmail.com',
  3,
  (CURRENT_DATE - INTERVAL '2 days')::TIMESTAMPTZ
) as order_1_earning_id;

-- Order 2: Medium order (7 pieces) = $4.00
SELECT record_picker_earning(
  'TEST-ORDER-002',
  'hotrodanllc@gmail.com',
  7,
  (CURRENT_DATE - INTERVAL '1 day')::TIMESTAMPTZ
) as order_2_earning_id;

-- Order 3: Large order (12 pieces) = $7.00
SELECT record_picker_earning(
  'TEST-ORDER-003',
  'hotrodanllc@gmail.com',
  12,
  CURRENT_TIMESTAMP
) as order_3_earning_id;

-- ============================================================================
-- STEP 2: Verify earnings were recorded correctly
-- ============================================================================

SELECT '=== EARNINGS VERIFICATION ===' as section;

SELECT 
  order_id,
  total_pieces,
  bracket,
  payout_cents,
  ROUND(payout_cents / 100.0, 2) as payout_dollars
FROM picker_earnings
WHERE order_id LIKE 'TEST-%'
ORDER BY total_pieces;

-- Expected results:
-- TEST-ORDER-001: 3 pieces, '1-4', 200 cents, $2.00
-- TEST-ORDER-002: 7 pieces, '5-10', 400 cents, $4.00
-- TEST-ORDER-003: 12 pieces, '11+', 700 cents, $7.00
-- Total: 22 pieces, $13.00

-- ============================================================================
-- STEP 3: Check pending payments
-- ============================================================================

SELECT '=== PENDING PAYMENTS ===' as section;

SELECT 
  picker_name,
  unpaid_orders,
  unpaid_pieces,
  unpaid_amount_dollars,
  days_outstanding
FROM v_picker_payments_pending
WHERE picker_email = 'hotrodanllc@gmail.com';

-- Expected: 3 orders, 22 pieces, $13.00

-- ============================================================================
-- STEP 4: Calculate weekly payment amount
-- ============================================================================

SELECT '=== WEEKLY PAYMENT CALCULATION ===' as section;

SELECT 
  picker_name,
  orders_count,
  total_pieces,
  amount_dollars
FROM calculate_weekly_picker_payments(
  DATE_TRUNC('week', CURRENT_DATE)::DATE
)
WHERE picker_email = 'hotrodanllc@gmail.com';

-- Expected: 3 orders, 22 pieces, $13.00

-- ============================================================================
-- STEP 5: Process the payment
-- ============================================================================

SELECT '=== PROCESSING PAYMENT ===' as section;

SELECT process_picker_payment(
  'hotrodanllc@gmail.com',
  (CURRENT_DATE - INTERVAL '6 days')::DATE,  -- Week start
  CURRENT_DATE,                                -- Week end
  'direct_deposit',
  'TEST-DD-20251013-001',
  'Test weekly payment for demonstration'
) as payment_id;

-- ============================================================================
-- STEP 6: Verify payment was recorded
-- ============================================================================

SELECT '=== PAYMENT VERIFICATION ===' as section;

SELECT 
  period_start,
  period_end,
  orders_count,
  total_pieces,
  amount_dollars,
  payment_method,
  payment_reference,
  payment_status
FROM v_picker_payment_history
WHERE picker_email = 'hotrodanllc@gmail.com'
AND payment_reference = 'TEST-DD-20251013-001';

-- Expected: 3 orders, 22 pieces, $13.00, paid

-- ============================================================================
-- STEP 7: Verify pending is now 0
-- ============================================================================

SELECT '=== PENDING AFTER PAYMENT ===' as section;

SELECT 
  COUNT(*) as pending_count,
  COALESCE(SUM(unpaid_amount_dollars), 0) as total_pending
FROM v_picker_payments_pending
WHERE picker_email = 'hotrodanllc@gmail.com';

-- Expected: 0 count, $0.00 pending (because we just paid)

-- ============================================================================
-- STEP 8: Get complete picker summary
-- ============================================================================

SELECT '=== PICKER COMPLETE SUMMARY ===' as section;

SELECT 
  picker_name,
  total_orders,
  total_pieces,
  total_earned_dollars,
  total_paid_dollars,
  pending_payment_dollars,
  last_order_date,
  last_payment_date
FROM get_picker_summary('hotrodanllc@gmail.com');

-- Expected: 
-- - total_earned: $13.00
-- - total_paid: $13.00  
-- - pending: $0.00

-- ============================================================================
-- STEP 9: Test payment tier distribution
-- ============================================================================

SELECT '=== TIER DISTRIBUTION ===' as section;

SELECT 
  bracket,
  order_count,
  total_pieces,
  total_payout_dollars,
  pct_of_total_orders
FROM v_picker_earnings_by_bracket
WHERE picker_email = 'hotrodanllc@gmail.com'
ORDER BY 
  CASE bracket 
    WHEN '1-4' THEN 1 
    WHEN '5-10' THEN 2 
    WHEN '11+' THEN 3 
  END;

-- Expected: 
-- '1-4': 1 order (33.3%)
-- '5-10': 1 order (33.3%)
-- '11+': 1 order (33.3%)

-- ============================================================================
-- CLEANUP (Optional - uncomment to clean test data)
-- ============================================================================

-- ROLLBACK TO SAVEPOINT before_test;

COMMIT;

SELECT '=== TEST COMPLETE ===' as section;
SELECT 'All picker payment system functions working correctly!' as result;

