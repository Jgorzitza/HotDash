import type { ConversationMessage } from "../chatwoot/types";

export type IntentCategory =
  | "order_status"
  | "shipping_info"
  | "return_policy"
  | "product_availability"
  | "faq"
  | "product_fit"
  | "installation"
  | "complaint"
  | "technical"
  | "other";

export type Sentiment = "positive" | "neutral" | "negative";
export type Urgency = "low" | "medium" | "high";

export interface Intent {
  category: IntentCategory;
  confidence: number; // 0-1
  entities: {
    orderNumber?: string;
    productName?: string;
    location?: string;
    vehicleInfo?: string;
    trackingNumber?: string;
  };
  sentiment: Sentiment;
  urgency: Urgency;
}

// Keyword patterns for intent classification
const INTENT_PATTERNS = {
  order_status: [
    /where\s+is\s+my\s+order/i,
    /order\s+status/i,
    /track\s+(my\s+)?order/i,
    /order\s+#?\s*\d+/i,
    /when\s+will\s+(it|my\s+order)\s+(arrive|ship)/i,
    /has\s+(it|my\s+order)\s+shipped/i,
  ],
  shipping_info: [
    /how\s+much\s+is\s+shipping/i,
    /shipping\s+(cost|price|rate)/i,
    /do\s+you\s+ship\s+to/i,
    /shipping\s+options/i,
    /free\s+shipping/i,
    /delivery\s+(time|cost)/i,
    /overnight\s+shipping/i,
  ],
  return_policy: [
    /return\s+policy/i,
    /can\s+i\s+return/i,
    /how\s+(do\s+i|to)\s+return/i,
    /return\s+window/i,
    /refund\s+policy/i,
    /money\s+back/i,
  ],
  product_availability: [
    /in\s+stock/i,
    /available/i,
    /do\s+you\s+(have|carry)/i,
    /when\s+will.*back\s+in\s+stock/i,
    /restock/i,
  ],
  faq: [
    /what\s+are\s+your\s+hours/i,
    /how\s+(do\s+i|to)\s+contact/i,
    /phone\s+number/i,
    /email\s+address/i,
    /where\s+are\s+you\s+located/i,
  ],
  product_fit: [
    /will\s+this\s+fit/i,
    /compatible\s+with/i,
    /what\s+size.*need/i,
    /fitment/i,
    /work\s+with\s+my/i,
  ],
  installation: [
    /how\s+(do\s+i|to)\s+install/i,
    /installation\s+instructions/i,
    /torque\s+spec/i,
    /install\s+guide/i,
  ],
  complaint: [
    /terrible/i,
    /worst/i,
    /lawsuit/i,
    /attorney/i,
    /lawyer/i,
    /sue/i,
    /never\s+again/i,
    /angry/i,
    /furious/i,
  ],
  technical: [
    /how\s+does.*work/i,
    /technical\s+(spec|question)/i,
    /engineering/i,
    /design\s+(spec|question)/i,
  ],
};

const NEGATIVE_SENTIMENT_KEYWORDS = [
  "terrible",
  "worst",
  "horrible",
  "awful",
  "angry",
  "furious",
  "disappointed",
  "frustrated",
  "unacceptable",
  "ridiculous",
];

const URGENCY_KEYWORDS = {
  high: ["urgent", "emergency", "asap", "immediately", "race weekend", "need today"],
  medium: ["soon", "quickly", "this week"],
};

function extractOrderNumber(text: string): string | undefined {
  const match = text.match(/(?:order\s*#?\s*)?(\d{4,})/i);
  return match?.[1];
}

function extractTrackingNumber(text: string): string | undefined {
  // Common tracking number patterns (simplified)
  const match = text.match(/\b(1Z[0-9A-Z]{16}|[0-9]{20,22}|[0-9]{12,14})\b/);
  return match?.[0];
}

function detectSentiment(text: string): Sentiment {
  const normalized = text.toLowerCase();
  const hasNegativeKeyword = NEGATIVE_SENTIMENT_KEYWORDS.some((keyword) =>
    normalized.includes(keyword)
  );

  if (hasNegativeKeyword) return "negative";

  // Simple positive indicators
  if (/(thank|great|awesome|love|perfect|excellent)/i.test(text)) {
    return "positive";
  }

  return "neutral";
}

function detectUrgency(text: string): Urgency {
  const normalized = text.toLowerCase();

  for (const keyword of URGENCY_KEYWORDS.high) {
    if (normalized.includes(keyword)) return "high";
  }

  for (const keyword of URGENCY_KEYWORDS.medium) {
    if (normalized.includes(keyword)) return "medium";
  }

  return "low";
}

function classifyIntent(text: string): { category: IntentCategory; confidence: number } {
  let bestMatch: IntentCategory = "other";
  let highestScore = 0;

  for (const [category, patterns] of Object.entries(INTENT_PATTERNS)) {
    const matchCount = patterns.filter((pattern) => pattern.test(text)).length;
    const confidence = matchCount / patterns.length;

    if (confidence > highestScore) {
      highestScore = confidence;
      bestMatch = category as IntentCategory;
    }
  }

  // Boost confidence if we have entity extraction
  if (bestMatch === "order_status" && extractOrderNumber(text)) {
    highestScore = Math.min(1, highestScore + 0.2);
  }

  return { category: bestMatch, confidence: highestScore };
}

export function classify(
  messageContent: string,
  conversationHistory?: ConversationMessage[]
): Intent {
  const { category, confidence } = classifyIntent(messageContent);
  const sentiment = detectSentiment(messageContent);
  const urgency = detectUrgency(messageContent);

  const entities: Intent["entities"] = {
    orderNumber: extractOrderNumber(messageContent),
    trackingNumber: extractTrackingNumber(messageContent),
  };

  // If complaint detected, override with low confidence to force human review
  if (category === "complaint" || sentiment === "negative") {
    return {
      category: "complaint",
      confidence: 0, // Force human review
      entities,
      sentiment: "negative",
      urgency: "high",
    };
  }

  return {
    category,
    confidence,
    entities,
    sentiment,
    urgency,
  };
}

