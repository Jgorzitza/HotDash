/**
 * MCP Integration Service
 *
 * Centralizes production MCP tool integrations for the AI customer service system.
 * Handles Shopify Storefront MCP and Customer Accounts MCP tools for customer service.
 *
 * @module app/services/ai-customer/mcp-integration.service
 */
export interface MCPToolCall {
    id: string;
    tool: 'storefront-mcp' | 'customer-accounts-mcp';
    action: string;
    parameters: Record<string, any>;
    requestId: string;
    timestamp: string;
    customerId?: string;
    piiAccessed: boolean;
}
export interface MCPToolResponse {
    id: string;
    toolCallId: string;
    success: boolean;
    data: any;
    error?: string;
    processingTime: number;
    timestamp: string;
}
export interface MCPValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    recommendations: string[];
}
export declare class MCPIntegrationService {
    private supabase;
    private toolCalls;
    private responses;
    constructor();
    /**
     * Call Storefront MCP for product catalog operations
     */
    callStorefrontMCP(action: string, parameters: Record<string, any>): Promise<any>;
    /**
     * Call Customer Accounts MCP for authenticated customer operations
     */
    callCustomerAccountsMCP(action: string, parameters: Record<string, any>): Promise<any>;
    /**
     * Get MCP integration metrics
     */
    getMCPMetrics(): Promise<{
        totalToolCalls: number;
        successfulCalls: number;
        failedCalls: number;
        averageProcessingTime: number;
        toolUsageDistribution: Record<string, number>;
        piiAccessCount: number;
    }>;
    /**
     * Simulate Storefront MCP call
     */
    private simulateStorefrontMCPCall;
    /**
     * Simulate Customer Accounts MCP call
     */
    private simulateCustomerAccountsMCPCall;
}
/**
 * Default MCP Integration Service instance
 */
export declare const mcpIntegrationService: MCPIntegrationService;
//# sourceMappingURL=mcp-integration.service.d.ts.map