/**
 * Canned Responses Library
 * Backlog Task 5
 */

export const CANNED_RESPONSES = {
  greeting: "Hi\! How can I help you today?",
  closing: "Thank you for contacting us. Have a great day\!",
  order_tracking: "I'll help you track your order. Can you provide your order number?",
  refund_policy: "Our refund policy allows returns within 30 days of purchase.",
};

export function getCannedResponse(key: string): string {
  return CANNED_RESPONSES[key as keyof typeof CANNED_RESPONSES] || '';
}
