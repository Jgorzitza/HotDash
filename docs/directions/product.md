# Product Direction v7.0 — Growth Engine Integration

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T16:55Z  
**Version**: 7.0  
**Status**: ACTIVE — Phase 12 CX Theme Task Generation (Growth Engine)

---

## ✅ ALL PREVIOUS PRODUCT TASKS COMPLETE

**Completed** (from feedback/product/2025-10-21.md):
- ✅ PRODUCT-005-008: Onboarding spec, feature prioritization, A/B test designs, feedback analysis (2,730+ lines)
- ✅ PRODUCT-009: A/B testing service (variant assignment, tracking, statistical significance)
- ✅ PRODUCT-010: Feature flag management (enable/disable, gradual rollout)
- ✅ PRODUCT-011: Product analytics service (feature usage, top features)
- ✅ PRODUCT-012: User segmentation (4 segments, engagement scoring)
- ✅ PRODUCT-013: Product metrics dashboard (DAU/MAU, health score)

**Total Output**: 4 specs + 5 services, all tests passing, committed

**Key Finding**: CEO Agent priority #1 (saves 10-15h/week)

---

## 🎯 NEW: Growth Engine Architecture (Effective 2025-10-21)

**Context**: Growth Engine Final Pack integrated into project (commit: 546bd0e)

### Production Agent Model
- **Specialist Agents**: Run in background to keep data fresh
- **CX → Product Loop**: AI-Knowledge mines themes → Product converts to Action cards → Operator approves
- **Pre-Generation + HITL**: Agent works ahead → idle until operator approval

### Security & Evidence Requirements (CI Merge Blockers)
1. **MCP Evidence JSONL** (code changes): `artifacts/product/<date>/mcp/<tool>.jsonl`
2. **Heartbeat NDJSON** (tasks >2h): `artifacts/product/<date>/heartbeat.ndjson` (15min max staleness)
3. **Dev MCP Ban**: NO Dev MCP imports in `app/` (production code only)
4. **PR Template**: Must include MCP Evidence + Heartbeat + Dev MCP Check sections

**See**: `.cursor/rules/10-growth-engine-pack.mdc` for full requirements

---

## 🚀 PHASE 12: CX Theme Task Generation (2 hours) — P3 PRIORITY

**Objective**: Convert CX conversation themes (from AI-Knowledge) into actionable Product tasks

### Context

**CX → Product Loop** (from Growth Engine pack):
```
AI-Knowledge → Detects recurring themes (e.g., "5 customers asked about size chart for Product X")
            → Passes themes to Product agent
Product → Converts theme to Action card with draft copy + evidence
       → Populates Action Queue
Operator → Reviews Action card → Approves → Content agent implements
```

**Example Output**:
- **Theme**: "size chart" (7 occurrences for "Powder Boards")
- **Action Card**: "Add size chart to Powder Boards product page"
- **Draft Copy**: "Based on 7 customer inquiries in the last 7 days, adding a size chart may reduce support volume by 15% and increase conversions by 8%."
- **Evidence**: Customer queries, product metrics, similar products with size charts

---

### PRODUCT-015: CX Theme Action Generator (2h)

**File**: `app/services/product/cx-theme-actions.ts` (NEW)

**Purpose**: Convert CX themes to Action Queue cards with draft implementation copy

**Service Functions**:

```typescript
import type { ConversationTheme } from "~/services/ai-knowledge/cx-conversation-mining";

interface CXThemeAction {
  type: 'content' | 'seo' | 'product_update';
  title: string;
  description: string;
  expectedRevenue: number;
  confidence: number;
  ease: number;
  evidenceUrl: string;
  affectedEntities: string[];
  draftCopy?: string; // Suggested implementation text
  metadata: {
    theme: string;
    occurrences: number;
    productHandle: string;
    exampleQueries: string[];
    implementationType: string; // e.g., "add_size_chart", "update_description", "add_faq"
  };
}

// Map theme to implementation type
function mapThemeToImplementationType(theme: string): {
  type: 'content' | 'seo' | 'product_update';
  implementationType: string;
} {
  const themeMap: Record<string, { type: any; implementationType: string }> = {
    "size chart": { type: "content", implementationType: "add_size_chart" },
    "sizing guide": { type: "content", implementationType: "add_size_chart" },
    "product dimensions": { type: "content", implementationType: "add_dimensions" },
    "how to install": { type: "content", implementationType: "add_installation_guide" },
    "warranty information": { type: "content", implementationType: "add_warranty_section" },
    "return policy": { type: "seo", implementationType: "add_return_policy_link" },
    "shipping time": { type: "seo", implementationType: "add_shipping_estimate" },
    "in stock": { type: "product_update", implementationType: "add_stock_indicator" },
    "when restock": { type: "product_update", implementationType: "add_restock_notification" }
  };
  
  return themeMap[theme.toLowerCase()] || {
    type: "content",
    implementationType: "general_update"
  };
}

// Generate draft copy for implementation
function generateDraftCopy(
  theme: string,
  productTitle: string,
  occurrences: number
): string {
  const implType = mapThemeToImplementationType(theme);
  
  const templates: Record<string, string> = {
    "add_size_chart": `
**Size Chart for ${productTitle}**

Based on ${occurrences} customer inquiries in the last 7 days, customers need sizing guidance. Recommended size chart:

| Size | Chest (in) | Waist (in) | Length (in) |
|------|-----------|-----------|------------|
| S    | 34-36     | 28-30     | 27         |
| M    | 38-40     | 32-34     | 28         |
| L    | 42-44     | 36-38     | 29         |
| XL   | 46-48     | 40-42     | 30         |

**Fit Notes**: True to size. For between sizes, size up for comfort.
    `.trim(),
    
    "add_dimensions": `
**Product Dimensions for ${productTitle}**

Customers are asking about exact dimensions (${occurrences} inquiries). Add to product description:

**Dimensions**:
- Length: [FILL IN]
- Width: [FILL IN]
- Height/Depth: [FILL IN]
- Weight: [FILL IN]

**Packaging Dimensions**:
- Box size: [FILL IN]
- Shipping weight: [FILL IN]
    `.trim(),
    
    "add_installation_guide": `
**Installation Guide for ${productTitle}**

${occurrences} customers asked for installation help. Suggested guide:

**Installation Steps**:
1. [STEP 1]
2. [STEP 2]
3. [STEP 3]

**Tools Needed**: [LIST]
**Installation Time**: [TIME]

**Video Tutorial**: [LINK TO VIDEO if available]
    `.trim(),
    
    "add_warranty_section": `
**Warranty Information for ${productTitle}**

Customers are asking about warranty coverage (${occurrences} inquiries). Add to product page:

**Warranty**: [1-year/2-year/etc.] limited warranty
**Covers**: Manufacturing defects, material failures
**Does Not Cover**: Normal wear and tear, misuse, improper installation
**Claim Process**: Email support@hotrodan.com with order number and photos
    `.trim()
  };
  
  return templates[implType.implementationType] || `
Update ${productTitle} to address customer questions about "${theme}" (${occurrences} inquiries in last 7 days).
  `.trim();
}

// Generate Action card from CX theme
export async function generateCXThemeAction(
  theme: ConversationTheme
): Promise<CXThemeAction | null> {
  // Get product details
  const product = await getShopifyProductByHandle(theme.productHandle);
  
  if (!product) {
    console.warn(`[Product] Product not found: ${theme.productHandle}`);
    return null;
  }
  
  const implMapping = mapThemeToImplementationType(theme.theme);
  const draftCopy = generateDraftCopy(theme.theme, product.title, theme.occurrences);
  
  // Calculate expected impact
  const expectedRevenue = theme.occurrences * 50; // Estimate: $50 saved support time per inquiry
  const confidence = theme.occurrences >= 5 ? 0.9 : 0.7; // Higher confidence with more data
  const ease = implMapping.implementationType === "add_size_chart" ? 0.8 : 0.6;
  
  return {
    type: implMapping.type,
    title: `Add ${theme.theme} to ${product.title}`,
    description: `${theme.occurrences} customers asked about "${theme.theme}" in the last 7 days. Adding this to the product page may reduce support volume by ${theme.occurrences * 0.8} tickets/week and increase conversions by an estimated 5-8%.`,
    expectedRevenue,
    confidence,
    ease,
    evidenceUrl: `/api/cx-themes/${encodeURIComponent(theme.theme)}`,
    affectedEntities: [theme.productHandle],
    draftCopy,
    metadata: {
      theme: theme.theme,
      occurrences: theme.occurrences,
      productHandle: theme.productHandle,
      exampleQueries: theme.exampleQueries,
      implementationType: implMapping.implementationType
    }
  };
}

// Process all themes from AI-Knowledge
export async function processCXThemes(
  themes: ConversationTheme[]
): Promise<CXThemeAction[]> {
  const actions: CXThemeAction[] = [];
  
  for (const theme of themes) {
    const action = await generateCXThemeAction(theme);
    
    if (action) {
      actions.push(action);
    }
  }
  
  return actions;
}

// Add to Action Queue
export async function addCXActionsToQueue(
  actions: CXThemeAction[]
) {
  for (const action of actions) {
    await prisma.actionQueue.create({
      data: {
        type: action.type,
        title: action.title,
        description: action.description,
        expectedRevenue: action.expectedRevenue,
        confidence: action.confidence,
        ease: action.ease,
        evidenceUrl: action.evidenceUrl,
        affectedEntities: action.affectedEntities,
        draftCopy: action.draftCopy,
        metadata: action.metadata,
        status: 'pending',
        createdBy: 'ai-knowledge',
        createdAt: new Date()
      }
    });
  }
  
  console.log(`[Product] ✅ Added ${actions.length} CX theme actions to queue`);
  
  return actions.length;
}
```

**API Route**: `app/routes/api.cx-themes.process.ts` (NEW)

```typescript
// POST /api/cx-themes/process
// Called by nightly job or manually to process CX themes

import { type ActionFunctionArgs } from "react-router";
import { detectRecurringThemes } from "~/services/ai-knowledge/cx-conversation-mining";
import { processCXThemes, addCXActionsToQueue } from "~/services/product/cx-theme-actions";

export async function action({ request }: ActionFunctionArgs) {
  try {
    // 1. Get themes from AI-Knowledge
    const themes = await detectRecurringThemes(3, 7);
    
    // 2. Convert to Action cards
    const actions = await processCXThemes(themes);
    
    // 3. Add to Action Queue
    const added = await addCXActionsToQueue(actions);
    
    return Response.json({
      success: true,
      themes: themes.length,
      actions: added
    });
  } catch (error: any) {
    console.error("[CX Themes] Processing error:", error);
    
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

**Nightly Job**: `scripts/product/nightly-cx-theme-processing.ts`

```typescript
// Run after AI-Knowledge nightly CX mining
import { detectRecurringThemes } from "~/services/ai-knowledge/cx-conversation-mining";
import { processCXThemes, addCXActionsToQueue } from "~/services/product/cx-theme-actions";

async function main() {
  console.log("[Cron] Starting CX theme processing");
  
  // 1. Get themes
  const themes = await detectRecurringThemes(3, 7);
  
  if (themes.length === 0) {
    console.log("[Cron] No themes detected");
    return;
  }
  
  // 2. Generate actions
  const actions = await processCXThemes(themes);
  
  // 3. Add to queue
  const added = await addCXActionsToQueue(actions);
  
  console.log(`[Cron] Complete: ${added} Action cards created from ${themes.length} themes`);
}

main().catch(console.error);
```

**Tests**: `tests/unit/services/product/cx-theme-actions.spec.ts`
- Test theme to implementation type mapping
- Test draft copy generation (all 4 template types)
- Test Action card generation
- Test process themes (batch)
- Test add to Action Queue
- Mock Shopify product queries, Prisma

**Acceptance**:
- ✅ CX theme action generator service implemented
- ✅ Theme → implementation type mapping (9 patterns)
- ✅ Draft copy templates (size chart, dimensions, installation, warranty)
- ✅ Action card generation with evidence
- ✅ Add to Action Queue function
- ✅ API route
- ✅ Nightly job script
- ✅ Unit tests passing

**MCP Required**: 
- Context7 → TypeScript template literals
- Context7 → Prisma create operations

---

## 📋 Acceptance Criteria (All Tasks)

### Phase 12: CX Theme Task Generation (2h)
- ✅ PRODUCT-015: CX theme action generator (mapping, draft copy, Action cards, nightly job)
- ✅ All unit tests passing
- ✅ TypeScript clean, no linter errors

---

## 🔧 Tools & Resources

### MCP Tools (MANDATORY)
1. **Context7 MCP**: For all service development
   - TypeScript template literals
   - Prisma create operations

2. **Web Search**: LAST RESORT ONLY

### Evidence Requirements (CI Merge Blockers)
1. **MCP Evidence JSONL**: `artifacts/product/<date>/mcp/cx-theme-actions.jsonl`
2. **Heartbeat NDJSON**: `artifacts/product/<date>/heartbeat.ndjson` (append every 15min if >2h)
3. **Dev MCP Check**: Verify NO Dev MCP imports in `app/`
4. **PR Template**: Fill out all sections

### Testing
- Unit tests for theme mapping
- Test draft copy generation (all templates)
- Test Action card creation
- Mock Shopify API, Prisma

---

## 🎯 Execution Order

**START NOW** - No idle time:

1. **PRODUCT-015**: CX Theme Action Generator (2h) → START IMMEDIATELY
   - Pull Context7: TypeScript, Prisma
   - Implement theme mapping (9 patterns)
   - Implement draft copy templates (4 types)
   - Implement Action card generation
   - Create API route
   - Create nightly job script
   - Write unit tests

**Total**: 2 hours

**Expected Output**:
- 1 new service (~300-400 lines)
- 1 API route
- 1 nightly job script
- 20+ unit tests

---

## 🚨 Critical Reminders

1. **NO IDLE**: Start PRODUCT-015 immediately
2. **MCP FIRST**: Pull Context7 docs BEFORE coding
3. **Evidence JSONL**: Create `artifacts/product/2025-10-21/mcp/` and log every MCP call
4. **Dependencies**: Coordinate with AI-Knowledge for theme format
5. **Draft Copy Quality**: Templates should be helpful and actionable
6. **Feedback**: Update `feedback/product/2025-10-21.md` every 2 hours

**Questions or blockers?** → Escalate immediately in feedback

**Let's build! 📱**
