# KB Agent Coordination

## AI-Customer Integration

### Tools Available
The KB system provides 4 tools for the AI-Customer agent:

1. **searchKnowledgeBase** - Main search tool
2. **searchKnowledgeWithContext** - Contextual search with conversation history
3. **trackKBUsage** - Track which articles were used
4. **getRelatedArticles** - Get follow-up suggestions

### Integration Points

**File:** `app/agents/tools/knowledge.ts`

**Usage in AI-Customer:**
```typescript
import { knowledgeBaseTools } from './tools/knowledge';

// In agent configuration
const agent = new Agent({
  tools: [
    ...knowledgeBaseTools,
    // other tools
  ]
});
```

### Workflow

1. Customer sends message
2. AI-Customer calls `searchKnowledgeBase` with query
3. KB returns relevant articles with confidence scores
4. AI-Customer uses articles to draft reply
5. AI-Customer calls `trackKBUsage` with article IDs
6. Human reviews and approves/edits
7. Learning extraction captures edits
8. KB confidence scores update

### Configuration

**Minimum confidence:** 0.60 (configurable in `app/lib/knowledge/config.ts`)

**Search limit:** 5 articles (configurable)

**Categories:** orders, shipping, returns, products, technical, policies

---

## Support Agent Integration

### KB Ingestion Process

**Purpose:** Allow support agents to create KB articles from resolved tickets

**Workflow:**
1. Support agent resolves customer issue
2. Agent identifies if issue is recurring or novel
3. Agent creates KB article via UI or API
4. Article goes through review process
5. Article published with initial confidence score

### API Endpoints

**Create Article:**
```
POST /api/kb/articles
{
  "question": "Customer question",
  "answer": "Proven solution",
  "category": "orders",
  "tags": ["order_tracking"],
  "source": "manual"
}
```

**Search for Existing:**
```
POST /api/kb/search
{
  "query": "customer question",
  "category": "orders"
}
```

### UI Integration Points

- Search KB before replying
- View article details with quality metrics
- Create new article from conversation
- Flag article for review

---

## Engineer Integration

### KB Quality Tile

**Purpose:** Dashboard tile showing KB health metrics

**Metrics to Display:**

1. **Total Articles:** Count of active articles
2. **Average Confidence:** System-wide average
3. **Quality Distribution:** Pie chart (excellent/good/fair/poor)
4. **Coverage Rate:** % of queries matched
5. **Learning Velocity:** New articles per week

**API Endpoint:**
```
GET /api/kb/metrics
```

**Response:**
```json
{
  "success": true,
  "metrics": {
    "quality": {
      "totalArticles": 25,
      "coverage": 0.72,
      "avgConfidence": 0.75,
      "qualityDistribution": {
        "excellent": 10,
        "good": 8,
        "fair": 5,
        "poor": 2
      },
      "avgGrades": {
        "tone": 4.6,
        "accuracy": 4.8,
        "policy": 4.9
      }
    },
    "categories": {
      "orders": 8,
      "shipping": 6,
      "returns": 5,
      "products": 4,
      "technical": 2
    },
    "usage": {
      "total": 150,
      "helpful": 135,
      "helpfulness_rate": 0.9
    }
  }
}
```

### Tile Component

**Location:** `app/components/dashboard/KBQualityTile.tsx`

**Features:**
- Real-time metrics
- Trend indicators (↑↓)
- Click to view details
- Alert badges for issues

---

## Coordination Checklist

### AI-Customer
- [x] Tools exported and documented
- [x] Workflow defined
- [x] Configuration exposed
- [ ] Integration tested
- [ ] Monitoring active

### Support
- [x] API endpoints created
- [x] Ingestion workflow defined
- [ ] UI components built
- [ ] Training documentation
- [ ] Feedback loop established

### Engineer
- [x] Metrics API created
- [x] Tile specification defined
- [ ] Component implemented
- [ ] Dashboard integrated
- [ ] Alerts configured

---

## Communication Protocol

### Issue Reporting

**For AI-Customer issues:**
- File issue with label `kb:ai-customer`
- Include: query, expected results, actual results
- Tag: @ai-knowledge

**For Support issues:**
- File issue with label `kb:support`
- Include: workflow step, error message
- Tag: @ai-knowledge

**For Engineer issues:**
- File issue with label `kb:engineer`
- Include: metric name, expected value, actual value
- Tag: @ai-knowledge

### Weekly Sync

**Schedule:** Every Monday 10am
**Attendees:** AI-Customer, Support, Engineer, AI-Knowledge
**Agenda:**
- Review KB metrics
- Discuss quality issues
- Plan improvements
- Coordinate releases

---

## Deployment Coordination

### Phase 1: Foundation (Week 1)
- AI-Knowledge: Deploy schema and seed data
- Engineer: Build quality tile
- Support: Review KB articles

### Phase 2: Integration (Week 2)
- AI-Customer: Integrate KB tools
- Support: Test ingestion workflow
- Engineer: Deploy quality tile

### Phase 3: Monitoring (Week 3)
- All: Monitor metrics
- AI-Knowledge: Tune parameters
- Support: Provide feedback

### Phase 4: Optimization (Week 4)
- All: Review performance
- AI-Knowledge: Implement improvements
- Engineer: Add advanced metrics

