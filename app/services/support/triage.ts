/**
 * Support Triage Automation Service
 * 
 * Auto-triages support conversations by priority based on:
 * - Keywords and sentiment
 * - Customer history
 * - Order value
 * - Message content analysis
 * 
 * Based on spec: docs/specs/chatwoot_integration.md
 */

export enum Priority {
  P0_CRITICAL = 'P0',
  P1_HIGH = 'P1',
  P2_NORMAL = 'P2',
  P3_LOW = 'P3',
}

export interface TriageInput {
  messageContent: string;
  customerEmail?: string;
  customerHistory?: {
    previousConversations: number;
    unresolvedIssues: number;
    totalOrders: number;
    totalSpent: number;
  };
  orderValue?: number;
  channel: 'email' | 'chat' | 'sms';
}

export interface TriageResult {
  priority: Priority;
  reason: string;
  escalateToHuman: boolean;
  suggestedResponse?: string;
  confidence: number;
  flags: string[];
}

// Critical keywords that trigger immediate escalation
const CRITICAL_KEYWORDS = [
  'urgent',
  'emergency',
  'lawyer',
  'lawsuit',
  'fraud',
  'scam',
  'stolen',
  'unauthorized',
  'charge',
  'dispute',
];

// High priority keywords
const HIGH_PRIORITY_KEYWORDS = [
  'damaged',
  'broken',
  'defective',
  'wrong',
  'missing',
  'delay',
  'late',
  'never received',
  'not working',
  'leaking',
];

// Sentiment indicators
const ANGER_INDICATORS = [
  'angry',
  'furious',
  'unacceptable',
  'ridiculous',
  'terrible',
  'worst',
  'horrible',
  'disgusted',
  'disappointed',
];

/**
 * Analyze message sentiment
 */
function analyzeSentiment(message: string): { score: number; isAngry: boolean } {
  const lowerMessage = message.toLowerCase();
  
  let angerCount = 0;
  for (const indicator of ANGER_INDICATORS) {
    if (lowerMessage.includes(indicator)) {
      angerCount++;
    }
  }
  
  // Check for excessive punctuation (!!!, ???)
  const excessivePunctuation = /[!?]{3,}/.test(message);
  if (excessivePunctuation) angerCount++;
  
  // Check for ALL CAPS (more than 30% of message)
  const capsRatio = (message.match(/[A-Z]/g) || []).length / message.length;
  if (capsRatio > 0.3 && message.length > 20) angerCount++;
  
  const score = Math.min(angerCount / 3, 1); // Normalize to 0-1
  const isAngry = score > 0.5;
  
  return { score, isAngry };
}

/**
 * Check for critical keywords
 */
function hasCriticalKeywords(message: string): { found: boolean; keywords: string[] } {
  const lowerMessage = message.toLowerCase();
  const foundKeywords: string[] = [];
  
  for (const keyword of CRITICAL_KEYWORDS) {
    if (lowerMessage.includes(keyword)) {
      foundKeywords.push(keyword);
    }
  }
  
  return {
    found: foundKeywords.length > 0,
    keywords: foundKeywords,
  };
}

/**
 * Check for high priority keywords
 */
function hasHighPriorityKeywords(message: string): { found: boolean; keywords: string[] } {
  const lowerMessage = message.toLowerCase();
  const foundKeywords: string[] = [];
  
  for (const keyword of HIGH_PRIORITY_KEYWORDS) {
    if (lowerMessage.includes(keyword)) {
      foundKeywords.push(keyword);
    }
  }
  
  return {
    found: foundKeywords.length > 0,
    keywords: foundKeywords,
  };
}

/**
 * Triage a support conversation
 */
export function triageConversation(input: TriageInput): TriageResult {
  const flags: string[] = [];
  let priority = Priority.P2_NORMAL;
  let escalateToHuman = false;
  let reason = 'Standard inquiry';
  let confidence = 0.8;
  
  // Check for critical keywords
  const criticalCheck = hasCriticalKeywords(input.messageContent);
  if (criticalCheck.found) {
    priority = Priority.P0_CRITICAL;
    escalateToHuman = true;
    reason = `Critical keywords detected: ${criticalCheck.keywords.join(', ')}`;
    flags.push('critical_keywords');
    confidence = 0.95;
    
    return { priority, reason, escalateToHuman, confidence, flags };
  }
  
  // Check sentiment
  const sentiment = analyzeSentiment(input.messageContent);
  if (sentiment.isAngry) {
    priority = Priority.P1_HIGH;
    escalateToHuman = true;
    reason = 'High anger/frustration detected';
    flags.push('angry_customer');
    confidence = 0.85;
  }
  
  // Check customer history
  if (input.customerHistory) {
    if (input.customerHistory.unresolvedIssues > 2) {
      priority = Priority.P0_CRITICAL;
      escalateToHuman = true;
      reason = `Customer has ${input.customerHistory.unresolvedIssues} unresolved issues`;
      flags.push('multiple_unresolved');
      confidence = 0.9;
      
      return { priority, reason, escalateToHuman, confidence, flags };
    }
  }
  
  // Check order value
  if (input.orderValue && input.orderValue > 500) {
    if (priority === Priority.P2_NORMAL) {
      priority = Priority.P1_HIGH;
    }
    reason = `High value order ($${input.orderValue})`;
    flags.push('high_value');
  }
  
  // Check for high priority keywords
  const highPriorityCheck = hasHighPriorityKeywords(input.messageContent);
  if (highPriorityCheck.found) {
    if (priority === Priority.P2_NORMAL) {
      priority = Priority.P1_HIGH;
      reason = `Product issue keywords: ${highPriorityCheck.keywords.join(', ')}`;
      flags.push('product_issue');
    }
  }
  
  // Check for refund mentions with high value
  const lowerMessage = input.messageContent.toLowerCase();
  if (lowerMessage.includes('refund') && input.orderValue && input.orderValue > 100) {
    if (priority === Priority.P2_NORMAL) {
      priority = Priority.P1_HIGH;
    }
    escalateToHuman = true;
    reason = `Refund request for $${input.orderValue} order`;
    flags.push('refund_request');
  }
  
  // Determine if AI can handle or needs human
  if (priority === Priority.P0_CRITICAL || priority === Priority.P1_HIGH) {
    escalateToHuman = true;
  } else {
    // P2/P3 can be handled by AI draft
    escalateToHuman = false;
    confidence = 0.75;
  }
  
  // Channel-specific adjustments
  if (input.channel === 'sms') {
    // SMS should be faster response
    if (priority === Priority.P3_LOW) {
      priority = Priority.P2_NORMAL;
      reason += ' (SMS channel)';
    }
  }
  
  return {
    priority,
    reason,
    escalateToHuman,
    confidence,
    flags,
  };
}

/**
 * Get SLA target for priority
 */
export function getSLATarget(priority: Priority): { responseTime: number; resolutionTime: number } {
  switch (priority) {
    case Priority.P0_CRITICAL:
      return { responseTime: 15, resolutionTime: 120 }; // 15 min, 2 hours
    case Priority.P1_HIGH:
      return { responseTime: 60, resolutionTime: 480 }; // 1 hour, 8 hours
    case Priority.P2_NORMAL:
      return { responseTime: 240, resolutionTime: 1440 }; // 4 hours, 24 hours
    case Priority.P3_LOW:
      return { responseTime: 1440, resolutionTime: 4320 }; // 24 hours, 72 hours
    default:
      return { responseTime: 240, resolutionTime: 1440 };
  }
}

/**
 * Batch triage multiple conversations
 */
export function batchTriage(inputs: TriageInput[]): TriageResult[] {
  return inputs.map(input => triageConversation(input));
}

/**
 * Get triage statistics
 */
export function getTriageStats(results: TriageResult[]) {
  const priorityCounts = results.reduce((acc, r) => {
    acc[r.priority] = (acc[r.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const escalationCount = results.filter(r => r.escalateToHuman).length;
  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
  
  const allFlags = results.flatMap(r => r.flags);
  const flagCounts = allFlags.reduce((acc, flag) => {
    acc[flag] = (acc[flag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total: results.length,
    priorities: priorityCounts,
    escalationRate: (escalationCount / results.length) * 100,
    avgConfidence,
    flags: flagCounts,
  };
}

// CLI testing
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 Testing Triage Service\n');
  
  const testCases: TriageInput[] = [
    {
      messageContent: 'Where is my order?',
      channel: 'email',
    },
    {
      messageContent: 'This is URGENT! My fitting is leaking fuel everywhere!',
      channel: 'email',
    },
    {
      messageContent: 'I want to speak to a lawyer about this fraud!',
      channel: 'email',
    },
    {
      messageContent: 'The product arrived damaged and broken',
      orderValue: 250,
      channel: 'email',
    },
    {
      messageContent: 'Can I get a refund?',
      orderValue: 150,
      channel: 'email',
    },
    {
      messageContent: 'What size hose do I need for my application?',
      channel: 'chat',
    },
  ];
  
  const results = batchTriage(testCases);
  
  results.forEach((result, idx) => {
    console.log(`Test ${idx + 1}: "${testCases[idx].messageContent.substring(0, 50)}..."`);
    console.log(`  Priority: ${result.priority}`);
    console.log(`  Escalate: ${result.escalateToHuman ? 'YES' : 'NO'}`);
    console.log(`  Reason: ${result.reason}`);
    console.log(`  Confidence: ${(result.confidence * 100).toFixed(0)}%`);
    console.log(`  Flags: ${result.flags.join(', ') || 'none'}`);
    console.log();
  });
  
  console.log('📊 Statistics:');
  console.log(JSON.stringify(getTriageStats(results), null, 2));
}

