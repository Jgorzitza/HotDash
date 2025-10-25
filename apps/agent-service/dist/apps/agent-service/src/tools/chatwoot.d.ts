import { z } from 'zod';
/**
 * Create a private note in a conversation for human review.
 * Use this to propose drafts, summaries, and next actions.
 *
 * Private notes are only visible to agents/operators, not customers.
 * No approval required since it's internal only.
 */
export declare const cwCreatePrivateNote: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    conversationId: z.ZodNumber;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    conversationId?: number;
    content?: string;
}, {
    conversationId?: number;
    content?: string;
}>, string>;
/**
 * Send a public reply to the customer.
 *
 * ⚠️ REQUIRES APPROVAL - This sends a message visible to the customer.
 * Keep this behind needsApproval for safety.
 */
export declare const cwSendPublicReply: import("@openai/agents").FunctionTool<unknown, z.ZodObject<{
    conversationId: z.ZodNumber;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    conversationId?: number;
    content?: string;
}, {
    conversationId?: number;
    content?: string;
}>, string>;
//# sourceMappingURL=chatwoot.d.ts.map