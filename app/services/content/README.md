# Content Services

## AI Content Generation Service

**File**: `ai-content-generator.ts`

### Purpose

Provides AI-powered content generation using OpenAI for product descriptions, blog posts, and content quality assessment. Supports multiple tones, lengths, and automatic quality scoring.

### Features

- **Product Description Generation**: Create compelling product descriptions with customizable tone and length
- **Blog Post Generation**: Generate engaging blog posts with keyword optimization
- **Content Variations**: Generate multiple versions with different tones for A/B testing
- **Quality Assessment**: Automated scoring for readability, SEO, engagement, and brand alignment

### Usage

```typescript
import { aiContentGenerator } from '~/services/content/ai-content-generator';

// Generate product description
const result = await aiContentGenerator.generateProductDescription({
  productTitle: 'Carbon Fiber Roof Rack',
  features: ['Lightweight', 'Aerodynamic', 'Easy installation'],
  tone: 'professional',
  length: 'medium',
  includeKeywords: ['carbon fiber', 'roof rack']
});

console.log(result.content);
console.log(result.qualityScore);
```

### API Routes

- `POST /api/content/generate-product-description` - Generate product descriptions
- `POST /api/content/generate-blog-post` - Generate blog posts
- `POST /api/content/generate-variations` - Generate content variations
- `POST /api/content/assess-quality` - Assess content quality

### Documentation

See `AI_CONTENT_GENERATION.md` for complete documentation.

---

## CX Content Implementation Service

**File**: `cx-content-implementation.ts`

### Purpose

Implements CX theme content (size charts, installation guides, dimensions, warranty sections) to Shopify products using metafields. This service integrates with the Product agent's CX theme action generator.

### Integration with Product Agent

The Product agent's CX theme action generator (`app/services/product/cx-theme-actions.ts`) creates Action cards with draft content templates based on customer conversation themes detected by AI-Knowledge agent.

**Product Agent Output** (from Action Queue):

```typescript
{
  type: "content",
  title: "Add size chart to Powder Boards",
  description: "7 customers asked about sizing in last 7 days",
  draftCopy: "**Size Chart for Powder Boards**\n\n| Size | Chest (in) | ...",
  metadata: {
    theme: "size chart",
    productHandle: "powder-boards",
    implementationType: "add_size_chart"
  }
}
```

**Content Agent Implementation** (using this service):

```typescript
import { applyCXContent } from "~/services/content/cx-content-implementation";

// When operator approves Action card, Content agent applies:
await applyCXContent(
  {
    productId: "gid://shopify/Product/123",
    contentType: "size_chart", // maps from metadata.implementationType
    content: action.draftCopy, // uses Product agent's generated content
  },
  request,
);
```

### Supported Content Types

| Content Type         | Metafield Key        | Description                            |
| -------------------- | -------------------- | -------------------------------------- |
| `size_chart`         | `size_chart`         | Size charts with measurements          |
| `dimensions`         | `dimensions`         | Product dimensions and specifications  |
| `installation_guide` | `installation_guide` | Step-by-step installation instructions |
| `warranty`           | `warranty`           | Warranty terms and coverage details    |

### Metafield Configuration

- **Namespace**: `cx_content`
- **Type**: `multi_line_text_field` (supports markdown)
- **Owner**: Product
- **Scope**: Storefront accessible (customer-facing)

### API Endpoints

#### POST `/api/cx-content/apply`

Applies CX content to a product.

**Request Body**:

```json
{
  "productId": "gid://shopify/Product/123",
  "contentItems": [
    {
      "contentType": "size_chart",
      "content": "Size chart markdown content"
    },
    {
      "contentType": "warranty",
      "content": "Warranty information"
    }
  ]
}
```

**Response**:

```json
{
  "success": true,
  "results": [
    {
      "success": true,
      "productId": "gid://shopify/Product/123",
      "contentType": "size_chart",
      "metafieldId": "gid://shopify/Metafield/456"
    }
  ],
  "message": "Successfully applied 2 CX content item(s)"
}
```

### Usage Examples

#### Apply Single Content Item

```typescript
import { applyCXContent } from "~/services/content/cx-content-implementation";

const result = await applyCXContent(
  {
    productId: "gid://shopify/Product/123",
    contentType: "size_chart",
    content: "**Size Chart**\n\n| Size | Measurements |...",
  },
  request,
);

if (result.success) {
  console.log(`Applied size chart: ${result.metafieldId}`);
}
```

#### Apply Multiple Content Items

```typescript
import { applyMultipleCXContents } from "~/services/content/cx-content-implementation";

const results = await applyMultipleCXContents(
  "gid://shopify/Product/123",
  [
    { contentType: "size_chart", content: "Size chart content" },
    { contentType: "dimensions", content: "Dimensions content" },
    { contentType: "warranty", content: "Warranty content" },
  ],
  request,
);

const successCount = results.filter((r) => r.success).length;
console.log(`Applied ${successCount} of ${results.length} items`);
```

#### Retrieve Content

```typescript
import { getCXContent } from "~/services/content/cx-content-implementation";

// Get single content type
const sizeChart = await getCXContent(
  "gid://shopify/Product/123",
  "size_chart",
  request,
);

// Get all CX content for product
const allContent = await getCXContent(
  "gid://shopify/Product/123",
  null,
  request,
);
```

#### Remove Content

```typescript
import { removeCXContent } from "~/services/content/cx-content-implementation";

const result = await removeCXContent(
  "gid://shopify/Product/123",
  "size_chart",
  request,
);

if (result.success) {
  console.log("Size chart removed");
}
```

### Validation

All GraphQL operations are validated using **Shopify Dev MCP**:

✅ `productUpdate` mutation with metafields  
✅ Query operations for retrieving content  
✅ `metafieldsDelete` mutation for removing content

**Validation Evidence**: `artifacts/content/2025-10-21/mcp/cx-content-implementation.jsonl`

### Testing

**Test File**: `tests/unit/services/content/cx-content-implementation.spec.ts`

Run tests:

```bash
npm run test:unit -- cx-content-implementation
```

Test coverage:

- ✅ Apply content (all 4 types)
- ✅ Handle Shopify errors
- ✅ Retrieve single/multiple content types
- ✅ Remove content
- ✅ Handle not found scenarios

### Complete Workflow (Product Integration)

```
Customer Questions (CX)
  ↓
AI-Knowledge detects recurring themes
  ↓
Product agent generates Action cards (with draft content templates)
  ↓
Stored in DashboardFact (factType: "product.cx_theme_action")
  ↓
Action Queue displays to operator
  ↓
Operator approves action
  ↓
POST /api/cx-actions/apply (with action + productId)
  ↓
CX Action Applier maps implementationType → contentType
  ↓
Applies draft copy to Shopify product (via productUpdate + metafields)
  ↓
Shopify product updated with CX content (namespace: "cx_content")
  ↓
Content visible on storefront
```

### Integration Services

**Product → Content Bridge**: `app/services/content/cx-action-applier.ts`

**Purpose**: Connects Product agent's CX theme actions to Content's implementation service

**Key Functions**:

- `mapImplementationTypeToContentType()` - Maps Product's types to Content's types
- `applyCXThemeAction()` - Applies single approved action
- `getApprovedCXThemeActions()` - Retrieves approved actions from DashboardFact

**API Endpoint**: `POST /api/cx-actions/apply`

**Request**:

```json
{
  "productId": "gid://shopify/Product/123",
  "action": {
    "type": "content",
    "title": "Add size chart to Powder Boards",
    "draftCopy": "**Size Chart**\n\n| Size | Measurements |...",
    "metadata": {
      "implementationType": "add_size_chart",
      "productHandle": "powder-boards",
      "theme": "size chart",
      "occurrences": 7
    }
  }
}
```

**Response**:

```json
{
  "success": true,
  "productId": "gid://shopify/Product/123",
  "contentType": "size_chart",
  "appliedAt": "2025-10-21T20:45:00Z",
  "message": "Successfully applied size_chart to product"
}
```

### Future Enhancements

- [ ] Metafield definitions for validation
- [ ] Rich text support (currently multi-line text)
- [ ] Bulk operations for multiple products
- [ ] Content templates library
- [ ] Analytics on content effectiveness
- [ ] A/B testing for different content versions

### References

- Product agent spec: `docs/directions/product.md` (PRODUCT-015: CX Theme Action Generator)
- Shopify metafields docs: https://shopify.dev/docs/apps/build/custom-data/metafields
- MCP validation evidence: `artifacts/content/2025-10-21/mcp/cx-content-implementation.jsonl`
