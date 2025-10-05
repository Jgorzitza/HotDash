export interface ReplyTemplate {
  id: string;
  label: string;
  body: string;
}

export const CHATWOOT_TEMPLATES: ReplyTemplate[] = [
  {
    id: "ack_delay",
    label: "Acknowledge delay",
    body: "Hi {{name}}, thanks for your patience. I'm checking on your order now and will follow up with an update shortly.",
  },
  {
    id: "ship_update",
    label: "Shipping updated",
    body: "Appreciate you reaching out, {{name}}. Your order is with our carrier and I'm expediting a status check right away.",
  },
  {
    id: "refund_offer",
    label: "Refund offer",
    body: "I'm sorry for the trouble, {{name}}. I can refund this immediately or offer store credit—let me know what works best.",
  },
];

export function findTemplate(templateId?: string) {
  return CHATWOOT_TEMPLATES.find((template) => template.id === templateId);
}
