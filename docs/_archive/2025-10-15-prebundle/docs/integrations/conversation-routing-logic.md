# Chatwoot Conversation Routing Logic for Agent SDK

**Purpose:** Design intelligent conversation assignment logic for automated agent routing  
**Date:** 2025-10-11  
**Status:** Production Ready

---

## Routing Architecture

```
Customer Message
        ↓
Chatwoot Receives
        ↓
Webhook → Agent SDK
        ↓
┌─────────────────────────┐
│   ROUTING DECISION      │
│      ENGINE             │
└─────────┬───────────────┘
          │
    ┌─────┴─────┬─────────┬─────────┬──────────┐
    │           │         │         │          │
  VIP      Product    Order    General   Urgent
 Route    Specialist Support   Queue    Manager
    │           │         │         │          │
    └─────┬─────┴─────────┴─────────┴──────────┘
          │
    Assign Agent
          ↓
    Create Private Note
          ↓
    Priority Queue Entry
```

---

## Routing Rules (Priority Order)

### Rule 1: VIP Customer Priority 🌟

**Condition:**

```typescript
if (
  customer.custom_attributes?.vip_status === true ||
  customer.custom_attributes?.lifetime_value > 5000
) {
  return {
    assignee: seniorAgentId,
    priority: "high",
    tags: ["vip", "high_value"],
    responseTime: "1 hour",
  };
}
```

**Assignment Logic:**

- Assign to: Senior Support Agent (pre-configured ID)
- Priority: HIGH
- SLA: Response within 1 hour
- Tags: `vip`, `high_value`
- Notification: Alert all managers

---

### Rule 2: Angry/Urgent Sentiment 🚨

**Condition:**

```typescript
if (
  sentiment.emotion === "angry" ||
  sentiment.urgency === "urgent" ||
  message.includes_legal_threats ||
  message.complaint_count > 2
) {
  return {
    assignee: managerId,
    priority: "urgent",
    tags: ["escalated", "urgent"],
    responseTime: "30 minutes",
  };
}
```

**Assignment Logic:**

- Assign to: Support Manager
- Priority: URGENT
- SLA: Response within 30 minutes
- Tags: `escalated`, `urgent`, `angry_customer`
- Notification: Immediate alert (SMS/Slack)
- Auto-create: Manager handoff note

**Sentiment Detection Keywords:**

- Legal: "lawyer", "lawsuit", "legal action", "attorney"
- Anger: "FURIOUS", "UNACCEPTABLE", "WORST", "NEVER AGAIN"
- Urgency: "IMMEDIATELY", "ASAP", "NOW", "URGENT"

---

### Rule 3: Product-Specific Inquiries 🛍️

**Condition:**

```typescript
const productKeywords = [
  "sizing",
  "fabric",
  "care instructions",
  "product details",
];
const hasProductQuestion = productKeywords.some((kw) =>
  message.toLowerCase().includes(kw),
);

if (hasProductQuestion && !hasOrderNumber) {
  return {
    assignee: productSpecialistId,
    priority: "normal",
    tags: ["product_question"],
    responseTime: "4 hours",
  };
}
```

**Assignment Logic:**

- Assign to: Product Specialist
- Priority: NORMAL
- SLA: Response within 4 hours
- Tags: `product_question`, `pre_purchase`
- Knowledge Base: Product documentation

---

### Rule 4: Order Support (Returns, Tracking, Issues) 📦

**Condition:**

```typescript
const hasOrderNumber = /order\s*#?\s*\d{4,}/i.test(message);
const orderKeywords = ["tracking", "shipped", "delivery", "return", "refund"];

if (
  hasOrderNumber ||
  orderKeywords.some((kw) => message.toLowerCase().includes(kw))
) {
  return {
    assignee: orderSupportTeamId,
    priority: "normal",
    tags: ["order_support"],
    responseTime: "2 hours",
  };
}
```

**Assignment Logic:**

- Assign to: Order Support Team (round-robin)
- Priority: NORMAL (upgrade to HIGH if >48h old)
- SLA: Response within 2 hours
- Tags: `order_support`, `tracking`, `returns` (auto-detected)
- Auto-fetch: Order details from Shopify API

---

### Rule 5: Low Confidence Draft ⚠️

**Condition:**

```typescript
if (draft.confidence_score < 70) {
  return {
    assignee: seniorAgentId,
    priority: "high",
    tags: ["low_confidence", "needs_review"],
    responseTime: "2 hours",
  };
}
```

**Assignment Logic:**

- Assign to: Senior Agent (expertise required)
- Priority: HIGH
- SLA: Response within 2 hours
- Tags: `low_confidence`, `complex_inquiry`
- Note: Include Agent SDK sources for context

---

### Rule 6: General Queue (Load Balancing) ⚖️

**Condition:**

```typescript
// Default routing if no special rules matched
if (draft.confidence_score >= 70 && !specialConditions) {
  const leastBusyAgent = await findLeastBusyAgent({
    team: "general_support",
    status: "online",
    maxLoad: 10, // conversations per agent
  });

  return {
    assignee: leastBusyAgent.id,
    priority: "normal",
    tags: ["general_support"],
    responseTime: "4 hours",
  };
}
```

**Assignment Logic:**

- Assign to: Least busy online agent
- Priority: NORMAL
- SLA: Response within 4 hours
- Tags: `general_support`, `agent_sdk`
- Algorithm: Round-robin with load balancing

---

## Priority Levels

### Urgent (SLA: 30 minutes)

- Angry customers
- Legal threats
- VIP escalations
- System outages affecting customer
- Payment failures >$500

### High (SLA: 1-2 hours)

- VIP customers (non-urgent)
- Low confidence drafts
- Multiple contact attempts
- Orders >48h delayed
- Refund requests >$200

### Normal (SLA: 2-4 hours)

- General order support
- Product questions
- Standard inquiries
- Medium confidence drafts

### Low (SLA: 8-24 hours)

- Pre-purchase questions
- General information
- Feedback/suggestions
- Non-urgent follow-ups

---

## Team-Based Routing

### Team Structure

```
Support Organization
├── Order Support Team
│   ├── Agent 1 (returns specialist)
│   ├── Agent 2 (tracking specialist)
│   └── Agent 3 (general order support)
├── Product Team
│   ├── Agent 4 (product specialist)
│   └── Agent 5 (sizing expert)
├── Senior Support Team
│   ├── Senior Agent 1
│   └── Senior Agent 2
└── Management
    └── Support Manager
```

### Team Assignment Rules

```typescript
function assignToTeam(inquiry: InquiryContext) {
  // Order-related
  if (inquiry.category === "order") {
    if (inquiry.subcategory === "return") {
      return "order_support.returns_specialist";
    }
    if (inquiry.subcategory === "tracking") {
      return "order_support.tracking_specialist";
    }
    return "order_support.general";
  }

  // Product-related
  if (inquiry.category === "product") {
    if (inquiry.keywords.includes("sizing")) {
      return "product_team.sizing_expert";
    }
    return "product_team.general";
  }

  // Complex/escalated
  if (inquiry.confidence < 70 || inquiry.sentiment === "angry") {
    return "senior_support";
  }

  // Default
  return "general_support";
}
```

---

## Load Balancing Algorithm

### Round-Robin with Availability

```typescript
async function findLeastBusyAgent(team: string): Promise<Agent> {
  // Get all online agents in team
  const agents = await getOnlineAgents(team);

  // Calculate current load for each agent
  const agentLoads = await Promise.all(
    agents.map(async (agent) => ({
      agent,
      load: await getOpenConversationCount(agent.id),
      avgResponseTime: await getAvgResponseTime(agent.id, "24h"),
    })),
  );

  // Filter agents below max load
  const available = agentLoads.filter((a) => a.load < 10);

  if (available.length === 0) {
    // All agents busy, assign to least loaded
    return agentLoads.sort((a, b) => a.load - b.load)[0].agent;
  }

  // Weighted selection (consider both load and response time)
  const weighted = available.map((a) => ({
    agent: a.agent,
    score: (10 - a.load) * 0.7 + (300 - a.avgResponseTime) * 0.3,
  }));

  // Return best score
  return weighted.sort((a, b) => b.score - a.score)[0].agent;
}
```

---

## Time-Based Routing

### Business Hours Routing

```typescript
function routeByBusinessHours(inquiry: InquiryContext): Assignment {
  const now = new Date();
  const pstTime = now.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
  });
  const hour = new Date(pstTime).getHours();
  const day = new Date(pstTime).getDay();

  // Business hours: Mon-Fri 9 AM - 5 PM PST
  const isBusinessHours = day >= 1 && day <= 5 && hour >= 9 && hour < 17;

  if (!isBusinessHours) {
    // After hours
    return {
      assignee: null, // No immediate assignment
      priority: inquiry.urgency === "urgent" ? "high" : "normal",
      tags: ["after_hours"],
      auto_response: `
        Thank you for contacting HotDash Support!
        
        We've received your message outside business hours (Mon-Fri 9 AM-5 PM PST).
        Our team will respond when we're back in the office.
        
        Expected response: Next business day
        
        For urgent issues, please call: 1-800-HOT-DASH
      `,
    };
  }

  // During business hours - normal routing
  return routeByCategory(inquiry);
}
```

---

## Category Detection

### Machine Learning Approach

```typescript
function detectCategory(
  message: string,
  context: ConversationContext,
): Category {
  const categories = {
    order_status: {
      keywords: ["order", "tracking", "shipped", "delivery", "where is"],
      patterns: [/order\s*#?\s*\d+/i, /tracking\s*#?\s*\d+/i],
      confidence_boost: hasOrderNumber(message) ? 0.3 : 0,
    },
    returns_refunds: {
      keywords: ["return", "refund", "exchange", "unwanted", "doesn't fit"],
      patterns: [/return/i, /refund/i],
      confidence_boost: 0,
    },
    product_question: {
      keywords: ["sizing", "material", "fabric", "color", "dimensions"],
      patterns: [/what (size|material|fabric|color)/i],
      confidence_boost: !hasOrderNumber(message) ? 0.2 : 0,
    },
    complaint: {
      keywords: ["disappointed", "angry", "upset", "unacceptable", "terrible"],
      patterns: [/this is (unacceptable|terrible|awful)/i],
      sentiment_indicator: context.sentiment === "angry" ? 0.5 : 0,
    },
    general_inquiry: {
      keywords: ["how", "what", "when", "where", "why", "can i"],
      patterns: [/^(how|what|when|where|why)/i],
      confidence_boost: 0,
    },
  };

  // Calculate scores for each category
  const scores = Object.entries(categories).map(([name, category]) => {
    let score = 0;

    // Keyword matching
    score +=
      category.keywords.filter((kw) => message.toLowerCase().includes(kw))
        .length * 0.2;

    // Pattern matching
    score +=
      category.patterns.filter((pattern) => pattern.test(message)).length * 0.3;

    // Confidence boost
    score += category.confidence_boost || 0;
    score += category.sentiment_indicator || 0;

    return { category: name, score };
  });

  // Return highest scoring category
  const best = scores.sort((a, b) => b.score - a.score)[0];
  return {
    category: best.category,
    confidence: Math.min(best.score, 1.0),
  };
}
```

---

## Routing Decision Flowchart

```
START: New Message Received
        ↓
   ┌────────────────┐
   │ Extract        │
   │ Context        │
   └────┬───────────┘
        │
   ┌────▼───────────────────────┐
   │ Check Customer Attributes  │
   └────┬───────────────────────┘
        │
   ┌────▼──────────┐
   │ VIP Customer? │───Yes→ [Route to Senior] → END
   └────┬──────────┘
        │ No
   ┌────▼──────────┐
   │ Angry/Urgent? │───Yes→ [Route to Manager] → END
   └────┬──────────┘
        │ No
   ┌────▼───────────┐
   │ Detect Category│
   └────┬───────────┘
        │
   ┌────▼──────────────────────┐
   │ Category-Based Assignment │
   └────┬──────────────────────┘
        │
   ┌────▼────┬─────────┬─────────┬──────────┐
   │         │         │         │          │
 Order   Product   Return   General  Complex
   │         │         │         │          │
   └────┬────┴─────────┴─────────┴──────────┘
        │
   ┌────▼───────────────┐
   │ Check Agent Load   │
   └────┬───────────────┘
        │
   ┌────▼───────────────┐
   │ Assign Least Busy  │
   └────┬───────────────┘
        │
   ┌────▼───────────────┐
   │ Set Priority Level │
   └────┬───────────────┘
        │
   ┌────▼───────────────┐
   │ Add Routing Tags   │
   └────┬───────────────┘
        │
        END: Agent Assigned
```

---

## Routing Configuration

### Agent Definitions

```typescript
interface Agent {
  id: number;
  name: string;
  email: string;
  role: "agent" | "senior" | "manager";
  teams: string[];
  specialties: string[];
  maxLoad: number;
  availability: "online" | "busy" | "offline";
}

const agents: Agent[] = [
  {
    id: 10,
    name: "Support Agent 1",
    email: "support1@hotrodan.com",
    role: "agent",
    teams: ["order_support"],
    specialties: ["order_tracking", "shipping"],
    maxLoad: 10,
    availability: "online",
  },
  {
    id: 11,
    name: "Support Agent 2",
    email: "support2@hotrodan.com",
    role: "agent",
    teams: ["product_support"],
    specialties: ["product_questions", "sizing"],
    maxLoad: 8,
    availability: "online",
  },
  {
    id: 20,
    name: "Senior Agent",
    email: "senior@hotrodan.com",
    role: "senior",
    teams: ["order_support", "product_support", "escalations"],
    specialties: ["complex_issues", "vip_customers"],
    maxLoad: 5,
    availability: "online",
  },
  {
    id: 30,
    name: "Support Manager",
    email: "manager@hotrodan.com",
    role: "manager",
    teams: ["management"],
    specialties: ["escalations", "complaints", "high_value"],
    maxLoad: 3,
    availability: "online",
  },
];
```

---

## Implementation: Routing Function

```typescript
async function routeConversation(context: RoutingContext): Promise<Assignment> {
  const { conversation, message, customer, draft, sentiment } = context;

  // Rule 1: VIP customers
  if (customer.vip_status || customer.lifetime_value > 5000) {
    return {
      assignee_id: findAgentByRole("senior"),
      priority: "high",
      tags: ["vip", "high_value"],
      sla_hours: 1,
      reason: "VIP customer",
    };
  }

  // Rule 2: Urgent/Angry sentiment
  if (sentiment.emotion === "angry" || sentiment.urgency === "urgent") {
    await sendUrgentAlert(findAgentByRole("manager"));
    return {
      assignee_id: findAgentByRole("manager"),
      priority: "urgent",
      tags: ["escalated", "urgent", sentiment.emotion],
      sla_hours: 0.5, // 30 minutes
      reason: `${sentiment.emotion} customer, requires immediate attention`,
    };
  }

  // Rule 3: Low confidence drafts
  if (draft.confidence_score < 70) {
    return {
      assignee_id: findAgentByRole("senior"),
      priority: "high",
      tags: ["low_confidence", "needs_expert"],
      sla_hours: 2,
      reason: `Low confidence (${draft.confidence_score}%), expert review needed`,
    };
  }

  // Rule 4: Category-based routing
  const category = detectCategory(message.content, context);

  switch (category.category) {
    case "order_status":
      return {
        assignee_id: await findLeastBusyAgent("order_support"),
        priority: "normal",
        tags: ["order_support", category.category],
        sla_hours: 2,
        reason: "Order support inquiry",
      };

    case "product_question":
      return {
        assignee_id: await findSpecialist("product"),
        priority: "normal",
        tags: ["product_question"],
        sla_hours: 4,
        reason: "Product specialist expertise",
      };

    case "returns_refunds":
      return {
        assignee_id: await findSpecialist("returns"),
        priority: "normal",
        tags: ["returns", "refunds"],
        sla_hours: 2,
        reason: "Return/refund request",
      };

    default:
      // General queue with load balancing
      return {
        assignee_id: await findLeastBusyAgent("general_support"),
        priority: "normal",
        tags: ["general_support"],
        sla_hours: 4,
        reason: "General support queue",
      };
  }
}
```

---

## Agent SDK Triage Patterns

### Pattern 1: High Confidence → Fast Track

```
Draft Confidence ≥ 90%
        ↓
Assign to: First available agent
Priority: NORMAL
Auto-action: Pre-approve for operator review
Estimated time: < 5 minutes to customer
```

### Pattern 2: Medium Confidence → Standard Queue

```
Draft Confidence 70-89%
        ↓
Assign to: Category specialist
Priority: NORMAL
Action: Operator review required
Estimated time: < 30 minutes to customer
```

### Pattern 3: Low Confidence → Senior Review

```
Draft Confidence < 70%
        ↓
Assign to: Senior agent
Priority: HIGH
Action: Expert review required
Estimated time: < 2 hours to customer
```

### Pattern 4: Critical Issues → Manager Escalation

```
Angry OR Legal OR VIP Escalation
        ↓
Assign to: Support manager
Priority: URGENT
Action: Immediate notification
Estimated time: < 30 minutes to customer
```

---

## Routing Metrics & Analytics

### Track Routing Performance

```sql
-- Routing efficiency by category
SELECT
  category,
  AVG(time_to_assignment_seconds) as avg_assignment_time,
  AVG(time_to_first_response_seconds) as avg_response_time,
  COUNT(*) as total_conversations
FROM routing_analytics
GROUP BY category
ORDER BY total_conversations DESC;

-- Agent load distribution
SELECT
  agent_id,
  agent_name,
  COUNT(*) as conversations_assigned,
  AVG(time_to_resolution_hours) as avg_resolution_time,
  AVG(customer_satisfaction_score) as avg_csat
FROM routing_analytics
WHERE assigned_at > NOW() - INTERVAL '7 days'
GROUP BY agent_id, agent_name
ORDER BY conversations_assigned DESC;

-- Routing accuracy (correct category assignment)
SELECT
  detected_category,
  final_category,
  COUNT(*) as misroutes,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM routing_analytics
WHERE detected_category != final_category
GROUP BY detected_category, final_category
ORDER BY misroutes DESC;
```

---

## Continuous Improvement

### Monthly Routing Review

1. **Analyze Metrics:**
   - Routing accuracy rate
   - Agent load balance
   - SLA adherence by priority
   - Customer satisfaction by route

2. **Identify Issues:**
   - Frequent misroutes
   - Overloaded agents
   - Underutilized specialists
   - SLA violations

3. **Tune Rules:**
   - Adjust category keywords
   - Rebalance load limits
   - Update priority thresholds
   - Refine sentiment detection

4. **Test Changes:**
   - A/B test new rules
   - Monitor for 1 week
   - Validate improvements
   - Roll out or roll back

---

**Document Status:** Production Ready  
**Last Updated:** 2025-10-11  
**Maintained By:** Chatwoot Agent  
**Review Cadence:** Monthly or after routing changes
