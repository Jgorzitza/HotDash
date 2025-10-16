/**
 * OpenAI Fixtures
 * 
 * Mock data for testing OpenAI agent responses.
 * Backlog task #20: Fixtures for Chatwoot + OpenAI
 */

/**
 * Mock agent responses for different scenarios
 */
export const mockAgentResponses = {
  orderStatus: {
    draft: 'Your order will ship tomorrow.',
    improved: 'I understand your concern about order #12345. Let me check that for you right away. Your order shipped yesterday via USPS Priority Mail and should arrive within 3-5 business days. I\'ve sent the tracking number to your email.',
    grading: { tone: 5, accuracy: 5, policy: 5 },
  },

  returnRequest: {
    draft: 'You can return the items within 30 days.',
    improved: 'I sincerely apologize for the mix-up with your order. That must be frustrating. We\'ll send you the correct AN-8 fittings right away with expedited shipping at no charge. You can keep or return the AN-6 fittings - whatever is easier for you. I\'ve already processed the replacement order.',
    grading: { tone: 5, accuracy: 5, policy: 5 },
  },

  policyQuestion: {
    draft: 'Our return policy allows returns within 30 days.',
    improved: 'Our return policy allows returns within 30 days of delivery. Items must be unworn with original tags. We provide free prepaid return shipping labels. You can initiate a return through your account or by contacting us directly.',
    grading: { tone: 4, accuracy: 5, policy: 5 },
  },

  escalation: {
    draft: 'I apologize for the inconvenience.',
    improved: 'I sincerely apologize for this situation and understand your frustration. I\'m escalating this to our manager who will contact you within 2 hours to resolve this personally. Your satisfaction is our top priority.',
    grading: { tone: 5, accuracy: 5, policy: 5 },
  },
};

/**
 * Mock token usage for cost calculation
 */
export const mockTokenUsage = {
  simple: {
    prompt: 150,
    completion: 50,
    total: 200,
  },
  complex: {
    prompt: 500,
    completion: 200,
    total: 700,
  },
  withTools: {
    prompt: 800,
    completion: 300,
    total: 1100,
  },
};

/**
 * Mock edit diffs for learning
 */
export const mockEditDiffs = [
  {
    original: 'Your order will ship tomorrow.',
    revised: 'I understand your concern. Your order will ship tomorrow and you\'ll receive tracking info via email.',
    editType: 'moderate' as const,
    changes: [
      { type: 'addition' as const, revised: 'I understand your concern.', position: 0 },
      { type: 'addition' as const, revised: 'and you\'ll receive tracking info via email', position: 5 },
    ],
  },
  {
    original: 'We cannot process refunds.',
    revised: 'I apologize for the inconvenience. Unfortunately, we cannot process refunds for this type of item, but I can offer you store credit or an exchange.',
    editType: 'major' as const,
    changes: [
      { type: 'addition' as const, revised: 'I apologize for the inconvenience. Unfortunately,', position: 0 },
      { type: 'addition' as const, revised: 'for this type of item, but I can offer you store credit or an exchange', position: 4 },
    ],
  },
];

