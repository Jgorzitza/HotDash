/**
 * Accounts Sub-Agent Service
 *
 * Handles authenticated customer tasks using Customer Accounts MCP.
 * This is the ONLY agent allowed to call Customer Accounts MCP with OAuth tokens.
 * Implements ABAC security for PII access.
 *
 * @module app/services/ai-customer/accounts-sub-agent.service
 */
export interface CustomerAccountQuery {
    id: string;
    customerId: string;
    token: string;
    action: 'get_orders' | 'get_order_details' | 'get_account_info' | 'update_preferences' | 'get_addresses';
    requestId: string;
    timestamp: string;
    piiAccessed: boolean;
}
export interface CustomerAccountResponse {
    id: string;
    queryId: string;
    data: any;
    mcpRequestId: string;
    piiRedacted: boolean;
    confidence: number;
    processingTime: number;
    timestamp: string;
}
export interface CustomerOrder {
    id: string;
    orderNumber: string;
    status: string;
    totalPrice: {
        amount: string;
        currencyCode: string;
    };
    createdAt: string;
    lineItems: Array<{
        id: string;
        title: string;
        quantity: number;
        price: {
            amount: string;
            currencyCode: string;
        };
    }>;
    shippingAddress?: {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        province: string;
        country: string;
        zip: string;
    };
    trackingInfo?: {
        number: string;
        url: string;
        status: string;
    };
}
export interface CustomerAccountInfo {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    defaultAddress?: {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        province: string;
        country: string;
        zip: string;
    };
    preferences: {
        newsletter: boolean;
        smsUpdates: boolean;
        language: string;
    };
}
export interface ABACPolicy {
    agent: string;
    customerId: string;
    action: string;
    resource: string;
    allowed: boolean;
    reason?: string;
}
export declare class AccountsSubAgent {
    private supabase;
    private mcpEnabled;
    constructor();
    /**
     * Get customer orders using Customer Accounts MCP
     */
    getCustomerOrders(customerId: string, token: string, limit?: number): Promise<CustomerOrder[]>;
    /**
     * Get specific order details using Customer Accounts MCP
     */
    getOrderDetails(customerId: string, orderId: string, token: string): Promise<CustomerOrder | null>;
    /**
     * Get customer account information using Customer Accounts MCP
     */
    getCustomerAccountInfo(customerId: string, token: string): Promise<CustomerAccountInfo | null>;
    /**
     * Update customer preferences using Customer Accounts MCP
     */
    updateCustomerPreferences(customerId: string, token: string, preferences: Partial<CustomerAccountInfo['preferences']>): Promise<boolean>;
    /**
     * Check ABAC (Attribute-Based Access Control) policy
     */
    private checkABACPolicy;
    /**
     * Simulate Customer Accounts MCP call for orders
     */
    private simulateCustomerAccountsMCPCall;
    /**
     * Simulate order details MCP call
     */
    private simulateOrderDetailsMCPCall;
    /**
     * Simulate account info MCP call
     */
    private simulateAccountInfoMCPCall;
    /**
     * Simulate update preferences MCP call
     */
    private simulateUpdatePreferencesMCPCall;
    /**
     * Get mock customer orders
     */
    private getMockCustomerOrders;
    /**
     * Get mock order details
     */
    private getMockOrderDetails;
    /**
     * Get mock customer account info
     */
    private getMockCustomerAccountInfo;
    /**
     * Get Accounts Sub-Agent performance metrics
     */
    getPerformanceMetrics(): Promise<{
        totalQueries: number;
        successfulQueries: number;
        averageResponseTime: number;
        mcpEnabled: boolean;
        abacViolations: number;
        piiAccessCount: number;
    }>;
}
/**
 * Default Accounts Sub-Agent instance
 */
export declare const accountsSubAgent: AccountsSubAgent;
//# sourceMappingURL=accounts-sub-agent.service.d.ts.map