/**
 * Test Handoff System
 * 
 * Tests the enhanced handoff system with various scenarios
 */

import { HandoffManager, createDefaultHandoffRules } from '../src/handoff/handoff-manager.js';
import type { ConversationContext } from '../src/context/conversation-manager.js';

// Create handoff manager
const handoffManager = new HandoffManager();
createDefaultHandoffRules(handoffManager);

// Test scenarios
const scenarios: Array<{ name: string; context: Partial<ConversationContext> }> = [
  {
    name: 'Order Status Inquiry',
    context: {
      conversationId: 1,
      intent: 'order_status',
      customer: { orderId: 'gid://shopify/Order/123' },
      sentiment: 'neutral',
      urgency: 'medium',
      messages: [],
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    name: 'Shipping Tracking',
    context: {
      conversationId: 2,
      intent: 'shipping_tracking',
      customer: { orderId: 'gid://shopify/Order/456' },
      sentiment: 'neutral',
      urgency: 'medium',
      messages: [],
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    name: 'Technical Troubleshooting',
    context: {
      conversationId: 3,
      intent: 'technical_troubleshoot',
      customer: {},
      sentiment: 'negative',
      urgency: 'high',
      messages: [],
      metadata: { productId: 'gid://shopify/Product/789' },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    name: 'Product Question',
    context: {
      conversationId: 4,
      intent: 'product_specs',
      customer: {},
      sentiment: 'positive',
      urgency: 'low',
      messages: [],
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    name: 'Warranty Claim',
    context: {
      conversationId: 5,
      intent: 'technical_warranty',
      customer: { orderId: 'gid://shopify/Order/999' },
      sentiment: 'neutral',
      urgency: 'medium',
      messages: [],
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    name: 'Complaint (Low Confidence)',
    context: {
      conversationId: 6,
      intent: 'complaint',
      customer: {},
      sentiment: 'negative',
      urgency: 'high',
      messages: [],
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    name: 'Shipping Delay (Negative Sentiment)',
    context: {
      conversationId: 7,
      intent: 'shipping_delay',
      customer: { orderId: 'gid://shopify/Order/111' },
      sentiment: 'negative',
      urgency: 'high',
      messages: [],
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
];

// Run tests
console.log('🧪 Testing Enhanced Handoff System\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

for (const scenario of scenarios) {
  console.log(`\n📋 Scenario: ${scenario.name}`);
  console.log('-'.repeat(80));
  
  try {
    const decision = handoffManager.decideHandoff(scenario.context as ConversationContext);
    
    console.log(`✅ Decision made:`);
    console.log(`   Target Agent: ${decision.targetAgent || 'None'}`);
    console.log(`   Confidence: ${(decision.confidence * 100).toFixed(1)}%`);
    console.log(`   Reason: ${decision.reason || 'N/A'}`);
    console.log(`   Requires Human Review: ${decision.requiresHumanReview ? 'Yes' : 'No'}`);
    if (decision.escalationReason) {
      console.log(`   Escalation Reason: ${decision.escalationReason}`);
    }
    console.log(`   Processing Time: ${decision.metadata.processingTimeMs}ms`);
    console.log(`   Rules Evaluated: ${decision.metadata.rulesEvaluated}`);
    console.log(`   Context Factors: ${decision.metadata.contextFactors.join(', ')}`);
    
    // Validate decision
    if (decision.shouldHandoff && !decision.targetAgent) {
      console.log(`❌ FAIL: shouldHandoff=true but no targetAgent`);
      failed++;
    } else if (decision.confidence < 0 || decision.confidence > 1) {
      console.log(`❌ FAIL: Invalid confidence score: ${decision.confidence}`);
      failed++;
    } else {
      passed++;
    }
  } catch (error: any) {
    console.log(`❌ ERROR: ${error.message}`);
    failed++;
  }
}

console.log('\n' + '='.repeat(80));
console.log(`\n📊 Test Results:`);
console.log(`   Passed: ${passed}/${scenarios.length}`);
console.log(`   Failed: ${failed}/${scenarios.length}`);
console.log(`   Success Rate: ${((passed / scenarios.length) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log(`\n✅ All tests passed!`);
  process.exit(0);
} else {
  console.log(`\n❌ Some tests failed.`);
  process.exit(1);
}

