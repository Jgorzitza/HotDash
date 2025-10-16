/**
 * Auto-Reply Templates
 * Backlog Task 3
 */

export interface ReplyTemplate {
  id: string;
  name: string;
  category: string;
  template: string;
  variables: string[];
}

export const REPLY_TEMPLATES: ReplyTemplate[] = [
  {
    id: 'order_status',
    name: 'Order Status Inquiry',
    category: 'orders',
    template: 'Hi {{customerName}}, your order #{{orderNumber}} is currently {{orderStatus}}. Expected delivery: {{deliveryDate}}.',
    variables: ['customerName', 'orderNumber', 'orderStatus', 'deliveryDate'],
  },
  {
    id: 'refund_request',
    name: 'Refund Request',
    category: 'refunds',
    template: 'Hi {{customerName}}, we can process a refund for order #{{orderNumber}}. Please allow 5-7 business days for the refund to appear.',
    variables: ['customerName', 'orderNumber'],
  },
  {
    id: 'shipping_delay',
    name: 'Shipping Delay',
    category: 'shipping',
    template: 'Hi {{customerName}}, we apologize for the delay with order #{{orderNumber}}. Your order is now expected to arrive by {{newDeliveryDate}}.',
    variables: ['customerName', 'orderNumber', 'newDeliveryDate'],
  },
];

export function renderTemplate(templateId: string, variables: Record<string, string>): string {
  const template = REPLY_TEMPLATES.find(t => t.id === templateId);
  if (!template) return '';
  
  let rendered = template.template;
  for (const [key, value] of Object.entries(variables)) {
    rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  
  return rendered;
}

export function findTemplateByCategory(category: string): ReplyTemplate[] {
  return REPLY_TEMPLATES.filter(t => t.category === category);
}

