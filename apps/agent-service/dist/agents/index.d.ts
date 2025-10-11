import { Agent } from '@openai/agents';
/**
 * Order Support Agent
 *
 * Handles order-related requests: status checks, returns, exchanges, cancellations.
 * Always checks order status first before proposing actions.
 * Never sends public replies without approval.
 */
export declare const orderSupportAgent: Agent<unknown, "text">;
/**
 * Product Q&A Agent
 *
 * Answers product questions based on internal docs/FAQs/spec sheets.
 * If missing info, requests human input via private note.
 * No public replies without approval.
 */
export declare const productQAAgent: Agent<unknown, "text">;
/**
 * Triage Agent
 *
 * First point of contact - classifies intent and routes to specialist agents.
 * Decides whether conversation is about orders or product questions.
 * Hands off to appropriate specialist for handling.
 */
export declare const triageAgent: Agent<unknown, "text">;
//# sourceMappingURL=index.d.ts.map