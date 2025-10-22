# Content Direction v7.0 — Growth Engine Integration

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T17:15Z  
**Version**: 7.0  
**Status**: ACTIVE — Phase 11 CX Theme Implementation (Growth Engine)

## ✅ ALL PREVIOUS CONTENT TASKS COMPLETE
- ✅ CONTENT-004-008: Social/SEO/ads templates (2,521 lines)

## 🔄 CROSS-FUNCTIONAL SUPPORT WORK (4 hours) — START NOW

**Strategic Deployment**: Support Engineer and Product with UX copy

### CONTENT-020: PII Card UX Copy (2h) — P1

**Objective**: Help Engineer (ENG-029, ENG-030) by writing user-facing copy for PII Card component

**Owner**: Content (UX writing expert)  
**Beneficiary**: Engineer

**Deliverables**:
1. **PII Card Labels & Tooltips** (`docs/content/pii-card-ux-copy.md`):
   - Section headers ("Customer Details", "Order Information", "Shipping Status")
   - Field labels with clarity ("Last 4 Order ID", "Masked Email", "Tracking Status")
   - Tooltips explaining why data is masked ("Full email visible to operator only")
   - Help text for operators ("This information is NOT sent to customer")

2. **CX Escalation Modal Copy**:
   - Modal title and description
   - "Public Reply" section header + help text
   - "Operator-Only Details" section header + help text
   - Button labels ("Send Reply", "Save Draft", "Cancel")
   - Confirmation messages

**Dependencies**: Engineer completes ENG-029/ENG-030

**Acceptance**: ✅ UX copy complete (200+ lines), ✅ Engineer can integrate

---

### CONTENT-021: Vendor Management Help Text (1h) — P2

**Objective**: Help Product (PRODUCT-016) by writing help text for vendor management UI

**Owner**: Content  
**Beneficiary**: Product + Engineer

**Deliverables**:
- **Vendor UI Copy** (`docs/content/vendor-management-copy.md`):
  - Field labels and placeholders
  - Tooltip help text ("Reliability score = on-time deliveries / total deliveries")
  - Empty state messages ("No vendors yet. Add your first supplier to get started.")
  - Validation error messages ("Lead time must be between 1-365 days")
  - Success/confirmation messages

**Dependencies**: Product completes PRODUCT-016 UI spec

**Acceptance**: ✅ Help text created, ✅ Clear operator guidance

---

### CONTENT-022: CI Guards Documentation Copy (1h) — P2

**Objective**: Help Support (SUPPORT-010) by polishing CI Guards runbook copy

**Owner**: Content  
**Beneficiary**: Support + DevOps

**Deliverables**:
- **Runbook Copy Review** (`artifacts/content/2025-10-21/ci-guards-copy-review.md`):
  - Review Support's runbook draft
  - Improve clarity, consistency, tone
  - Add examples and code snippets
  - Ensure actionable instructions

**Dependencies**: Support completes SUPPORT-010 runbook

**Acceptance**: ✅ Copy review complete, ✅ Support can refine runbook

---

## 🚀 PHASE 11: CX Theme Implementation (6h) — P2 PRIORITY

**⏸️ BLOCKED**: Waiting for Product (PRODUCT-015) CX theme Action cards

### CONTENT-019: Implement CX Theme Content (6h)

**Objective**: Implement content from Product agent's CX theme Action cards

**Work**: Size charts, installation guides, dimensions, warranty sections

**MCP Required**: Shopify Dev MCP → productUpdate mutations

**Acceptance**: ✅ Content implemented, ✅ Tests passing

---

##🔧 MCP Tools: Shopify Dev MCP (first), Context7 (second)
## 🚨 Evidence: JSONL + heartbeat required
