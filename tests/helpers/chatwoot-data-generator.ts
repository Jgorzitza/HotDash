/**
 * Chatwoot Test Data Generator for Growth Features
 * Generates realistic customer conversation data
 */

export interface ChatwootMessage {
  id: number;
  content: string;
  message_type: number; // 0=incoming, 1=outgoing, 2=activity
  created_at: number;
  sender: {
    type: string;
    name?: string;
  };
  tags?: string[];
}

export interface ConversationScenario {
  scenario: string;
  messages: ChatwootMessage[];
}

const CUSTOMER_NAMES = [
  "Mike Johnson",
  "Sarah Williams",
  "Carlos Rodriguez",
  "Robert Chen",
  "Jason Martinez",
  "David Thompson",
  "Emily Davis",
  "Chris Anderson",
  "Maria Garcia",
  "Kevin Lee",
];

const INQUIRY_TEMPLATES = [
  {
    type: "product_recommendation",
    question: "I'm doing an LS swap in my {vehicle}. What fuel pump do you recommend?",
    answer: "For a stock LS3, the Walbro 255 LPH pump (GCA758) is perfect. It supports up to 450 HP.",
  },
  {
    type: "technical_support",
    question: "What size AN fitting do I need for the fuel rail on a {engine}?",
    answer: "LS1 fuel rails use AN6 (3/8\") fittings. Our PTFE AN6 line kit is designed for LS swaps.",
  },
  {
    type: "installation_help",
    question: "Do I need Teflon tape on the AN fittings or will they seal without it?",
    answer: "No Teflon tape needed! AN fittings use metal-to-metal cone seal. Hand-tighten plus 1/4 turn.",
  },
  {
    type: "compatibility",
    question: "Will the Aeromotive A1000 pump work with E85 fuel?",
    answer: "Yes! The A1000 is fully compatible with E85, methanol, and all pump gas fuels.",
  },
  {
    type: "order_status",
    question: "I ordered the LS fuel line kit last week (order #{orderNum}). When will it ship?",
    answer: "I need to escalate this to check your order status. One moment please.",
    requiresEscalation: true,
  },
];

const VEHICLES = [
  "1985 C10",
  "1972 Chevelle",
  "1987 Squarebody",
  "1969 Camaro",
  "1955 Bel Air",
  "1967 C10",
];

const ENGINES = ["LS1", "LS3", "LS7", "5.3L", "6.0L", "6.2L"];

/**
 * Generate conversation scenario
 */
export function generateConversation(
  templateIndex: number,
  startId: number = 100
): ConversationScenario {
  const template = INQUIRY_TEMPLATES[templateIndex % INQUIRY_TEMPLATES.length];
  const customer = CUSTOMER_NAMES[templateIndex % CUSTOMER_NAMES.length];
  const vehicle = VEHICLES[Math.floor(Math.random() * VEHICLES.length)];
  const engine = ENGINES[Math.floor(Math.random() * ENGINES.length)];
  const orderNum = Math.floor(Math.random() * 9000) + 1000;

  const question = template.question
    .replace("{vehicle}", vehicle)
    .replace("{engine}", engine)
    .replace("{orderNum}", orderNum.toString());

  const messages: ChatwootMessage[] = [
    {
      id: startId,
      content: question,
      message_type: 0,
      created_at: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      sender: { type: "contact", name: customer },
    },
    {
      id: startId + 1,
      content: template.answer,
      message_type: 1,
      created_at: Math.floor(Date.now() / 1000) - 3300, // 55 min ago
      sender: { type: "agent", name: "AI Agent" },
      tags: template.requiresEscalation ? ["escalation", "approval_needed"] : undefined,
    },
  ];

  return {
    scenario: template.type,
    messages,
  };
}

/**
 * Generate multiple conversation scenarios
 */
export function generateConversations(count: number = 6): ConversationScenario[] {
  const scenarios: ConversationScenario[] = [];
  
  for (let i = 0; i < count; i++) {
    scenarios.push(generateConversation(i, 100 + i * 10));
  }
  
  return scenarios;
}

/**
 * Generate escalation scenario (requires approval)
 */
export function generateEscalationScenario(startId: number = 500): ConversationScenario {
  return {
    scenario: "customer_service_escalation",
    messages: [
      {
        id: startId,
        content: "I received the wrong part and need a refund immediately!",
        message_type: 0,
        created_at: Math.floor(Date.now() / 1000) - 1800,
        sender: { type: "contact", name: "Frustrated Customer" },
      },
      {
        id: startId + 1,
        content: "I understand your frustration. Let me escalate this to our team for immediate resolution.",
        message_type: 1,
        created_at: Math.floor(Date.now() / 1000) - 1680,
        sender: { type: "agent", name: "AI Agent" },
        tags: ["escalation", "refund_request", "priority_high"],
      },
    ],
  };
}

