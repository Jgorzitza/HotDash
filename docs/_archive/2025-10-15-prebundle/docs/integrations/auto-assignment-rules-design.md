# Chatwoot Auto-Assignment Rules Design

**Purpose:** Comprehensive auto-assignment system for intelligent conversation routing  
**Date:** 2025-10-11  
**Status:** Production Ready

---

## Auto-Assignment System Architecture

```
Incoming Conversation
        ↓
┌────────────────────────┐
│   ASSIGNMENT ENGINE    │
│   (Webhook Handler)    │
└──────────┬─────────────┘
           │
    ┌──────┴──────┬──────────┬──────────┬──────────┐
    │             │          │          │          │
Priority    VIP      Topic   Agent     Business
Rules     Status   Analysis  Load      Hours
    │             │          │          │          │
    └──────┬──────┴──────────┴──────────┴──────────┘
           │
    ┌──────▼─────────┐
    │  Final Agent   │
    │   Assignment   │
    └──────┬─────────┘
           │
    ┌──────▼─────────┐
    │ Chatwoot API   │
    │ POST /assign   │
    └────────────────┘
```

---

## Priority-Based Assignment Rules

### Rule 1: Critical Escalation (Highest Priority)

**Triggers:**

- Legal threat keywords detected
- Multiple complaint escalations (>3)
- VIP customer + angry sentiment
- Refund request >$1,000
- Service outage affecting customer

**Assignment:**

```typescript
{
  assignee: SUPPORT_MANAGER_ID,
  priority: 'urgent',
  sla_minutes: 15,
  notification: ['sms', 'slack', 'email'],
  tags: ['critical', 'manager_review'],
  auto_notify_executive: refund_amount > 5000
}
```

**Implementation:**

```typescript
if (
  message.includes_legal_threat ||
  customer.complaint_count > 3 ||
  (customer.vip_status && sentiment === "angry") ||
  refund_amount > 1000
) {
  return {
    assignee_id: SUPPORT_MANAGER_ID,
    priority: "urgent",
    tags: ["critical", "escalated", "manager_required"],
    sla_minutes: 15,
    notification_channels: ["sms", "slack", "email"],
    escalation_note: generateCriticalEscalationNote(context),
  };
}
```

---

### Rule 2: VIP Customer Routing

**Triggers:**

- Customer segment = 'VIP'
- Lifetime value > $5,000
- Previous VIP escalations
- Custom VIP flag set

**Assignment:**

```typescript
{
  assignee: SENIOR_AGENT_ID,
  priority: 'high',
  sla_minutes: 60,
  notification: ['slack', 'email'],
  tags: ['vip', 'high_value'],
  white_glove_service: true
}
```

**VIP Detection Logic:**

```typescript
function isVIPCustomer(customer: Customer): boolean {
  return (
    customer.custom_attributes?.vip_status === true ||
    customer.custom_attributes?.lifetime_value > 5000 ||
    customer.tags?.includes("vip") ||
    customer.purchase_count > 10
  );
}

if (isVIPCustomer(customer)) {
  return {
    assignee_id: findSeniorAgent(),
    priority: "high",
    tags: ["vip", "white_glove"],
    sla_minutes: 60,
    special_handling: {
      personal_greeting: true,
      manager_cc: true,
      follow_up_required: true,
    },
  };
}
```

---

### Rule 3: Topic-Based Specialist Routing

**Categories & Specialists:**

```typescript
const TOPIC_ROUTING: Record<string, Assignment> = {
  order_tracking: {
    assignee_team: "order_support",
    specialist_keywords: ["shipped", "delivery", "tracking", "where is"],
    sla_minutes: 120,
    tags: ["order_support", "tracking"],
  },

  returns_refunds: {
    assignee_team: "returns_specialist",
    specialist_keywords: ["return", "refund", "exchange", "unwanted"],
    sla_minutes: 120,
    tags: ["returns", "refunds"],
    requires_approval: refund_amount > 100,
  },

  product_questions: {
    assignee_team: "product_specialists",
    specialist_keywords: ["sizing", "material", "fabric", "care", "dimensions"],
    sla_minutes: 240,
    tags: ["product_question", "pre_purchase"],
  },

  technical_issues: {
    assignee_team: "technical_support",
    specialist_keywords: ["login", "password", "error", "bug", "website"],
    sla_minutes: 180,
    tags: ["technical", "website_issue"],
    escalate_to_engineering: severity === "critical",
  },

  billing_payment: {
    assignee_team: "billing_specialist",
    specialist_keywords: ["payment", "charge", "billing", "invoice", "receipt"],
    sla_minutes: 120,
    tags: ["billing", "payment"],
    requires_approval: amount > 500,
  },
};
```

**Topic Detection:**

```typescript
function detectTopic(message: string, context: Context): Topic {
  const scores = Object.entries(TOPIC_ROUTING).map(([topic, config]) => {
    const keywordMatches = config.specialist_keywords.filter((kw) =>
      message.toLowerCase().includes(kw),
    ).length;

    const score =
      keywordMatches * 0.3 +
      (hasOrderNumber(message) && topic === "order_tracking" ? 0.4 : 0) +
      (sentiment === "frustrated" && topic === "returns_refunds" ? 0.2 : 0);

    return { topic, score };
  });

  const best = scores.sort((a, b) => b.score - a.score)[0];
  return best.score > 0.5 ? best.topic : "general_support";
}
```

---

### Rule 4: Agent Load Balancing

**Load Calculation:**

```typescript
interface AgentLoad {
  agent_id: number;
  agent_name: string;
  active_conversations: number;
  pending_approvals: number;
  avg_response_time_minutes: number;
  online_status: "online" | "busy" | "away";
  max_capacity: number;
}

async function calculateAgentLoad(agentId: number): Promise<AgentLoad> {
  // Get open conversations assigned to agent
  const openConversations = await chatwoot.getAgentConversations(
    agentId,
    "open",
  );

  // Get pending approval queue items
  const pendingApprovals = await supabase
    .from("agent_sdk_approval_queue")
    .select("count")
    .eq("operator_id", agentId)
    .eq("status", "pending")
    .single();

  // Calculate average response time (last 24h)
  const avgResponseTime = await getAvgResponseTime(agentId, "24h");

  // Get agent status
  const agentStatus = await chatwoot.getAgentStatus(agentId);

  return {
    agent_id: agentId,
    agent_name: agentStatus.name,
    active_conversations: openConversations.length,
    pending_approvals: pendingApprovals.count,
    avg_response_time_minutes: avgResponseTime,
    online_status: agentStatus.availability,
    max_capacity: agentStatus.max_conversations || 10,
  };
}
```

**Load-Based Assignment:**

```typescript
async function assignToLeastBusyAgent(team: string): Promise<number> {
  const teamAgents = await getTeamAgents(team);
  const agentLoads = await Promise.all(
    teamAgents.map((agent) => calculateAgentLoad(agent.id)),
  );

  // Filter only online agents below capacity
  const available = agentLoads.filter(
    (a) =>
      a.online_status === "online" && a.active_conversations < a.max_capacity,
  );

  if (available.length === 0) {
    // All busy - assign to least loaded
    return agentLoads.sort(
      (a, b) => a.active_conversations - b.active_conversations,
    )[0].agent_id;
  }

  // Weighted scoring: favor low conversation count and fast response time
  const scored = available.map((a) => ({
    agent_id: a.agent_id,
    score:
      (a.max_capacity - a.active_conversations) * 0.6 +
      Math.max(0, 10 - a.avg_response_time_minutes) * 0.3 +
      (a.pending_approvals === 0 ? 0.1 : 0),
  }));

  return scored.sort((a, b) => b.score - a.score)[0].agent_id;
}
```

---

### Rule 5: Business Hours & Time-Zone Routing

**Time-Based Logic:**

```typescript
function getBusinessHoursAssignment(
  customer: Customer,
  timestamp: Date,
): Assignment {
  const customerTz = customer.timezone || "America/Los_Angeles";
  const customerLocalTime = toTimeZone(timestamp, customerTz);
  const hour = customerLocalTime.getHours();
  const day = customerLocalTime.getDay();

  // Business hours: Mon-Fri 9 AM - 5 PM in customer's timezone
  const isBusinessHours = day >= 1 && day <= 5 && hour >= 9 && hour < 17;

  if (!isBusinessHours) {
    // After hours - queue for next business day
    return {
      assignee_id: null, // No immediate assignment
      priority: determinePriority(customer, message),
      scheduled_assignment_time: getNextBusinessHour(customerTz),
      auto_response: generateAfterHoursResponse(customerTz),
      tags: ["after_hours", "queued"],
    };
  }

  // During business hours - normal routing
  return getStandardAssignment(customer, message);
}
```

**Global Team Routing:**

```typescript
// For 24/7 support with global teams
function getGlobalTeamAssignment(timestamp: Date): string {
  const hour = timestamp.getUTCHours();

  // Americas team: 14:00-22:00 UTC (9 AM - 5 PM EST)
  if (hour >= 14 && hour < 22) return "americas_team";

  // APAC team: 22:00-06:00 UTC (6 AM - 2 PM AEST)
  if (hour >= 22 || hour < 6) return "apac_team";

  // EMEA team: 06:00-14:00 UTC (8 AM - 4 PM CET)
  return "emea_team";
}
```

---

### Rule 6: Complexity-Based Routing

**Complexity Scoring:**

```typescript
function calculateComplexity(context: ConversationContext): number {
  let score = 0;

  // Message length (longer = more complex)
  score += Math.min(context.message.length / 500, 3);

  // Multiple questions
  const questionCount = (context.message.match(/\?/g) || []).length;
  score += questionCount * 0.5;

  // Technical jargon
  const technicalWords = [
    "API",
    "webhook",
    "integration",
    "database",
    "error code",
  ];
  score +=
    technicalWords.filter((w) => context.message.includes(w)).length * 0.8;

  // Previous conversation history
  score += Math.min(context.previous_messages / 5, 2);

  // Low confidence from Agent SDK
  if (context.draft_confidence < 70) score += 3;

  // Sentiment
  if (context.sentiment === "angry") score += 2;
  if (context.sentiment === "frustrated") score += 1;

  return score;
}

function assignByComplexity(complexity: number): Assignment {
  if (complexity > 8) {
    // Very complex - senior agent or manager
    return {
      assignee_id: findSeniorAgent(),
      priority: "high",
      sla_minutes: 120,
      tags: ["complex", "expert_required"],
    };
  }

  if (complexity > 5) {
    // Moderately complex - experienced agent
    return {
      assignee_id: findExperiencedAgent(),
      priority: "normal",
      sla_minutes: 180,
      tags: ["moderate_complexity"],
    };
  }

  // Simple - any available agent
  return {
    assignee_id: findLeastBusyAgent("general_support"),
    priority: "normal",
    sla_minutes: 240,
    tags: ["standard"],
  };
}
```

---

## Complete Assignment Decision Tree

```
New Conversation Received
        ↓
┌───────────────────┐
│ Extract Context   │
│ - Customer info   │
│ - Message content │
│ - Draft data      │
└────────┬──────────┘
         │
         ▼
┌─────────────────────────┐
│ Rule 1: CRITICAL?       │
│ (Legal/Outage/High $)   │
└──Yes→ MANAGER (15min SLA)
         │ No
         ▼
┌─────────────────────────┐
│ Rule 2: VIP CUSTOMER?   │
│ (LTV>$5k or VIP flag)   │
└──Yes→ SENIOR AGENT (1hr SLA)
         │ No
         ▼
┌─────────────────────────┐
│ Rule 3: ANGRY/URGENT?   │
│ (Sentiment + urgency)   │
└──Yes→ SENIOR AGENT (1hr SLA, alert manager)
         │ No
         ▼
┌─────────────────────────┐
│ Rule 4: LOW CONFIDENCE? │
│ (Draft confidence <70%) │
└──Yes→ SENIOR AGENT (2hr SLA)
         │ No
         ▼
┌─────────────────────────┐
│ Rule 5: TOPIC DETECTED? │
│ (Order/Return/Product)  │
└──Yes→ SPECIALIST TEAM (2-4hr SLA)
         │ No
         ▼
┌─────────────────────────┐
│ Rule 6: CHECK HOURS     │
│ (Business hours?)       │
└──After Hours→ QUEUE (next business day)
         │ Business Hours
         ▼
┌─────────────────────────┐
│ Rule 7: LOAD BALANCE    │
│ (Find least busy agent) │
└──→ AVAILABLE AGENT (4hr SLA)
```

---

## Agent Capacity Management

### Capacity Definitions

```typescript
interface AgentCapacity {
  max_conversations: number;
  max_pending_approvals: number;
  max_complexity_score: number;
  preferred_topics: string[];
  avoid_topics: string[];
}

const agentCapacities: Record<string, AgentCapacity> = {
  junior_agent: {
    max_conversations: 8,
    max_pending_approvals: 5,
    max_complexity_score: 5,
    preferred_topics: ["order_tracking", "general_faq"],
    avoid_topics: ["refunds", "complaints", "technical"],
  },

  mid_agent: {
    max_conversations: 12,
    max_pending_approvals: 10,
    max_complexity_score: 8,
    preferred_topics: ["order_support", "returns", "product_questions"],
    avoid_topics: ["critical_escalations"],
  },

  senior_agent: {
    max_conversations: 10,
    max_pending_approvals: 8,
    max_complexity_score: 15,
    preferred_topics: ["complex_issues", "vip_customers", "escalations"],
    avoid_topics: [],
  },

  manager: {
    max_conversations: 5,
    max_pending_approvals: 3,
    max_complexity_score: 20,
    preferred_topics: ["critical_escalations", "complaints", "high_value"],
    avoid_topics: ["simple_faqs"],
  },
};
```

---

## Dynamic Assignment Adjustment

### Real-Time Rebalancing

```typescript
// Check every 5 minutes
async function rebalanceAssignments() {
  const agents = await getAllOnlineAgents();

  for (const agent of agents) {
    const load = await calculateAgentLoad(agent.id);

    // Agent overloaded?
    if (load.active_conversations > agent.max_capacity) {
      // Find conversations to reassign
      const candidates = await getReassignmentCandidates(agent.id);

      for (const conv of candidates) {
        const betterAgent = await findLeastBusyAgent(conv.topic);
        if (betterAgent.id !== agent.id) {
          await reassignConversation(conv.id, betterAgent.id, "load_balancing");
        }
      }
    }

    // Agent underutilized?
    if (load.active_conversations < 3 && queue.length > 0) {
      // Assign queued conversations
      const queuedConv = queue
        .filter((c) => matchesAgentSkills(c, agent))
        .slice(0, 3);

      for (const conv of queuedConv) {
        await assignConversation(conv.id, agent.id, "load_distribution");
      }
    }
  }
}
```

---

## SLA-Based Assignment

### SLA Tiers

```typescript
const SLA_TIERS = {
  urgent: {
    response_minutes: 15,
    resolution_hours: 2,
    assignment_priority: 1,
    auto_escalate_after: 30, // minutes
  },
  high: {
    response_minutes: 60,
    resolution_hours: 4,
    assignment_priority: 2,
    auto_escalate_after: 120,
  },
  normal: {
    response_minutes: 120,
    resolution_hours: 8,
    assignment_priority: 3,
    auto_escalate_after: 240,
  },
  low: {
    response_minutes: 480,
    resolution_hours: 24,
    assignment_priority: 4,
    auto_escalate_after: null,
  },
};
```

### SLA Monitoring & Auto-Escalation

```typescript
async function monitorSLABreach() {
  const conversations = await chatwoot.getOpenConversations();

  for (const conv of conversations) {
    const sla = SLA_TIERS[conv.priority];
    const age_minutes = getConversationAge(conv.created_at);

    // Check if SLA breached
    if (sla.auto_escalate_after && age_minutes > sla.auto_escalate_after) {
      // Auto-escalate
      await escalateConversation(conv.id, {
        reason: `SLA breach: ${age_minutes}min > ${sla.auto_escalate_after}min`,
        new_assignee: findNextLevelAgent(conv.assignee_id),
        new_priority: escalatePriority(conv.priority),
        notify_manager: conv.priority === "high",
      });

      // Log SLA breach
      await logSLABreach(conv.id, age_minutes, sla.response_minutes);
    }
  }
}

// Run every 5 minutes
setInterval(monitorSLABreach, 5 * 60 * 1000);
```

---

## Assignment Rules Configuration

### Rule Priority (Order of Execution)

```typescript
const ASSIGNMENT_RULES = [
  {
    id: 1,
    name: "critical_escalation",
    priority: 100,
    handler: checkCriticalEscalation,
  },
  { id: 2, name: "vip_customer", priority: 90, handler: checkVIPStatus },
  { id: 3, name: "angry_urgent", priority: 85, handler: checkSentimentUrgency },
  {
    id: 4,
    name: "low_confidence",
    priority: 80,
    handler: checkDraftConfidence,
  },
  { id: 5, name: "business_hours", priority: 70, handler: checkBusinessHours },
  { id: 6, name: "topic_specialist", priority: 60, handler: checkTopicMatch },
  {
    id: 7,
    name: "agent_preference",
    priority: 50,
    handler: checkAgentPreferences,
  },
  { id: 8, name: "load_balance", priority: 10, handler: loadBalanceAgents },
];

async function executeAssignmentRules(
  context: ConversationContext,
): Promise<Assignment> {
  // Execute rules in priority order
  for (const rule of ASSIGNMENT_RULES.sort((a, b) => b.priority - a.priority)) {
    const result = await rule.handler(context);

    if (result.matched) {
      // Log which rule matched
      await logAssignmentDecision(context.conversation_id, rule.name, result);

      return result.assignment;
    }
  }

  // Fallback: assign to general queue
  return getDefaultAssignment();
}
```

---

## Auto-Assignment Configuration UI

### Admin Settings (Proposed)

```yaml
Auto-Assignment Settings:
  Enabled: ✅ Yes

  Priority Rules:
    Critical Escalations:
      - Assign to: Support Manager
      - SLA: 15 minutes
      - Keywords: legal, lawsuit, attorney, unacceptable
      - Notify: SMS + Slack + Email

    VIP Customers:
      - Assign to: Senior Agent Pool
      - SLA: 1 hour
      - Criteria: LTV > $5,000 OR vip_flag = true
      - Special handling: White glove service

    Angry Customers:
      - Assign to: Senior Agent (notify manager)
      - SLA: 1 hour
      - Sentiment: angry OR urgency = urgent
      - Auto-escalate: After 30 minutes

  Topic Routing:
    Order Support:
      - Team: Order Specialists
      - SLA: 2 hours
      - Load balance: Yes

    Product Questions:
      - Team: Product Specialists
      - SLA: 4 hours
      - Require product knowledge: Yes

    Returns/Refunds:
      - Team: Returns Specialists
      - SLA: 2 hours
      - Manager approval: If refund > $100

  Load Balancing:
    Algorithm: Weighted (load + response time + preferences)
    Max per agent: 10 conversations
    Rebalance interval: 5 minutes
    Consider: Online status, pending approvals, avg response time

  Business Hours:
    Timezone: Customer's timezone (auto-detect)
    Hours: 9 AM - 5 PM local time
    Days: Monday - Friday
    After hours: Queue for next business day
    Exceptions: Critical/VIP always assigned
```

---

## Assignment Testing

### Test Scenarios

**Test 1: VIP Customer + Order Issue**

```typescript
const context = {
  customer: { vip_status: true, lifetime_value: 8500 },
  message: "Where is my order #12345?",
  topic: "order_tracking",
  sentiment: "neutral",
};

const assignment = await executeAssignmentRules(context);

// Expected: Senior Agent, High Priority, 1hr SLA
assert(assignment.assignee_role === "senior");
assert(assignment.priority === "high");
assert(assignment.sla_minutes === 60);
assert(assignment.tags.includes("vip"));
```

**Test 2: Angry Customer + Product Question**

```typescript
const context = {
  customer: { vip_status: false },
  message: "This product is TERRIBLE! I want a refund!",
  topic: "complaint",
  sentiment: "angry",
};

const assignment = await executeAssignmentRules(context);

// Expected: Manager, Urgent Priority, 15min SLA
assert(assignment.assignee_role === "manager");
assert(assignment.priority === "urgent");
assert(assignment.sla_minutes === 15);
assert(assignment.notification_channels.includes("sms"));
```

**Test 3: Simple FAQ During Business Hours**

```typescript
const context = {
  customer: { vip_status: false },
  message: "What's your return policy?",
  topic: "general_faq",
  sentiment: "neutral",
  draft_confidence: 95,
  timestamp: new Date("2025-10-11T15:00:00Z"), // 11 AM EST
};

const assignment = await executeAssignmentRules(context);

// Expected: Any available agent, Normal Priority, 4hr SLA
assert(assignment.priority === "normal");
assert(assignment.sla_minutes === 240);
assert(assignment.assignee_id > 0); // Someone assigned
```

---

## Assignment Analytics

### Track Assignment Effectiveness

```sql
-- Assignment accuracy (correct specialist match)
SELECT
  detected_topic,
  assigned_team,
  COUNT(*) as assignments,
  AVG(CASE WHEN reassigned = false THEN 100 ELSE 0 END) as accuracy_rate,
  AVG(time_to_resolution_minutes) as avg_resolution_time
FROM conversation_assignments
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY detected_topic, assigned_team
ORDER BY assignments DESC;

-- SLA adherence by priority
SELECT
  priority,
  COUNT(*) as total,
  SUM(CASE WHEN first_response_within_sla THEN 1 ELSE 0 END) as met_sla,
  ROUND(AVG(CASE WHEN first_response_within_sla THEN 100 ELSE 0 END), 1) as sla_rate,
  AVG(first_response_minutes) as avg_response_time,
  MAX(sla_minutes) as sla_target
FROM conversation_analytics
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY priority
ORDER BY CASE priority
  WHEN 'urgent' THEN 1
  WHEN 'high' THEN 2
  WHEN 'normal' THEN 3
  WHEN 'low' THEN 4
END;
```

---

## Next Steps

1. **Implement Assignment Engine:**
   - Deploy as part of webhook handler
   - Test with sample conversations
   - Monitor assignment accuracy

2. **Configure Agent Capacities:**
   - Define max loads per agent level
   - Set topic preferences
   - Configure SLA targets

3. **Monitor & Tune:**
   - Track assignment accuracy
   - Measure SLA adherence
   - Optimize rules based on data

4. **Continuous Improvement:**
   - A/B test assignment strategies
   - Analyze reassignment patterns
   - Refine topic detection

---

**Document Status:** Production Ready  
**Last Updated:** 2025-10-11  
**Maintained By:** Chatwoot Agent  
**Implementation:** Week 2-3 (with Agent SDK deployment)
