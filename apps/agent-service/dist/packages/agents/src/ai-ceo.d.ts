import { Agent } from "@openai/agents";
export declare const aiCEO: Agent<unknown, "text">;
/**
 * Handle CEO query
 *
 * @param userQuery - Natural language question from CEO
 * @returns Agent response with data and recommendations
 *
 * @example
 * const result = await handleCEOQuery("Should I reorder SKU-XYZ?");
 * console.log(result.response); // Agent's analysis and recommendation
 */
export declare function handleCEOQuery(userQuery: string): Promise<import("@openai/agents").RunResult<undefined, Agent<any, any>>>;
/**
 * Sample queries for testing:
 *
 * 1. "What are my top 3 products this month?"
 * 2. "Should I reorder Powder Board XL?"
 * 3. "Show me customers with lifetime value > $1000"
 * 4. "Summarize support tickets this week"
 * 5. "What's our conversion rate for the homepage?"
 * 6. "Find policy documentation for returns"
 * 7. "Analyze inventory levels for all products"
 * 8. "Generate weekly performance summary"
 */
//# sourceMappingURL=ai-ceo.d.ts.map