/**
 * Test Query Fixtures for RAG
 * Task 6: Provide test queries using MCP server
 */

export interface TestQuery {
  id: string;
  question: string;
  category: string;
  expectedTopics: string[];
  minConfidence: number;
}

export const TEST_QUERIES: TestQuery[] = [
  {
    id: 'returns_1',
    question: 'How do I process a return?',
    category: 'returns',
    expectedTopics: ['return policy', 'refund', '30 days'],
    minConfidence: 0.7,
  },
  {
    id: 'shipping_1',
    question: "What's the shipping policy?",
    category: 'shipping',
    expectedTopics: ['shipping', 'delivery', 'business days'],
    minConfidence: 0.7,
  },
  {
    id: 'orders_1',
    question: 'How do I cancel an order?',
    category: 'orders',
    expectedTopics: ['cancel', 'order', 'before shipping'],
    minConfidence: 0.7,
  },
  {
    id: 'products_1',
    question: 'What size AN hose do I need for 600 HP?',
    category: 'products',
    expectedTopics: ['AN hose', 'size', 'horsepower', 'fuel'],
    minConfidence: 0.6,
  },
  {
    id: 'products_2',
    question: 'My fitting is leaking, what should I do?',
    category: 'products',
    expectedTopics: ['leak', 'fitting', 'tighten', 'seal'],
    minConfidence: 0.7,
  },
  {
    id: 'exchange_1',
    question: 'Can I exchange a product for a different size?',
    category: 'exchanges',
    expectedTopics: ['exchange', 'size', 'unused', 'original packaging'],
    minConfidence: 0.7,
  },
  {
    id: 'tracking_1',
    question: 'Where is my order?',
    category: 'orders',
    expectedTopics: ['tracking', 'order status', 'email'],
    minConfidence: 0.6,
  },
  {
    id: 'refund_1',
    question: 'How long does a refund take?',
    category: 'refunds',
    expectedTopics: ['refund', '5-7 business days', 'original payment'],
    minConfidence: 0.7,
  },
];

export interface QueryResult {
  query: TestQuery;
  answer: string;
  confidence: number;
  passed: boolean;
  reason?: string;
}

/**
 * Validate query result against expected criteria
 */
export function validateQueryResult(query: TestQuery, answer: string, confidence: number): QueryResult {
  const lowerAnswer = answer.toLowerCase();
  
  // Check if answer contains expected topics
  const topicsFound = query.expectedTopics.filter(topic => 
    lowerAnswer.includes(topic.toLowerCase())
  );
  
  const topicCoverage = topicsFound.length / query.expectedTopics.length;
  const passed = confidence >= query.minConfidence && topicCoverage >= 0.5;
  
  let reason: string | undefined;
  if (!passed) {
    if (confidence < query.minConfidence) {
      reason = `Confidence ${confidence} below minimum ${query.minConfidence}`;
    } else {
      reason = `Topic coverage ${(topicCoverage * 100).toFixed(0)}% below 50%`;
    }
  }
  
  return {
    query,
    answer,
    confidence,
    passed,
    reason,
  };
}

/**
 * Score query results
 */
export function scoreQueryResults(results: QueryResult[]): {
  totalQueries: number;
  passed: number;
  failed: number;
  passRate: number;
  avgConfidence: number;
} {
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
  
  return {
    totalQueries: results.length,
    passed,
    failed,
    passRate: (passed / results.length) * 100,
    avgConfidence,
  };
}

