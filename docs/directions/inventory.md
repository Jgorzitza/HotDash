# Inventory - ROP Calculations + Picker Payouts

> Reorder points accurate. Picker payouts 100%. Stockout prevention. Kits/bundles.

**Issue**: #112 | **Repository**: Jgorzitza/HotDash | **Allowed Paths**: app/lib/inventory/**, app/services/inventory/**, tests/unit/inventory/\*\*

## Constraints

- MCP Tools: MANDATORY for discovery/grounding
  - `mcp_shopify_*` for inventory queries
  - `mcp_context7_get-library-docs` for React Router 7 patterns (library: `/remix-run/react-router`)
- Framework: React Router 7 (NOT Remix) - use loaders for server-side data
- Calculations: ROP = (daily sales × lead time) + safety stock
- Picker accuracy: 100% payout calculation correctness
- Kits/bundles: Flag with BUNDLE:TRUE in metadata
- Feature flag: INVENTORY_LIVE controls Shopify writes

## Definition of Done

- [ ] ROP calculations tested and accurate
- [ ] Picker payout calculations 100% correct
- [ ] Stock risk tile showing critical items
- [ ] Kits/bundles handled correctly
- [ ] All tests passing (calculations verified)
- [ ] Evidence: ROP working, payouts accurate

## Production Molecules

### INV-001: ROP Calculation Engine (40 min)

**File**: app/services/inventory/calculations.ts
**Formula**: ROP = (avg_daily_sales × lead_time_days) + safety_stock
**Test**: Various scenarios, zero-guards
**Evidence**: Calculations tested (Manager confirmed tests exist)

### INV-002: Shopify Inventory Sync (35 min)

**File**: app/lib/inventory/shopify-sync.ts
**MCP**: `mcp_shopify_introspect_graphql_schema` for inventory queries
**Query**: InventoryLevels, available quantity
**Evidence**: Live inventory data synced

### INV-003: Stock Risk Classification (30 min)

**File**: app/lib/inventory/risk-classifier.ts
**Categories**:

- Critical: <7 days stock
- Warning: <14 days
- OK: >14 days
  **Evidence**: Products classified correctly

### INV-004: Stock Risk Dashboard Tile (30 min)

**File**: app/components/dashboard/StockRiskTile.tsx
**Display**: Top 5 critical items, days until stockout
**Evidence**: Tile rendering with real data

### INV-005: Picker Payout Calculations (40 min)

**File**: app/lib/inventory/picker-payouts.ts
**Formula**: Based on items picked, accuracy rate, speed bonuses
**Requirement**: 100% accuracy (financial)
**Test**: Extensive unit tests
**Evidence**: Calculations verified

### INV-006: Kit/Bundle Detection (25 min)

**File**: app/lib/inventory/bundle-detector.ts
**Detect**: BUNDLE:TRUE in product metadata
**Calculate**: Component inventory levels
**Evidence**: Bundles detected and tracked

### INV-007: Reorder Point Alerts (30 min)

**File**: app/lib/inventory/reorder-alerts.ts
**Alert**: When inventory below ROP
**Create**: Approval for PO generation
**Evidence**: Alerts generating correctly

### INV-008: Purchase Order Generator (35 min)

**File**: app/lib/inventory/po-generator.ts
**Generate**: PO based on ROP triggers
**HITL**: Requires approval before sending
**Evidence**: POs generated for review

### INV-009: Inventory Turnover Analysis (30 min)

**File**: app/lib/inventory/turnover.ts
**Calculate**: Sales velocity, days on hand
**Report**: Slow movers, fast movers
**Evidence**: Analysis accurate

### INV-010: Safety Stock Recommendations (30 min)

**File**: app/lib/inventory/safety-stock.ts
**Algorithm**: Based on demand variability
**Adjust**: Dynamically per product
**Evidence**: Recommendations reasonable

### INV-011: Supplier Lead Time Tracking (25 min)

**File**: app/lib/inventory/lead-times.ts
**Track**: Historical lead times per supplier
**Update**: ROP calculations with actual data
**Evidence**: Lead times tracked

### INV-012: Contract Tests - Shopify Inventory (20 min)

**File**: tests/unit/contracts/shopify.inventory.contract.test.ts
**Verify**: Inventory API shapes
**Evidence**: Contracts passing

### INV-013: Documentation (20 min)

**Files**: docs/specs/inventory_pipeline.md, docs/specs/picker_payouts.md
**Update**: ROP formulas, payout calculations
**Evidence**: Docs accurate

### INV-014: Performance Monitoring (20 min)

**Monitor**: Calculation times, sync frequency
**Alert**: If tile load >3s
**Evidence**: Monitoring active

### INV-015: WORK COMPLETE Block (10 min)

**Update**: feedback/inventory/2025-10-19.md
**Include**: ROP accurate, payouts 100%, bundles handled
**Evidence**: Feedback entry

## Foreground Proof

1. calculations.ts ROP engine
2. shopify-sync.ts integration
3. risk-classifier.ts logic
4. StockRiskTile.tsx component
5. picker-payouts.ts calculations
6. bundle-detector.ts logic
7. reorder-alerts.ts alerts
8. po-generator.ts with HITL
9. turnover.ts analysis
10. safety-stock.ts recommendations
11. lead-times.ts tracking
12. Shopify contract tests
13. Documentation updated
14. Performance monitoring
15. WORK COMPLETE feedback

**TOTAL ESTIMATE**: ~6 hours
**SUCCESS**: Stockouts prevented, picker payouts 100% accurate, bundles handled
