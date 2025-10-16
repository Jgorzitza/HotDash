/**
 * Policy Filters
 * 
 * Enforces company policies on AI-generated responses.
 * Backlog task #12: Policy filters (no-offer, refunds caps)
 */

import { z } from 'zod';

/**
 * Policy violation schema
 */
export const PolicyViolationSchema = z.object({
  type: z.enum([
    'unauthorized_discount',
    'refund_cap_exceeded',
    'unauthorized_promise',
    'prohibited_language',
    'data_sharing',
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  message: z.string(),
  suggestion: z.string().optional(),
});

export type PolicyViolation = z.infer<typeof PolicyViolationSchema>;

/**
 * Policy rules configuration
 */
const POLICY_RULES = {
  // Discount limits
  maxDiscountPercent: 20,
  maxDiscountAmount: 50,

  // Refund limits
  maxRefundAmount: 500,
  requireApprovalAbove: 200,

  // Prohibited phrases
  prohibitedPhrases: [
    'guaranteed',
    'promise',
    'definitely',
    'always',
    'never',
  ],

  // Unauthorized offers
  unauthorizedOffers: [
    'free shipping',
    'discount',
    'coupon',
    'promo code',
  ],

  // Data sharing restrictions
  prohibitedDataSharing: [
    'social security',
    'credit card',
    'password',
    'account number',
  ],
};

/**
 * Check response for policy violations
 * 
 * @param response - AI-generated response
 */
export function checkPolicyViolations(response: string): PolicyViolation[] {
  const violations: PolicyViolation[] = [];
  const lowerResponse = response.toLowerCase();

  // Check for unauthorized discounts
  const discountMatch = lowerResponse.match(/(\d+)%\s*(?:off|discount)/);
  if (discountMatch) {
    const percent = parseInt(discountMatch[1]);
    if (percent > POLICY_RULES.maxDiscountPercent) {
      violations.push({
        type: 'unauthorized_discount',
        severity: 'high',
        message: `Discount of ${percent}% exceeds maximum allowed (${POLICY_RULES.maxDiscountPercent}%)`,
        suggestion: `Limit discount to ${POLICY_RULES.maxDiscountPercent}% or escalate for approval`,
      });
    }
  }

  // Check for unauthorized offers
  POLICY_RULES.unauthorizedOffers.forEach((offer) => {
    if (lowerResponse.includes(offer)) {
      violations.push({
        type: 'unauthorized_promise',
        severity: 'medium',
        message: `Unauthorized offer detected: "${offer}"`,
        suggestion: 'Remove offer or escalate for approval',
      });
    }
  });

  // Check for prohibited language
  POLICY_RULES.prohibitedPhrases.forEach((phrase) => {
    if (lowerResponse.includes(phrase)) {
      violations.push({
        type: 'prohibited_language',
        severity: 'low',
        message: `Prohibited phrase detected: "${phrase}"`,
        suggestion: 'Use more cautious language (e.g., "typically", "usually")',
      });
    }
  });

  // Check for data sharing violations
  POLICY_RULES.prohibitedDataSharing.forEach((term) => {
    if (lowerResponse.includes(term)) {
      violations.push({
        type: 'data_sharing',
        severity: 'critical',
        message: `Potential data sharing violation: "${term}"`,
        suggestion: 'Never ask for or share sensitive personal information',
      });
    }
  });

  return violations;
}

/**
 * Filter response to remove policy violations
 * 
 * @param response - AI-generated response
 */
export function filterResponse(response: string): {
  filtered: string;
  violations: PolicyViolation[];
} {
  const violations = checkPolicyViolations(response);
  let filtered = response;

  // Remove unauthorized offers
  POLICY_RULES.unauthorizedOffers.forEach((offer) => {
    const regex = new RegExp(`\\b${offer}\\b`, 'gi');
    filtered = filtered.replace(regex, '[REMOVED: unauthorized offer]');
  });

  // Replace prohibited phrases with safer alternatives
  const replacements: Record<string, string> = {
    guaranteed: 'typically',
    promise: 'expect',
    definitely: 'likely',
    always: 'usually',
    never: 'rarely',
  };

  Object.entries(replacements).forEach(([prohibited, safe]) => {
    const regex = new RegExp(`\\b${prohibited}\\b`, 'gi');
    filtered = filtered.replace(regex, safe);
  });

  return { filtered, violations };
}

/**
 * Validate refund amount
 * 
 * @param amount - Refund amount
 */
export function validateRefundAmount(amount: number): {
  allowed: boolean;
  requiresApproval: boolean;
  message: string;
} {
  if (amount > POLICY_RULES.maxRefundAmount) {
    return {
      allowed: false,
      requiresApproval: true,
      message: `Refund amount $${amount} exceeds maximum allowed ($${POLICY_RULES.maxRefundAmount}). Requires manager approval.`,
    };
  }

  if (amount > POLICY_RULES.requireApprovalAbove) {
    return {
      allowed: true,
      requiresApproval: true,
      message: `Refund amount $${amount} requires approval (threshold: $${POLICY_RULES.requireApprovalAbove}).`,
    };
  }

  return {
    allowed: true,
    requiresApproval: false,
    message: `Refund amount $${amount} is within policy limits.`,
  };
}

