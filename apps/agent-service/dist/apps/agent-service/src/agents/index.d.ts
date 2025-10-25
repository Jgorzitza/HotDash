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
 * Shipping Support Agent
 *
 * Handles all shipping-related inquiries: tracking, delivery estimates, shipping methods.
 * Provides tracking information and helps with shipping issues.
 * Never sends public replies without approval.
 */
export declare const shippingSupportAgent: Agent<unknown, "text">;
/**
 * Technical Support Agent
 *
 * Handles product setup, troubleshooting, and warranty claims.
 * Provides technical guidance and creates repair tickets when needed.
 * Never sends public replies without approval.
 */
export declare const technicalSupportAgent: Agent<unknown, "text">;
/**
 * Storefront Support Agent
 *
 * Handles catalog discovery, product availability, collection browsing,
 * and store policy questions using Storefront MCP.
 * Never sends public replies without approval.
 */
export declare const storefrontAgent: Agent<unknown, "text">;
/**
 * Customer Accounts Agent
 *
 * Handles authenticated customer account requests using Customer Accounts MCP.
 * This is the ONLY agent allowed to call Customer Accounts MCP with OAuth tokens.
 * Implements ABAC security for PII access.
 *
 * SECURITY:
 * - Requires OAuth token from authenticated customer session
 * - ABAC policy enforcement for all operations
 * - PII redaction in audit logs
 * - Never sends public replies without approval
 */
export declare const customerAccountsAgent: Agent<unknown, "text">;
/**
 * Triage Agent
 *
 * First point of contact - classifies intent and routes to specialist agents.
 * Enhanced with more specialized routing options.
 * Hands off to appropriate specialist for handling.
 */
export declare const triageAgent: Agent<unknown, "text">;
//# sourceMappingURL=index.d.ts.map