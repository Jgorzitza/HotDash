# AI-Knowledge Direction v7.0 — Growth Engine Integration

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T16:50Z  
**Version**: 7.0  
**Status**: ACTIVE — Phase 12 CX → Product Loop (Growth Engine)

---

## ✅ ALL PREVIOUS AI-KNOWLEDGE TASKS COMPLETE

**Completed** (from feedback/ai-knowledge/2025-10-21.md):
- ✅ AI-KNOWLEDGE-010: Query engine optimization (similarityTopK=3, overlap=0, cutoff=0.65)
- ✅ AI-KNOWLEDGE-011: Expanded KB (6 docs indexed)
- ✅ AI-KNOWLEDGE-012: CEO Agent query function (exported)
- ✅ AI-KNOWLEDGE-013: KB Management API (add, update, delete)
- ✅ AI-KNOWLEDGE-014: KB Quality Metrics (coverage, accuracy, health score)
- ✅ AI-KNOWLEDGE-015: KB Maintenance (versioning, dedup, refresh)

**Total Output**: Optimized RAG system, 6 docs, query function for CEO Agent

**Blocked**: AI-KNOWLEDGE-011 expansion (awaiting 50+ documents from Content/Product)

---

## 🎯 NEW: Growth Engine Architecture (Effective 2025-10-21)

**Context**: Growth Engine Final Pack integrated into project (commit: 546bd0e)

### Production Agent Model
- **Specialist Agents**: Run in background to keep data fresh (pre-generate insights)
- **CX → Product Loop**: Mine conversations → detect themes → propose product improvements
- **Pre-Generation + HITL**: Agent works ahead → idle until operator approval

### Security & Evidence Requirements (CI Merge Blockers)
1. **MCP Evidence JSONL** (code changes): `artifacts/ai-knowledge/<date>/mcp/<tool>.jsonl`
2. **Heartbeat NDJSON** (tasks >2h): `artifacts/ai-knowledge/<date>/heartbeat.ndjson` (15min max staleness)
3. **Dev MCP Ban**: NO Dev MCP imports in `app/` (production code only)
4. **PR Template**: Must include MCP Evidence + Heartbeat + Dev MCP Check sections

**See**: `.cursor/rules/10-growth-engine-pack.mdc` for full requirements

---

## 🚀 PHASE 12: CX → Product Loop (4 hours) — P3 PRIORITY

**Objective**: Mine CX conversations to detect recurring themes and generate product improvement actions

### Context

**CX → Product Loop** (from Growth Engine pack):
```
1. Extract Chatwoot conversations (last 30 days)
2. Sanitize (remove PII: names, emails, phones, addresses)
3. Embed into pgvector (separate table: cx_embeddings)
4. Nightly: Query for recurring themes by product/collection
5. Generate Action cards: "Add size chart to Product X (5 customers asked in last 7 days)"
6. Output: 3+ mini-tasks/week with draft copy + evidence
```

**Security**: NO PII stored in embeddings (conversations sanitized before embedding)

---

### AI-KNOWLEDGE-017: PII Sanitization Service (1h)

**File**: `app/services/ai-knowledge/pii-sanitizer.ts` (NEW)

**Purpose**: Remove PII from Chatwoot conversations before embedding

**Sanitization Rules**:

```typescript
interface SanitizationResult {
  sanitizedText: string;
  piiDetected: boolean;
  piiTypes: string[]; // e.g., ["email", "phone", "address"]
}

export function sanitizePII(text: string): SanitizationResult {
  let sanitized = text;
  const piiTypes: string[] = [];
  
  // Remove emails
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  if (emailRegex.test(sanitized)) {
    piiTypes.push("email");
    sanitized = sanitized.replace(emailRegex, "[EMAIL_REDACTED]");
  }
  
  // Remove phone numbers (multiple formats)
  const phoneRegex = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  if (phoneRegex.test(sanitized)) {
    piiTypes.push("phone");
    sanitized = sanitized.replace(phoneRegex, "[PHONE_REDACTED]");
  }
  
  // Remove addresses (street numbers + common patterns)
  const addressRegex = /\b\d+\s+[A-Z][a-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct)\b/gi;
  if (addressRegex.test(sanitized)) {
    piiTypes.push("address");
    sanitized = sanitized.replace(addressRegex, "[ADDRESS_REDACTED]");
  }
  
  // Remove postal codes (US and Canada)
  const postalRegex = /\b\d{5}(?:-\d{4})?\b|\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/gi;
  if (postalRegex.test(sanitized)) {
    piiTypes.push("postal_code");
    sanitized = sanitized.replace(postalRegex, "[POSTAL_REDACTED]");
  }
  
  // Remove credit card numbers
  const ccRegex = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
  if (ccRegex.test(sanitized)) {
    piiTypes.push("credit_card");
    sanitized = sanitized.replace(ccRegex, "[CC_REDACTED]");
  }
  
  return {
    sanitizedText: sanitized,
    piiDetected: piiTypes.length > 0,
    piiTypes
  };
}

// Sanitize Chatwoot conversation
export function sanitizeConversation(
  messages: Array<{ content: string; messageType: string }>
) {
  return messages.map(msg => {
    const result = sanitizePII(msg.content);
    
    return {
      content: result.sanitizedText,
      messageType: msg.messageType,
      piiDetected: result.piiDetected,
      piiTypes: result.piiTypes
    };
  });
}
```

**Tests**: `tests/unit/services/ai-knowledge/pii-sanitizer.spec.ts`
- Test email redaction (multiple formats)
- Test phone redaction (US, Canada)
- Test address redaction
- Test postal code redaction
- Test credit card redaction
- Test conversation sanitization (batch)
- Verify NO PII in output

**Acceptance**:
- ✅ PII sanitizer implemented
- ✅ All 5 PII types handled (email, phone, address, postal, CC)
- ✅ Regex patterns accurate
- ✅ Unit tests passing (100% PII removal verified)
- ✅ No false positives (regular text preserved)

**MCP Required**: 
- Context7 → TypeScript regex patterns

---

### AI-KNOWLEDGE-018: CX Conversation Mining Service (3h)

**File**: `app/services/ai-knowledge/cx-conversation-mining.ts` (NEW)

**Purpose**: Extract, sanitize, embed CX conversations and detect recurring themes

**Database Table**: `cx_embeddings` (Data agent creates)

```typescript
import { LlamaIndexPGVectorStore } from "llamaindex";
import { OpenAIEmbedding } from "llamaindex";
import { sanitizeConversation } from "./pii-sanitizer";

const embedding = new OpenAIEmbedding({
  model: "text-embedding-3-small",
  dimensions: 1536
});

interface ConversationTheme {
  theme: string;
  productId?: string;
  productHandle?: string;
  occurrences: number;
  exampleQueries: string[];
  firstSeen: Date;
  lastSeen: Date;
}

// Extract conversations from Chatwoot (last N days)
async function extractChatwootConversations(days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  
  // Query Chatwoot API
  const conversations = await prisma.chatwootConversation.findMany({
    where: {
      createdAt: { gte: since }
    },
    include: {
      messages: true
    }
  });
  
  return conversations;
}

// Embed sanitized conversations
export async function embedConversations() {
  console.log("[CX Mining] Extracting conversations");
  
  // 1. Extract last 30 days
  const conversations = await extractChatwootConversations(30);
  
  console.log(`[CX Mining] Found ${conversations.length} conversations`);
  
  // 2. Sanitize each conversation
  const sanitized = conversations.map(conv => {
    const messages = sanitizeConversation(conv.messages);
    
    // Combine messages into single text
    const text = messages
      .map(m => `${m.messageType}: ${m.content}`)
      .join('\n');
    
    return {
      conversationId: conv.id,
      text,
      productMentions: extractProductMentions(text), // Extract product handles
      createdAt: conv.createdAt
    };
  });
  
  // 3. Embed into pgvector (cx_embeddings table)
  for (const conv of sanitized) {
    const embeddingVector = await embedding.getTextEmbedding(conv.text);
    
    await prisma.$executeRaw`
      INSERT INTO cx_embeddings (
        conversation_id, text, embedding, product_handles, created_at
      )
      VALUES (
        ${conv.conversationId}, ${conv.text}, ${embeddingVector}::vector,
        ${JSON.stringify(conv.productMentions)}, ${conv.createdAt}
      )
      ON CONFLICT (conversation_id) DO UPDATE SET
        text = EXCLUDED.text,
        embedding = EXCLUDED.embedding,
        product_handles = EXCLUDED.product_handles
    `;
  }
  
  console.log(`[CX Mining] ✅ Embedded ${sanitized.length} conversations`);
  
  return sanitized.length;
}

// Detect recurring themes
export async function detectRecurringThemes(
  minOccurrences: number = 3,
  days: number = 7
): Promise<ConversationTheme[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  
  // Query for common patterns (using pgvector similarity)
  const themes: ConversationTheme[] = [];
  
  // Common query patterns to search for
  const queryPatterns = [
    "size chart",
    "sizing guide",
    "product dimensions",
    "how to install",
    "warranty information",
    "return policy",
    "shipping time",
    "in stock",
    "when restock"
  ];
  
  for (const pattern of queryPatterns) {
    const patternEmbedding = await embedding.getTextEmbedding(pattern);
    
    // Find similar conversations (last 7 days)
    const similar = await prisma.$queryRaw`
      SELECT conversation_id, text, product_handles, created_at,
             (embedding <=> ${patternEmbedding}::vector) AS distance
      FROM cx_embeddings
      WHERE created_at >= ${since}
        AND (embedding <=> ${patternEmbedding}::vector) < 0.35
      ORDER BY distance ASC
      LIMIT 50
    `;
    
    if (similar.length >= minOccurrences) {
      // Extract product mentions
      const productCounts = new Map<string, number>();
      similar.forEach((s: any) => {
        const products = JSON.parse(s.product_handles || '[]');
        products.forEach((p: string) => {
          productCounts.set(p, (productCounts.get(p) || 0) + 1);
        });
      });
      
      // Top product for this theme
      const topProduct = Array.from(productCounts.entries())
        .sort((a, b) => b[1] - a[1])[0];
      
      if (topProduct) {
        themes.push({
          theme: pattern,
          productHandle: topProduct[0],
          occurrences: similar.length,
          exampleQueries: similar.slice(0, 3).map((s: any) => s.text.substring(0, 100)),
          firstSeen: new Date(Math.min(...similar.map((s: any) => s.created_at.getTime()))),
          lastSeen: new Date(Math.max(...similar.map((s: any) => s.created_at.getTime())))
        });
      }
    }
  }
  
  return themes.sort((a, b) => b.occurrences - a.occurrences);
}

// Generate Action cards from themes
export async function generateCXProductActions() {
  const themes = await detectRecurringThemes(3, 7);
  
  const actions = [];
  
  for (const theme of themes.slice(0, 5)) {
    // Get product details
    const product = await getShopifyProductByHandle(theme.productHandle);
    
    if (!product) continue;
    
    actions.push({
      type: 'content',
      title: `Add ${theme.theme} to ${product.title}`,
      description: `${theme.occurrences} customers asked about "${theme.theme}" in the last 7 days. Adding this to the product page may reduce support volume and increase conversions.`,
      expectedRevenue: theme.occurrences * 50, // Estimate: $50/customer saved time
      confidence: 0.8,
      ease: 0.6,
      evidenceUrl: `/api/cx-themes/${theme.theme}`,
      affectedEntities: [theme.productHandle],
      metadata: {
        theme: theme.theme,
        occurrences: theme.occurrences,
        exampleQueries: theme.exampleQueries
      }
    });
  }
  
  return actions;
}

// Nightly job
export async function runNightlyCXMining() {
  console.log("[CX Mining] Starting nightly conversation analysis");
  
  // 1. Embed new conversations
  const embedded = await embedConversations();
  
  // 2. Detect themes
  const themes = await detectRecurringThemes(3, 7);
  
  console.log(`[CX Mining] Found ${themes.length} recurring themes`);
  
  // 3. Generate actions (handed off to Product agent)
  const actions = await generateCXProductActions();
  
  console.log(`[CX Mining] Generated ${actions.length} Action cards`);
  
  return { embedded, themes: themes.length, actions: actions.length };
}
```

**Tests**: `tests/unit/services/ai-knowledge/cx-conversation-mining.spec.ts`
- Test extract conversations
- Test sanitize + embed
- Test detect themes (with similarity search)
- Test generate actions from themes
- Mock Chatwoot API, OpenAI embeddings, Prisma pgvector queries

**Acceptance**:
- ✅ PII sanitizer implemented
- ✅ Conversation embedding service (sanitize + embed)
- ✅ Theme detection (pgvector similarity search)
- ✅ Action card generation
- ✅ Nightly job script
- ✅ Unit tests passing
- ✅ NO PII in embeddings (verified in tests)

**MCP Required**: 
- Context7 → LlamaIndex embeddings, OpenAI API
- Context7 → Prisma pgvector queries (similarity search)

---

## 📋 Acceptance Criteria (All Tasks)

### Phase 12: CX → Product Loop (4h)
- ✅ AI-KNOWLEDGE-017: PII sanitization service (regex patterns, conversation sanitizer)
- ✅ AI-KNOWLEDGE-018: CX conversation mining (embed, theme detection, Action generation, nightly job)
- ✅ All unit tests passing
- ✅ NO PII in embeddings (verified)
- ✅ TypeScript clean, no linter errors

---

## 🔧 Tools & Resources

### MCP Tools (MANDATORY)
1. **Context7 MCP**: For all service development
   - LlamaIndex embeddings, pgvector
   - OpenAI API (text-embedding-3-small)
   - Prisma pgvector queries (similarity search)
   - TypeScript regex patterns

2. **Web Search**: LAST RESORT ONLY

### Evidence Requirements (CI Merge Blockers)
1. **MCP Evidence JSONL**: `artifacts/ai-knowledge/<date>/mcp/cx-conversation-mining.jsonl`
2. **Heartbeat NDJSON**: `artifacts/ai-knowledge/<date>/heartbeat.ndjson` (append every 15min if >2h)
3. **Dev MCP Check**: Verify NO Dev MCP imports in `app/`
4. **PR Template**: Fill out all sections

### Testing
- Unit tests for PII sanitization (verify NO PII in output)
- Mock Chatwoot API, OpenAI embeddings
- Test pgvector similarity queries
- Test Action card generation

---

## 🎯 Execution Order

**START NOW** - No idle time:

1. **AI-KNOWLEDGE-017**: PII Sanitization Service (1h) → START IMMEDIATELY
   - Pull Context7: TypeScript regex patterns
   - Implement PII sanitizer (email, phone, address, postal, CC)
   - Implement conversation sanitizer
   - Write unit tests (verify NO PII in output)

2. **AI-KNOWLEDGE-018**: CX Conversation Mining (3h)
   - Pull Context7: LlamaIndex, OpenAI, Prisma pgvector
   - Implement extract + sanitize + embed
   - Implement theme detection (similarity search)
   - Implement Action card generation
   - Create nightly job script
   - Write unit tests

**Total**: 4 hours

**Expected Output**:
- 2 new services (~500-600 lines)
- 1 nightly job script
- 30+ unit tests
- NO PII in embeddings (verified in tests)

---

## 🚨 Critical Reminders

1. **NO IDLE**: Start AI-KNOWLEDGE-017 immediately
2. **MCP FIRST**: Pull Context7 docs BEFORE every task
3. **Evidence JSONL**: Create `artifacts/ai-knowledge/2025-10-21/mcp/` and log every MCP call
4. **Heartbeat**: If >2h, append to `artifacts/ai-knowledge/2025-10-21/heartbeat.ndjson` every 15min
5. **PII SAFETY**: CRITICAL - verify NO PII in embeddings (test thoroughly)
6. **pgvector**: Use existing knowledge_base setup patterns
7. **Dependencies**: Coordinate with Product agent for Action card handoff
8. **Feedback**: Update `feedback/ai-knowledge/2025-10-21.md` every 2 hours

**Questions or blockers?** → Escalate immediately in feedback

**Let's build! 🧠**

---

## 🔧 MANDATORY: DEV MEMORY

```typescript
import { logDecision } from '~/services/decisions.server';
await logDecision({
  scope: 'build',
  actor: 'ai-knowledge',
  action: 'task_completed',
  rationale: 'Task description with test results',
  evidenceUrl: 'artifacts/ai-knowledge/2025-10-21/task-complete.md'
});
```

Call at EVERY task completion. 100% DB protection active.
