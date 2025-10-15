#\!/bin/bash

# AI Customer - OpenAI SDK Setup
gh issue create --title "AI Customer: Initialize OpenAI Agents SDK with HITL" \
  --body "**Agent:** ai-customer
**Priority:** P0
**Deadline:** 2025-10-17

## Definition of Done
- [ ] OpenAI Agents SDK initialized (TypeScript)
- [ ] HITL interruption handling working
- [ ] Config structure in app/agents/config/
- [ ] Tests for SDK initialization

## Allowed paths: app/agents/sdk/*, app/agents/config/*
## Branch: agent/ai-customer/openai-sdk-foundation
## Credentials: source vault/occ/openai/api_key_staging.env" \
  --label "task,P0,enhancement"

# AI Customer - Customer Support Agent
gh issue create --title "AI Customer: Build Customer Support Agent" \
  --body "**Agent:** ai-customer
**Priority:** P0
**Deadline:** 2025-10-17

## Definition of Done
- [ ] Customer support agent implemented with OpenAI SDK
- [ ] Drafts Chatwoot replies
- [ ] HITL approval required
- [ ] Grading captured (tone/accuracy/policy)
- [ ] Tests pass

## Allowed paths: app/agents/customer/*, app/agents/tools/*
## Branch: agent/ai-customer/openai-sdk-foundation" \
  --label "task,P0,enhancement"

# AI Customer - CEO Assistant Agent
gh issue create --title "AI Customer: Build CEO Assistant Agent" \
  --body "**Agent:** ai-customer
**Priority:** P0
**Deadline:** 2025-10-17

## Definition of Done
- [ ] CEO assistant agent implemented with OpenAI SDK
- [ ] Provides inventory/growth insights
- [ ] HITL approval for actions
- [ ] Calls Shopify/Supabase tools
- [ ] Tests pass

## Allowed paths: app/agents/ceo/*, app/agents/tools/*
## Branch: agent/ai-customer/openai-sdk-foundation" \
  --label "task,P0,enhancement"

# DevOps - CI Health
gh issue create --title "DevOps: Fix Feedback Cadence CI Failures" \
  --body "**Agent:** devops
**Priority:** P0
**Deadline:** 2025-10-17

## Definition of Done
- [ ] Feedback Cadence workflow investigated
- [ ] Root cause identified
- [ ] Fix implemented or workflow disabled
- [ ] CI green on main

## Allowed paths: .github/workflows/*, scripts/policy/*
## Branch: agent/devops/ci-staging-setup" \
  --label "task,P0,enhancement"

# DevOps - Staging Deployment
gh issue create --title "DevOps: Setup Fly.io Staging Environment" \
  --body "**Agent:** devops
**Priority:** P0
**Deadline:** 2025-10-17

## Definition of Done
- [ ] Fly.io staging app created
- [ ] Deployment workflow configured
- [ ] Secrets configured via Fly secrets
- [ ] Rollback procedure tested
- [ ] Documentation complete

## Allowed paths: fly.toml, .github/workflows/deploy-staging.yml
## Branch: agent/devops/ci-staging-setup" \
  --label "task,P0,enhancement"

# Data - Approvals Schema
gh issue create --title "Data: Design Approvals Schema with RLS" \
  --body "**Agent:** data
**Priority:** P0
**Deadline:** 2025-10-17

## Definition of Done
- [ ] Approvals, grades, edits tables designed
- [ ] RLS policies implemented
- [ ] Migration with up/down tested
- [ ] Schema documented in docs/specs/

## Allowed paths: supabase/migrations/*, docs/specs/approvals_schema.md
## Branch: agent/data/schema-foundation
## Credentials: source vault/occ/supabase/*.env" \
  --label "task,P0,enhancement"

# Data - Audit Schema
gh issue create --title "Data: Design Audit Log Schema" \
  --body "**Agent:** data
**Priority:** P0
**Deadline:** 2025-10-17

## Definition of Done
- [ ] Audit log table designed
- [ ] Immutable constraints added
- [ ] RLS policies implemented
- [ ] Migration with up/down tested
- [ ] Schema documented

## Allowed paths: supabase/migrations/*, docs/specs/audit_schema.md
## Branch: agent/data/schema-foundation" \
  --label "task,P0,enhancement"

# QA - Acceptance Criteria
gh issue create --title "QA: Define Acceptance Criteria for Foundation Issues" \
  --body "**Agent:** qa
**Priority:** P1
**Deadline:** 2025-10-17

## Definition of Done
- [ ] All foundation Issues have clear acceptance criteria
- [ ] Criteria are testable
- [ ] Evidence requirements defined
- [ ] DoD checklists complete

## Allowed paths: .github/ISSUE_TEMPLATE/*, docs/specs/*
## Branch: agent/qa/quality-gates" \
  --label "task,P1,enhancement"

# QA - Test Plan Template
gh issue create --title "QA: Create Test Plan Template" \
  --body "**Agent:** qa
**Priority:** P1
**Deadline:** 2025-10-17

## Definition of Done
- [ ] Test plan template created
- [ ] Includes test types, evidence requirements, DoD
- [ ] Examples provided
- [ ] Template documented

## Allowed paths: docs/specs/test_plan_template.md
## Branch: agent/qa/quality-gates" \
  --label "task,P1,enhancement"

# Inventory - Data Model
gh issue create --title "Inventory: Create Inventory Data Model Spec" \
  --body "**Agent:** inventory
**Priority:** P1
**Deadline:** 2025-10-17

## Definition of Done
- [ ] ROP formula documented
- [ ] Kit/bundle structure defined
- [ ] Picker payout logic specified
- [ ] Spec complete in docs/specs/

## Allowed paths: docs/specs/inventory_model.md
## Branch: agent/inventory/data-model-prep" \
  --label "task,P1,enhancement"

# Inventory - Metafields
gh issue create --title "Inventory: Research Shopify Inventory Metafields" \
  --body "**Agent:** inventory
**Priority:** P1
**Deadline:** 2025-10-17

## Definition of Done
- [ ] BUNDLE:TRUE metafield documented
- [ ] PACK:X metafield documented
- [ ] Lead time metafield documented
- [ ] Safety stock metafield documented
- [ ] Spec complete

## Allowed paths: docs/specs/shopify_inventory_metafields.md
## Branch: agent/inventory/data-model-prep" \
  --label "task,P1,enhancement"

# Designer - Dashboard Tiles
gh issue create --title "Designer: Create Dashboard Tiles Design Spec" \
  --body "**Agent:** designer
**Priority:** P1
**Deadline:** 2025-10-17

## Definition of Done
- [ ] Tile types documented
- [ ] Loading states designed
- [ ] Error states designed
- [ ] Responsive behavior specified
- [ ] Polaris compliance verified

## Allowed paths: docs/specs/dashboard_tiles_design.md
## Branch: agent/designer/foundation-specs" \
  --label "task,P1,enhancement"

# Designer - Approvals UX
gh issue create --title "Designer: Document Approvals Drawer UX Flow" \
  --body "**Agent:** designer
**Priority:** P1
**Deadline:** 2025-10-17

## Definition of Done
- [ ] UX flow diagram created
- [ ] State transitions documented
- [ ] Grading interface designed
- [ ] Accessibility notes included
- [ ] WCAG 2.1 AA compliance verified

## Allowed paths: docs/specs/approvals_drawer_ux.md
## Branch: agent/designer/foundation-specs" \
  --label "task,P1,enhancement"

# Product - Foundation PRD
gh issue create --title "Product: Write Foundation Milestone PRD" \
  --body "**Agent:** product
**Priority:** P2
**Deadline:** 2025-10-17

## Definition of Done
- [ ] User stories written
- [ ] Success metrics defined
- [ ] Acceptance criteria documented
- [ ] PRD complete

## Allowed paths: docs/specs/foundation_milestone_prd.md
## Branch: agent/product/foundation-prd" \
  --label "task,P2,enhancement"

# Product - Feature Prioritization
gh issue create --title "Product: Create Feature Prioritization Matrix" \
  --body "**Agent:** product
**Priority:** P2
**Deadline:** 2025-10-17

## Definition of Done
- [ ] Impact/effort scores for M0-M6 features
- [ ] Dependencies identified
- [ ] Milestone assignments complete
- [ ] Matrix documented

## Allowed paths: docs/specs/feature_prioritization.md
## Branch: agent/product/foundation-prd" \
  --label "task,P2,enhancement"

