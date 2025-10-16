/**
 * Tag Suggestions
 * Backlog Task 6
 */

export function suggestTags(messageContent: string): string[] {
  const tags: string[] = [];
  const lower = messageContent.toLowerCase();
  
  if (lower.includes('order')) tags.push('order');
  if (lower.includes('refund')) tags.push('refund');
  if (lower.includes('shipping')) tags.push('shipping');
  if (lower.includes('return')) tags.push('return');
  if (lower.includes('product')) tags.push('product');
  
  return tags;
}
