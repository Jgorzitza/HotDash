# Test Fixtures & Data Generators

**Purpose**: Realistic test data for growth feature testing  
**Updated**: 2025-10-14  
**Owner**: QA Helper

---

## Directory Structure

```
tests/fixtures/
├── gsc/                    # Google Search Console data
│   ├── search-analytics.json
│   └── pages-performance.json
├── shopify/               # Shopify product/order data
│   ├── products-growth.json
│   ├── orders.json
│   └── inventory.json
├── chatwoot/              # Customer conversation data
│   ├── growth-messages.json
│   ├── messages.json
│   └── conversations.json
├── actions/               # AI action scenarios
│   └── action-types.json
└── README.md (this file)

tests/helpers/
├── gsc-data-generator.ts        # GSC data generator functions
├── shopify-data-generator.ts   # Shopify data generator functions
├── chatwoot-data-generator.ts  # Chatwoot data generator functions
└── actions-data-generator.ts   # Actions data generator functions
```

---

## Data Generators Usage

### GSC (Google Search Console) Data

```typescript
import { 
  generateGSCAnalytics, 
  generateGSCPagePerformance,
  generateUnderperformingPages,
  generateCTRAnomalies 
} from '../helpers/gsc-data-generator';

// Generate 10 search analytics rows
const analytics = generateGSCAnalytics(10);

// Generate 5 page performance records
const pages = generateGSCPagePerformance(5);

// Generate underperforming pages for SEO optimization testing
const lowCTR = generateUnderperformingPages(3);

// Generate CTR anomaly test data
const anomalies = generateCTRAnomalies();
```

### Shopify Product Data

```typescript
import { 
  generateShopifyProducts,
  generateLowStockProducts,
  generatePageMetadata 
} from '../helpers/shopify-data-generator';

// Generate 5 realistic Hot Rod AN products
const products = generateShopifyProducts(5);

// Generate low stock products for inventory alerts
const lowStock = generateLowStockProducts(3);

// Generate page metadata for SEO testing
const pageData = generatePageMetadata(5);
```

### Chatwoot Conversation Data

```typescript
import { 
  generateConversation,
  generateConversations,
  generateEscalationScenario,
  generateApprovalQueue 
} from '../helpers/chatwoot-data-generator';

// Generate single conversation
const conv = generateConversation(0, 100);

// Generate 6 different conversation scenarios
const conversations = generateConversations(6);

// Generate escalation scenario
const escalation = generateEscalationScenario(500);

// Generate approval queue items
const queue = generateApprovalQueue(5);
```

### Actions Test Data

```typescript
import { 
  generateProductRecommendationAction,
  generateOrderLookupAction,
  generateTechnicalGuidanceAction,
  generatePriceQuoteAction,
  generateInventoryCheckAction,
  generateEscalationAction,
  generateAllActionTypes 
} from '../helpers/actions-data-generator';

// Generate specific action types
const productRec = generateProductRecommendationAction(1001);
const orderLookup = generateOrderLookupAction(2001);

// Generate all action type examples
const allActions = generateAllActionTypes();
```

---

## Test Scenarios

### Growth Feature Testing

**SEO Pulse Monitoring**:
- Use `generateUnderperformingPages()` for low CTR alerts
- Use `generateCTRAnomalies()` for anomaly detection
- Use `generateGSCPagePerformance()` for baseline metrics

**Approval Flow**:
- Use `generateApprovalQueue()` for queue testing
- Use `generateOrderLookupAction()` for approval actions
- Use `generateEscalationAction()` for high-priority approvals

**Learning Loop**:
- Use `generateConversations()` for multi-turn interactions
- Use `generateEscalationScenario()` for complex cases
- Use `generateAllActionTypes()` for action diversity

**Inventory Alerts**:
- Use `generateLowStockProducts()` for alert triggers
- Use `generateShopifyProducts()` for baseline inventory

---

## Data Characteristics

### Hot Rod AN Specific

All test data reflects real Hot Rod AN business:
- **Products**: Fuel pumps, PTFE lines, AN fittings, regulators
- **Customer Base**: Hot rod builders, LS swap enthusiasts
- **Queries**: Automotive/performance fuel system focused
- **Price Range**: $45-$450 (realistic product pricing)
- **Technical**: Spec-heavy (HP ratings, PSI, AN sizes)

### Realistic Metrics

- **CTR**: 2-10% (typical e-commerce range)
- **Position**: 1-9 (common SERP positions)
- **Inventory**: 1-50 units (small business scale)
- **Response Time**: 3-5 minutes (AI agent performance)

---

## Usage in Tests

```typescript
import { describe, it, expect } from 'vitest';
import { generateGSCAnalytics } from '../helpers/gsc-data-generator';
import { generateApprovalQueue } from '../helpers/chatwoot-data-generator';

describe('SEO Pulse Tile', () => {
  it('should detect low CTR pages', () => {
    const data = generateGSCAnalytics(10);
    const lowCTR = data.rows.filter(row => row.ctr < 0.03);
    expect(lowCTR.length).toBeGreaterThan(0);
  });
});

describe('Approval Queue', () => {
  it('should display pending approvals', () => {
    const queue = generateApprovalQueue(5);
    expect(queue).toHaveLength(5);
    expect(queue[0].pending[0].tool).toBeDefined();
  });
});
```

---

## Maintenance

**When to Update**:
- New product categories added to Hot Rod AN catalog
- New action types added to AI agent
- New conversation scenarios identified
- SEO metrics thresholds change

**How to Update**:
1. Add templates to generator files
2. Update this README with usage examples
3. Run `npm run test:unit` to verify
4. Document in feedback/qa-helper.md

---

**Created**: 2025-10-14  
**Generator Files**: 4 (gsc, shopify, chatwoot, actions)  
**Fixture Files**: 5 (gsc analytics, gsc pages, shopify products, chatwoot messages, actions)  
**Total**: 9 files for comprehensive growth feature testing

