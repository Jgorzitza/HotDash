/**
 * Policy Gating Library and Playbooks
 * 
 * Defines policy rules and playbooks for different scenarios.
 * Phase 2 Task 1: Policy gating library and playbooks
 */

import { z } from 'zod';

/**
 * Policy playbook schema
 */
export const PolicyPlaybookSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  scenario: z.string(),
  rules: z.array(z.object({
    condition: z.string(),
    action: z.string(),
    requiresApproval: z.boolean(),
  })),
  examples: z.array(z.string()).optional(),
});

export type PolicyPlaybook = z.infer<typeof PolicyPlaybookSchema>;

/**
 * Policy playbooks for common scenarios
 */
export const POLICY_PLAYBOOKS: PolicyPlaybook[] = [
  {
    id: 'refund_request',
    name: 'Refund Request Playbook',
    description: 'Handle customer refund requests',
    scenario: 'Customer requests refund',
    rules: [
      {
        condition: 'Refund amount <= $200',
        action: 'Approve refund, process immediately',
        requiresApproval: false,
      },
      {
        condition: 'Refund amount > $200 and <= $500',
        action: 'Approve refund, requires manager approval',
        requiresApproval: true,
      },
      {
        condition: 'Refund amount > $500',
        action: 'Escalate to manager, requires CEO approval',
        requiresApproval: true,
      },
    ],
    examples: [
      'Customer: I want a refund for my $150 order',
      'Customer: Can I get my money back? Order was $450',
    ],
  },
  {
    id: 'discount_offer',
    name: 'Discount Offer Playbook',
    description: 'Handle discount requests and offers',
    scenario: 'Customer requests discount or agent considers offering one',
    rules: [
      {
        condition: 'Discount <= 10%',
        action: 'Can offer discount code',
        requiresApproval: false,
      },
      {
        condition: 'Discount > 10% and <= 20%',
        action: 'Requires manager approval',
        requiresApproval: true,
      },
      {
        condition: 'Discount > 20%',
        action: 'Not allowed, escalate to manager',
        requiresApproval: true,
      },
    ],
    examples: [
      'Customer: Can I get a discount on my next order?',
      'Customer: Do you have any promo codes?',
    ],
  },
  {
    id: 'order_issue',
    name: 'Order Issue Playbook',
    description: 'Handle wrong/damaged/missing items',
    scenario: 'Customer reports order issue',
    rules: [
      {
        condition: 'Wrong item received',
        action: 'Send correct item with expedited shipping, customer keeps wrong item',
        requiresApproval: false,
      },
      {
        condition: 'Damaged item',
        action: 'Send replacement with expedited shipping, provide prepaid return label',
        requiresApproval: false,
      },
      {
        condition: 'Missing item',
        action: 'Send missing item with expedited shipping at no charge',
        requiresApproval: false,
      },
    ],
    examples: [
      'Customer: I received AN-6 but ordered AN-8',
      'Customer: The fitting arrived damaged',
      'Customer: My order is missing 2 items',
    ],
  },
  {
    id: 'shipping_delay',
    name: 'Shipping Delay Playbook',
    description: 'Handle shipping delays and tracking issues',
    scenario: 'Customer inquires about delayed shipment',
    rules: [
      {
        condition: 'Delay < 3 days',
        action: 'Provide tracking update, apologize for delay',
        requiresApproval: false,
      },
      {
        condition: 'Delay 3-7 days',
        action: 'Offer 10% discount on next order, expedite if possible',
        requiresApproval: false,
      },
      {
        condition: 'Delay > 7 days',
        action: 'Offer full refund or free expedited replacement',
        requiresApproval: true,
      },
    ],
    examples: [
      'Customer: My order was supposed to arrive yesterday',
      'Customer: Tracking hasn\'t updated in 5 days',
    ],
  },
  {
    id: 'vip_customer',
    name: 'VIP Customer Playbook',
    description: 'Handle VIP customer interactions',
    scenario: 'VIP customer (10+ orders or $1000+ LTV) contacts support',
    rules: [
      {
        condition: 'Any request from VIP',
        action: 'Prioritize response, escalate to senior support',
        requiresApproval: false,
      },
      {
        condition: 'VIP requests special accommodation',
        action: 'Approve reasonable requests up to $100 value',
        requiresApproval: false,
      },
      {
        condition: 'VIP requests > $100 value',
        action: 'Escalate to manager with recommendation to approve',
        requiresApproval: true,
      },
    ],
    examples: [
      'VIP customer: Can you rush my order?',
      'VIP customer: I need a custom solution',
    ],
  },
];

/**
 * Get playbook by ID
 */
export function getPlaybook(id: string): PolicyPlaybook | undefined {
  return POLICY_PLAYBOOKS.find(p => p.id === id);
}

/**
 * Find applicable playbook for scenario
 */
export function findPlaybook(scenario: string): PolicyPlaybook | undefined {
  const lowerScenario = scenario.toLowerCase();
  
  return POLICY_PLAYBOOKS.find(playbook => {
    const lowerPlaybookScenario = playbook.scenario.toLowerCase();
    return lowerScenario.includes(lowerPlaybookScenario) ||
           lowerPlaybookScenario.includes(lowerScenario);
  });
}

/**
 * Check if action requires approval based on playbook
 */
export function requiresApproval(
  playbookId: string,
  condition: string
): boolean {
  const playbook = getPlaybook(playbookId);
  if (!playbook) return true; // Default to requiring approval
  
  const rule = playbook.rules.find(r => r.condition === condition);
  return rule?.requiresApproval ?? true;
}

/**
 * Get recommended action for scenario
 */
export function getRecommendedAction(
  playbookId: string,
  context: Record<string, any>
): {
  action: string;
  requiresApproval: boolean;
  rule: string;
} | null {
  const playbook = getPlaybook(playbookId);
  if (!playbook) return null;
  
  // Simple rule matching based on context
  for (const rule of playbook.rules) {
    // TODO: Implement more sophisticated rule matching
    // For now, return first matching rule
    return {
      action: rule.action,
      requiresApproval: rule.requiresApproval,
      rule: rule.condition,
    };
  }
  
  return null;
}

