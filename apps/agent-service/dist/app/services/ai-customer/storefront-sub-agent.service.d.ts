/**
 * Storefront Sub-Agent Service
 *
 * Handles catalog discovery, product searches, availability checks,
 * and public store policies using Shopify Storefront MCP tools.
 *
 * @module app/services/ai-customer/storefront-sub-agent.service
 */
export interface StorefrontQuery {
    id: string;
    customerId: string;
    query: string;
    type: 'product_search' | 'collection_browse' | 'availability_check' | 'policy_query';
    filters?: Record<string, any>;
    sortBy?: string;
    limit?: number;
    requestId: string;
    timestamp: string;
}
export interface StorefrontResponse {
    id: string;
    queryId: string;
    data: any;
    mcpRequestId: string;
    confidence: number;
    processingTime: number;
    timestamp: string;
}
export interface ProductSearchResult {
    products: Array<{
        id: string;
        title: string;
        handle: string;
        price: {
            amount: string;
            currencyCode: string;
        };
        available: boolean;
        images: Array<{
            url: string;
            altText: string;
        }>;
        variants: Array<{
            id: string;
            title: string;
            available: boolean;
            price: {
                amount: string;
                currencyCode: string;
            };
        }>;
    }>;
    collections: Array<{
        id: string;
        title: string;
        handle: string;
        description: string;
    }>;
    filters: Array<{
        id: string;
        label: string;
        type: string;
        values: Array<{
            id: string;
            label: string;
            count: number;
        }>;
    }>;
}
export interface AvailabilityCheckResult {
    productId: string;
    variantId?: string;
    available: boolean;
    quantity?: number;
    location?: string;
    estimatedRestock?: string;
}
export interface PolicyQueryResult {
    policyType: 'return' | 'shipping' | 'privacy' | 'terms';
    content: string;
    lastUpdated: string;
    applicable: boolean;
}
export declare class StorefrontSubAgent {
    private supabase;
    private mcpEnabled;
    constructor();
    /**
     * Search products using Storefront MCP
     */
    searchProducts(customerId: string, query: string, filters?: Record<string, any>, sortBy?: string, limit?: number): Promise<ProductSearchResult>;
    /**
     * Check product availability using Storefront MCP
     */
    checkAvailability(customerId: string, productId: string, variantId?: string, location?: string): Promise<AvailabilityCheckResult>;
    /**
     * Query store policies using Storefront MCP
     */
    queryPolicy(customerId: string, policyType: 'return' | 'shipping' | 'privacy' | 'terms'): Promise<PolicyQueryResult>;
    /**
     * Browse collections using Storefront MCP
     */
    browseCollections(customerId: string, collectionHandle?: string, limit?: number): Promise<Array<{
        id: string;
        title: string;
        handle: string;
        description: string;
        products: Array<{
            id: string;
            title: string;
            handle: string;
            price: {
                amount: string;
                currencyCode: string;
            };
            available: boolean;
            images: Array<{
                url: string;
                altText: string;
            }>;
        }>;
    }>>;
    /**
     * Simulate Storefront MCP call for product search
     */
    private simulateStorefrontMCPCall;
    /**
     * Simulate availability MCP call
     */
    private simulateAvailabilityMCPCall;
    /**
     * Simulate policy MCP call
     */
    private simulatePolicyMCPCall;
    /**
     * Simulate collection MCP call
     */
    private simulateCollectionMCPCall;
    /**
     * Get mock product search result
     */
    private getMockProductSearchResult;
    /**
     * Get mock policy result
     */
    private getMockPolicyResult;
    /**
     * Get mock collection result
     */
    private getMockCollectionResult;
    /**
     * Get Storefront Sub-Agent performance metrics
     */
    getPerformanceMetrics(): Promise<{
        totalQueries: number;
        successfulQueries: number;
        averageResponseTime: number;
        mcpEnabled: boolean;
        errorRate: number;
    }>;
}
/**
 * Default Storefront Sub-Agent instance
 */
export declare const storefrontSubAgent: StorefrontSubAgent;
//# sourceMappingURL=storefront-sub-agent.service.d.ts.map