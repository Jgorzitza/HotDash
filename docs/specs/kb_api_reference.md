# Knowledge Base API Reference

## Overview

The Knowledge Base (KB) system provides AI-powered customer support with self-learning capabilities. This document describes the API endpoints, data models, and integration patterns.

## Core Concepts

### Confidence Score
- Range: 0.00 - 1.00
- Formula: `success_rate * 0.4 + accuracy_grade * 0.3 + tone_grade * 0.2 + policy_grade * 0.1`
- Thresholds:
  - ≥ 0.80: High confidence
  - 0.60-0.79: Medium confidence
  - 0.40-0.59: Low confidence
  - < 0.40: Very low confidence

### Quality Tiers
- **Excellent**: confidence ≥ 0.80, success ≥ 0.80, grades ≥ 4.5
- **Good**: confidence ≥ 0.70, success ≥ 0.70, grades ≥ 4.0
- **Fair**: confidence ≥ 0.60, success ≥ 0.60, grades ≥ 3.5
- **Poor**: Below fair thresholds

## API Endpoints

### Search

#### Semantic Search
```typescript
POST /api/kb/search/semantic
{
  "query": string,
  "category"?: "orders" | "shipping" | "returns" | "products" | "technical" | "policies",
  "minConfidence"?: number,
  "limit"?: number
}

Response: SearchResult[]
```

#### Hybrid Search
```typescript
POST /api/kb/search/hybrid
{
  "query": string,
  "category"?: string,
  "minConfidence"?: number,
  "limit"?: number
}

Response: SearchResult[]
```

#### Contextual Search
```typescript
POST /api/kb/search/contextual
{
  "query": string,
  "conversationHistory": string[],
  "category"?: string,
  "limit"?: number
}

Response: SearchResult[]
```

### Articles

#### Get Article
```typescript
GET /api/kb/articles/:id

Response: {
  id: number,
  question: string,
  answer: string,
  category: string,
  tags: string[],
  confidence_score: number,
  usage_count: number,
  success_count: number,
  avg_tone_grade: number,
  avg_accuracy_grade: number,
  avg_policy_grade: number
}
```

#### Create Article
```typescript
POST /api/kb/articles
{
  "question": string,
  "answer": string,
  "category": string,
  "tags": string[],
  "source": "human_edit" | "template" | "extracted" | "manual"
}

Response: Article
```

#### Update Article
```typescript
PATCH /api/kb/articles/:id
{
  "question"?: string,
  "answer"?: string,
  "tags"?: string[]
}

Response: Article
```

### Learning

#### Extract Learning
```typescript
POST /api/kb/learning/extract
{
  "approvalId": number,
  "conversationId": number,
  "aiDraft": string,
  "humanFinal": string,
  "customerQuestion": string,
  "grades": {
    "tone": number,
    "accuracy": number,
    "policy": number
  },
  "reviewer": string,
  "category"?: string,
  "tags"?: string[]
}

Response: { success: boolean, learningEditId: number }
```

#### Track Recurring Issue
```typescript
POST /api/kb/learning/recurring
{
  "issuePattern": string,
  "category": string,
  "tags": string[]
}

Response: { success: boolean, occurrenceCount: number }
```

### Quality

#### Get Article Quality
```typescript
GET /api/kb/quality/article/:id

Response: {
  confidenceScore: number,
  usageRate: number,
  successRate: number,
  avgGrades: { tone: number, accuracy: number, policy: number },
  qualityTier: "excellent" | "good" | "fair" | "poor",
  recommendations: string[]
}
```

#### Get System Metrics
```typescript
GET /api/kb/quality/system

Response: {
  totalArticles: number,
  coverage: number,
  avgConfidence: number,
  qualityDistribution: {
    excellent: number,
    good: number,
    fair: number,
    poor: number
  },
  avgGrades: { tone: number, accuracy: number, policy: number }
}
```

### Graph

#### Get Linked Articles
```typescript
GET /api/kb/graph/links/:articleId?type=related

Response: Array<{
  id: number,
  question: string,
  category: string,
  linkType: string,
  strength: number
}>
```

#### Find Path
```typescript
POST /api/kb/graph/path
{
  "startArticleId": number,
  "endArticleId": number,
  "maxDepth"?: number
}

Response: {
  articles: ArticleNode[],
  totalStrength: number
} | null
```

## Data Models

### KB Article
```typescript
interface KBArticle {
  id: number;
  question: string;
  answer: string;
  category: 'orders' | 'shipping' | 'returns' | 'products' | 'technical' | 'policies';
  tags: string[];
  confidence_score: number;
  usage_count: number;
  success_count: number;
  avg_tone_grade: number | null;
  avg_accuracy_grade: number | null;
  avg_policy_grade: number | null;
  source: 'human_edit' | 'template' | 'extracted' | 'manual';
  created_by: string;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
  embedding: number[] | null;
  archived_at: string | null;
}
```

### Learning Edit
```typescript
interface LearningEdit {
  id: number;
  approval_id: number;
  conversation_id: number;
  ai_draft: string;
  human_final: string;
  edit_distance: number;
  edit_ratio: number;
  tone_grade: number;
  accuracy_grade: number;
  policy_grade: number;
  customer_question: string;
  category: string;
  tags: string[];
  kb_article_id: number | null;
  learning_type: 'tone_improvement' | 'factual_correction' | 'policy_clarification' | 'template_refinement' | 'new_pattern';
  reviewer: string;
  created_at: string;
}
```

### Search Result
```typescript
interface SearchResult {
  id: number;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  confidenceScore: number;
  relevanceScore: number;
  combinedScore: number;
}
```

## Integration Patterns

### AI-Customer Agent Integration

```typescript
import { aiCustomerKBWorkflow } from './app/agents/tools/knowledge';

// In agent handler
const { kbArticles, context, articleIds } = await aiCustomerKBWorkflow(
  customerMessage,
  conversationHistory,
  category
);

// Use context in agent prompt
const prompt = `${context}\n\nCustomer: ${customerMessage}\n\nDraft a helpful reply.`;

// Track usage
await trackKBUsage({ articleIds, approvalId, wasHelpful: true });
```

### Learning Pipeline Integration

```typescript
import { extractLearning } from './app/services/knowledge/learning';

// After human approves draft
await extractLearning({
  approvalId,
  conversationId,
  aiDraft,
  humanFinal,
  customerQuestion,
  grades: { tone, accuracy, policy },
  reviewer,
  category,
  tags
});
```

## Rate Limits

- Search: 100 requests/minute
- Article CRUD: 50 requests/minute
- Learning extraction: 20 requests/minute
- Embedding generation: 10 requests/minute

## Error Codes

- `KB_001`: Article not found
- `KB_002`: Invalid confidence score
- `KB_003`: Invalid category
- `KB_004`: Embedding generation failed
- `KB_005`: Search query too short
- `KB_006`: Rate limit exceeded

