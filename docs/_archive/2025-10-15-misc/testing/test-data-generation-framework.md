# Test Data Generation Framework (Task G)

**Technology**: Faker.js + Custom Factories  
**Purpose**: Generate realistic, deterministic test data  
**Date**: 2025-10-11

---

## Overview

Automated test data generation ensures:

- **Realistic data** for meaningful tests
- **Deterministic results** (seeded random)
- **Edge case coverage** (boundaries, nulls, special chars)
- **Reduced maintenance** (no manual test data)

---

## Setup

```bash
npm install -D @faker-js/faker
```

---

## Implementation

### Core Factory System

```typescript
// tests/fixtures/factories.ts
import { faker } from "@faker-js/faker";

// Set seed for deterministic data
faker.seed(12345);

/**
 * Base Factory
 */
export class Factory<T> {
  constructor(private generator: () => T) {}

  build(overrides: Partial<T> = {}): T {
    return { ...this.generator(), ...overrides };
  }

  buildList(count: number, overrides: Partial<T> = {}): T[] {
    return Array.from({ length: count }, () => this.build(overrides));
  }
}

/**
 * Queue Item Factory
 */
export const QueueItemFactory = new Factory(() => ({
  id: faker.string.uuid(),
  conversation_id: faker.number.int({ min: 1000, max: 99999 }),
  chatwoot_message_id: faker.number.int({ min: 1000, max: 99999 }),
  inbox_id: 1,
  customer_name: faker.person.fullName(),
  customer_email: faker.internet.email(),
  customer_message: faker.lorem.paragraph(),
  draft_response: faker.lorem.paragraphs(2),
  confidence_score: faker.number.int({ min: 0, max: 100 }),
  knowledge_sources: [],
  suggested_tags: [faker.lorem.word(), faker.lorem.word()],
  recommended_action: faker.helpers.arrayElement([
    "approve",
    "edit",
    "escalate",
    "reject",
  ]),
  priority: faker.helpers.arrayElement(["low", "normal", "high", "urgent"]),
  status: "pending",
  created_at: faker.date.recent().toISOString(),
}));

/**
 * Chatwoot Webhook Factory
 */
export const ChatwootWebhookFactory = new Factory(() => ({
  event: "message_created",
  id: faker.number.int({ min: 1000, max: 99999 }),
  message_type: "incoming",
  content: faker.lorem.sentence(),
  created_at: faker.date.recent().toISOString(),
  inbox: {
    id: 1,
    name: "Support Inbox",
  },
  conversation: {
    id: faker.number.int({ min: 1000, max: 99999 }),
    status: "open",
    messages: [],
  },
  sender: {
    id: faker.number.int({ min: 100, max: 999 }),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    type: "contact",
  },
  account: {
    id: 1,
    name: "HotDash",
  },
}));

/**
 * Agent SDK Draft Factory
 */
export const AgentSDKDraftFactory = new Factory(() => ({
  draft_response: faker.lorem.paragraphs(2),
  confidence_score: faker.number.int({ min: 60, max: 99 }),
  recommended_action: faker.helpers.arrayElement([
    "approve",
    "edit",
    "escalate",
  ]),
  sources: [
    {
      title: faker.lorem.words(3),
      version: `v${faker.number.int({ min: 1, max: 5 })}.${faker.number.int({ min: 0, max: 9 })}`,
      relevance: faker.number.float({ min: 0.7, max: 1.0, precision: 0.01 }),
      content: faker.lorem.paragraph(),
    },
  ],
  suggested_tags: [faker.lorem.word(), faker.lorem.word()],
  sentiment: {
    customer_sentiment: faker.helpers.arrayElement([
      "happy",
      "neutral",
      "frustrated",
      "angry",
    ]),
    urgency: faker.helpers.arrayElement(["low", "medium", "high"]),
  },
}));
```

---

## Usage in Tests

### Basic Usage

```typescript
import { QueueItemFactory } from "../fixtures/factories";

it("should process queue item", () => {
  // Generate single item
  const item = QueueItemFactory.build();

  const result = processQueueItem(item);
  expect(result.success).toBe(true);
});

it("should handle batch processing", () => {
  // Generate 10 items
  const items = QueueItemFactory.buildList(10);

  const results = processBatch(items);
  expect(results).toHaveLength(10);
});
```

### With Overrides

```typescript
it("should escalate low confidence items", () => {
  // Generate item with specific properties
  const lowConfidenceItem = QueueItemFactory.build({
    confidence_score: 45,
    recommended_action: "escalate",
  });

  const result = processQueueItem(lowConfidenceItem);
  expect(result.action).toBe("escalate");
});
```

### Test Scenarios

```typescript
// tests/fixtures/scenarios.ts
export const TestScenarios = {
  highConfidence: () =>
    QueueItemFactory.build({
      confidence_score: 92,
      recommended_action: "approve",
    }),

  lowConfidence: () =>
    QueueItemFactory.build({
      confidence_score: 35,
      recommended_action: "escalate",
    }),

  urgentCase: () =>
    QueueItemFactory.build({
      priority: "urgent",
      sentiment: { customer_sentiment: "angry", urgency: "high" },
    }),

  refundRequest: () =>
    ChatwootWebhookFactory.build({
      content: "I want a refund for order #12345!",
    }),
};

// Usage
it("should handle urgent cases", () => {
  const urgentItem = TestScenarios.urgentCase();
  const result = processQueueItem(urgentItem);
  expect(result.priority).toBe("urgent");
});
```

---

## Specialized Generators

### Edge Case Generator

```typescript
export class EdgeCaseGenerator {
  static emptyStrings() {
    return ["", " ", "   ", "\t", "\n"];
  }

  static specialCharacters() {
    return ["<script>", "'; DROP TABLE", "../../../etc/passwd", "💩", "™®©"];
  }

  static boundaries() {
    return {
      numbers: [0, -1, 1, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER],
      dates: [new Date(0), new Date("9999-12-31"), new Date()],
      strings: ["", "a", "x".repeat(10000)],
    };
  }

  static nullish() {
    return [null, undefined, NaN];
  }
}

// Usage
describe("input validation", () => {
  EdgeCaseGenerator.emptyStrings().forEach((str) => {
    it(`should handle empty string variant: "${str}"`, () => {
      expect(() => processInput(str)).toThrow("Input required");
    });
  });

  EdgeCaseGenerator.specialCharacters().forEach((char) => {
    it(`should sanitize special character: "${char}"`, () => {
      const result = sanitize(char);
      expect(result).not.toContain(char);
    });
  });
});
```

---

## Database Seeding

### Seed Helper

```typescript
// tests/fixtures/database-seeder.ts
import { supabase } from "~/config/supabase.server";
import { QueueItemFactory } from "./factories";

export class DatabaseSeeder {
  static async seedApprovalQueue(count: number = 10) {
    const items = QueueItemFactory.buildList(count);

    const { data, error } = await supabase
      .from("agent_sdk_approval_queue")
      .insert(items)
      .select();

    if (error) throw error;
    return data;
  }

  static async clearApprovalQueue() {
    await supabase
      .from("agent_sdk_approval_queue")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
  }

  static async seedScenario(scenario: "empty" | "light" | "heavy" | "urgent") {
    await this.clearApprovalQueue();

    switch (scenario) {
      case "empty":
        return [];

      case "light":
        return await this.seedApprovalQueue(5);

      case "heavy":
        return await this.seedApprovalQueue(100);

      case "urgent":
        const urgentItems = QueueItemFactory.buildList(10, {
          priority: "urgent",
        });
        const { data } = await supabase
          .from("agent_sdk_approval_queue")
          .insert(urgentItems)
          .select();
        return data;
    }
  }
}

// Usage in tests
beforeEach(async () => {
  await DatabaseSeeder.seedScenario("light");
});
```

---

## Property-Based Testing (Advanced)

### Concept

Instead of specific test cases, generate hundreds of random inputs and verify properties hold true.

```typescript
import { fc } from "fast-check";

it("discount should never be negative", () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 1000 }), // price
      fc.integer({ min: 0, max: 100 }), // discount %
      (price, discount) => {
        const result = calculateDiscount(price, discount);
        return result >= 0; // Property: result always >= 0
      },
    ),
  );
});

it("confidence score should always be 0-100", () => {
  fc.assert(
    fc.property(
      fc.string(), // any customer message
      fc.array(fc.record({ title: fc.string(), relevance: fc.float() })), // any sources
      (message, sources) => {
        const draft = generateDraft(message, sources);
        return draft.confidence_score >= 0 && draft.confidence_score <= 100;
      },
    ),
  );
});
```

---

## NPM Scripts

```json
{
  "test:mutation": "stryker run",
  "test:mutation:report": "stryker run --reporters html",
  "seed:test-data": "tsx tests/fixtures/seed-test-data.ts"
}
```

---

**Status**: Framework designed  
**Effort**: 10 hours (setup + configuration + initial run)  
**Value**: Validates test effectiveness, not just coverage
