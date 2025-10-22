# Picker Payout Integration with Approvals Flow

**Status**: Draft - Awaiting Manager Review  
**Owner**: Inventory Agent  
**Date**: 2025-10-20  
**Related**: docs/specs/approvals_drawer_spec.md

## Overview

This document specifies how picker payout calculations integrate with the Approvals Drawer for HITL review before payment processing.

## Background

Pickers are compensated based on the number of pieces they pick per order:

- 1-4 pieces: $2.00
- 5-10 pieces: $4.00
- 11+ pieces: $7.00

Piece counts are calculated from:

- Product PACK:X tags (e.g., PACK:6 = 6 pieces per item)
- Order quantities
- Default: 1 piece per item if no PACK tag

## Integration Points

### 1. Order Fulfillment Trigger

When an order is fulfilled in Shopify:

1. Order fulfillment webhook triggers payout calculation
2. System calculates total pieces using `calculatePickerPayout()` service
3. Payout suggestion is created with provenance metadata
4. Approval queue entry is created for operations review

### 2. Approval Queue Entry

Each payout suggestion appears in Approvals Drawer with:

**Evidence Section**:

- Order ID and fulfillment date
- Picker ID (from fulfillment assignment)
- Item-by-item breakdown showing:
  - Product name
  - Quantity ordered
  - Pack size (from PACK:X tag)
  - Pieces calculated
- Total pieces
- Payout bracket applied
- Calculated payout amount

**Suggested Action**:

- Approve payout for $X.XX
- Action: "APPROVE_PAYOUT"

**Rollback Plan**:

- If rejected: No payment processed
- If approved: Record in payout_ledger table
- Reversal: Mark payout as "reversed" with audit trail

### 3. Approval Workflow

```
Order Fulfilled
    ↓
Calculate Payout (system)
    ↓
Create Approval Entry (status: pending)
    ↓
Operations Reviews in Approvals Drawer
    ↓
[Approve] → Process Payment → Mark Complete
    ↓           ↓
[Reject]  → Add Note → Archive
    ↓
[Edit] → Adjust Amount → Resubmit for Review
```

### 4. Data Model

**payout_approvals table** (new):

```sql
CREATE TABLE payout_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  picker_id TEXT NOT NULL,
  picker_name TEXT,
  fulfillment_date TIMESTAMPTZ NOT NULL,
  total_pieces INTEGER NOT NULL,
  payout_bracket TEXT NOT NULL, -- '1-4', '5-10', '11+'
  calculated_amount NUMERIC(10,2) NOT NULL,
  approved_amount NUMERIC(10,2), -- May differ if adjusted
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  item_breakdown JSONB NOT NULL, -- Detailed piece calculation
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  project TEXT NOT NULL DEFAULT 'occ'
);
```

### 5. Service Integration

**Inventory Service** (`app/services/inventory/payout.ts`):

- Provides `calculatePickerPayout()` function
- Exports types: `PayoutItem`, `PayoutResult`
- Handles PACK:X tag extraction
- Calculates payout brackets

**Approval Service** (`app/services/approvals/`) (Support Agent):

- Creates payout approval entries
- Manages approval workflow
- Processes approved payouts
- Handles rejections and edits

### 6. UI Integration

**Approvals Drawer** (`app/components/approvals/`) (Support Agent):

- Display payout approval cards
- Show piece calculation breakdown
- Allow amount adjustments with reason
- Enable approve/reject/edit actions

**Payout Dashboard** (future):

- View all payouts (pending, approved, paid)
- Filter by picker, date range, status
- Export payout reports to CSV

## Coordination Requirements

### For Support Agent

**Tasks**:

1. Create `payout_approvals` table migration
2. Implement payout approval UI in Approvals Drawer
3. Add payout approval service methods:
   - `createPayoutApproval(orderID, pickerID, items)`
   - `reviewPayoutApproval(approvalID, action, amount?, notes?)`
   - `getPayoutApprovals(filters)`
4. Hook into Shopify fulfillment webhook
5. Integrate with payment processing (future)

**Dependencies**:

- ✅ Payout calculation service (inventory)
- ✅ PACK:X tag parsing (inventory)
- ⏳ Approvals Drawer UI (support)
- ⏳ Fulfillment webhook handler (integrations)

### For Integrations Agent

**Tasks**:

1. Set up Shopify fulfillment webhook
2. Extract picker assignment from fulfillment data
3. Trigger payout calculation on fulfillment
4. Create approval queue entry

### For Manager

**Review Points**:

- Approve payout approval table schema
- Review approval workflow (HITL required?)
- Confirm payment processing integration plan
- Set approval policies (auto-approve under $X?)

## Testing Requirements

**Unit Tests** (Inventory - ✅ Complete):

- Payout calculation logic
- PACK:X tag parsing
- Bracket determination

**Integration Tests** (Support - ⏳ Pending):

- Approval creation from fulfillment
- Approval workflow (approve/reject/edit)
- Amount adjustment validation
- Audit trail logging

**E2E Tests** (QA - ⏳ Pending):

- Fulfill order → approve payout → verify ledger
- Reject payout → verify no payment
- Edit payout amount → reapprove → verify updated amount

## Rollback Plan

**If payout integration causes issues**:

1. **Disable webhook**:

   ```bash
   # Pause Shopify fulfillment webhook
   shopify webhook delete --topic=FULFILLMENTS_CREATE
   ```

2. **Revert database**:

   ```sql
   -- Mark all pending payouts as archived
   UPDATE payout_approvals
   SET status = 'archived', notes = 'System rollback'
   WHERE status = 'pending';
   ```

3. **Manual processing**:
   - Export pending payouts to CSV
   - Process manually via spreadsheet
   - Re-enable automation when fixed

## Security Considerations

- ✅ RLS on `payout_approvals` table (project isolation)
- ✅ HITL required for all payouts (no auto-approve initially)
- ✅ Audit trail in `inventory_events`
- ⏳ Payment processing requires service_role privileges
- ⏳ Picker data privacy (PII protection)

## Next Steps

1. **Manager Review**: Approve spec and schema
2. **Support Agent**: Implement approval UI and service
3. **Integrations Agent**: Set up fulfillment webhook
4. **QA Agent**: Write integration and E2E tests
5. **DevOps**: Deploy migrations and enable webhook
6. **Pilot**: Test with 10 orders, validate payouts
7. **Launch**: Enable for all orders

## Questions for Support Agent

1. Is Approvals Drawer ready for new approval types?
2. Should payout approvals have different permission requirements?
3. What's the expected review turnaround time (same-day, weekly batch)?
4. Should we support bulk approve for multiple payouts?
5. How to handle picker disputes/adjustments?

## Contact

- **Inventory Agent**: feedback/inventory/2025-10-20.md
- **Support Agent**: feedback/support/YYYY-MM-DD.md
- **Manager**: feedback/manager/YYYY-MM-DD.md
