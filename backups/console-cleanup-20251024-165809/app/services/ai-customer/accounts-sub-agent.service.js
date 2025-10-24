/**
 * Accounts Sub-Agent Service
 *
 * Handles authenticated customer tasks using Customer Accounts MCP.
 * This is the ONLY agent allowed to call Customer Accounts MCP with OAuth tokens.
 * Implements ABAC security for PII access.
 *
 * @module app/services/ai-customer/accounts-sub-agent.service
 */
import { createClient } from '@supabase/supabase-js';
import { logDecision } from '../decisions.server.js';
export class AccountsSubAgent {
    supabase;
    mcpEnabled;
    constructor() {
        this.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        this.mcpEnabled = process.env.CUSTOMER_ACCOUNTS_MCP_ENABLED === 'true';
    }
    /**
     * Get customer orders using Customer Accounts MCP
     */
    async getCustomerOrders(customerId, token, limit = 10) {
        try {
            // Check ABAC policy
            const abacResult = await this.checkABACPolicy({
                agent: 'accounts-sub-agent',
                customerId,
                action: 'get_orders',
                resource: 'customer_orders',
            });
            if (!abacResult.allowed) {
                throw new Error(`ABAC policy violation: ${abacResult.reason}`);
            }
            const queryId = `orders-${Date.now()}`;
            // Log query start with PII audit
            await logDecision({
                scope: 'build',
                actor: 'ai-customer',
                action: 'customer_accounts_get_orders',
                rationale: `Getting orders for customer ${customerId} (ABAC approved)`,
                evidenceUrl: 'app/services/ai-customer/accounts-sub-agent.service.ts',
                payload: {
                    queryId,
                    customerId,
                    action: 'get_orders',
                    piiAccessed: true,
                    abacApproved: true,
                },
            });
            if (!this.mcpEnabled) {
                // Fallback to mock data when MCP is not available
                return this.getMockCustomerOrders(customerId);
            }
            // This would call actual Customer Accounts MCP tools
            const mcpCall = {
                tool: 'customer-accounts-mcp',
                action: 'get_orders',
                customerId,
                token: token.substring(0, 10) + '...', // Truncate for logging
                limit,
                requestId: `customer-accounts-${Date.now()}`,
                timestamp: new Date().toISOString(),
            };
            // Simulate MCP response (would be actual MCP response)
            const result = await this.simulateCustomerAccountsMCPCall(mcpCall);
            // Log successful response
            await logDecision({
                scope: 'build',
                actor: 'ai-customer',
                action: 'customer_accounts_get_orders_success',
                rationale: `Customer orders retrieved successfully`,
                evidenceUrl: 'app/services/ai-customer/accounts-sub-agent.service.ts',
                payload: {
                    queryId,
                    mcpRequestId: mcpCall.requestId,
                    orderCount: result.length,
                    piiRedacted: false, // Would be true in production for audit logs
                },
            });
            return result;
        }
        catch (error) {
            console.error('Error getting customer orders:', error);
            // Log error
            await logDecision({
                scope: 'build',
                actor: 'ai-customer',
                action: 'customer_accounts_get_orders_error',
                rationale: `Failed to get customer orders: ${error}`,
                evidenceUrl: 'app/services/ai-customer/accounts-sub-agent.service.ts',
                payload: { error: error.message },
            });
            throw error;
        }
    }
    /**
     * Get specific order details using Customer Accounts MCP
     */
    async getOrderDetails(customerId, orderId, token) {
        try {
            // Check ABAC policy
            const abacResult = await this.checkABACPolicy({
                agent: 'accounts-sub-agent',
                customerId,
                action: 'get_order_details',
                resource: `order_${orderId}`,
            });
            if (!abacResult.allowed) {
                throw new Error(`ABAC policy violation: ${abacResult.reason}`);
            }
            const queryId = `order-details-${Date.now()}`;
            // Log query start
            await logDecision({
                scope: 'build',
                actor: 'ai-customer',
                action: 'customer_accounts_get_order_details',
                rationale: `Getting order details for order ${orderId}`,
                evidenceUrl: 'app/services/ai-customer/accounts-sub-agent.service.ts',
                payload: {
                    queryId,
                    customerId,
                    orderId,
                    action: 'get_order_details',
                    piiAccessed: true,
                    abacApproved: true,
                },
            });
            if (!this.mcpEnabled) {
                // Fallback to mock data
                return this.getMockOrderDetails(orderId);
            }
            // This would call actual Customer Accounts MCP tools
            const mcpCall = {
                tool: 'customer-accounts-mcp',
                action: 'get_order_details',
                customerId,
                orderId,
                token: token.substring(0, 10) + '...',
                requestId: `order-details-${Date.now()}`,
                timestamp: new Date().toISOString(),
            };
            // Simulate MCP response
            const result = await this.simulateOrderDetailsMCPCall(mcpCall);
            // Log successful response
            await logDecision({
                scope: 'build',
                actor: 'ai-customer',
                action: 'customer_accounts_get_order_details_success',
                rationale: `Order details retrieved successfully`,
                evidenceUrl: 'app/services/ai-customer/accounts-sub-agent.service.ts',
                payload: {
                    queryId,
                    mcpRequestId: mcpCall.requestId,
                    orderId,
                },
            });
            return result;
        }
        catch (error) {
            console.error('Error getting order details:', error);
            await logDecision({
                scope: 'build',
                actor: 'ai-customer',
                action: 'customer_accounts_get_order_details_error',
                rationale: `Failed to get order details: ${error}`,
                evidenceUrl: 'app/services/ai-customer/accounts-sub-agent.service.ts',
                payload: { error: error.message },
            });
            throw error;
        }
    }
    /**
     * Get customer account information using Customer Accounts MCP
     */
    async getCustomerAccountInfo(customerId, token) {
        try {
            // Check ABAC policy
            const abacResult = await this.checkABACPolicy({
                agent: 'accounts-sub-agent',
                customerId,
                action: 'get_account_info',
                resource: 'customer_account',
            });
            if (!abacResult.allowed) {
                throw new Error(`ABAC policy violation: ${abacResult.reason}`);
            }
            const queryId = `account-info-${Date.now()}`;
            // Log query start
            await logDecision({
                scope: 'build',
                actor: 'ai-customer',
                action: 'customer_accounts_get_account_info',
                rationale: `Getting account info for customer ${customerId}`,
                evidenceUrl: 'app/services/ai-customer/accounts-sub-agent.service.ts',
                payload: {
                    queryId,
                    customerId,
                    action: 'get_account_info',
                    piiAccessed: true,
                    abacApproved: true,
                },
            });
            if (!this.mcpEnabled) {
                // Fallback to mock data
                return this.getMockCustomerAccountInfo(customerId);
            }
            // This would call actual Customer Accounts MCP tools
            const mcpCall = {
                tool: 'customer-accounts-mcp',
                action: 'get_account_info',
                customerId,
                token: token.substring(0, 10) + '...',
                requestId: `account-info-${Date.now()}`,
                timestamp: new Date().toISOString(),
            };
            // Simulate MCP response
            const result = await this.simulateAccountInfoMCPCall(mcpCall);
            // Log successful response
            await logDecision({
                scope: 'build',
                actor: 'ai-customer',
                action: 'customer_accounts_get_account_info_success',
                rationale: `Customer account info retrieved successfully`,
                evidenceUrl: 'app/services/ai-customer/accounts-sub-agent.service.ts',
                payload: {
                    queryId,
                    mcpRequestId: mcpCall.requestId,
                },
            });
            return result;
        }
        catch (error) {
            console.error('Error getting customer account info:', error);
            await logDecision({
                scope: 'build',
                actor: 'ai-customer',
                action: 'customer_accounts_get_account_info_error',
                rationale: `Failed to get customer account info: ${error}`,
                evidenceUrl: 'app/services/ai-customer/accounts-sub-agent.service.ts',
                payload: { error: error.message },
            });
            throw error;
        }
    }
    /**
     * Update customer preferences using Customer Accounts MCP
     */
    async updateCustomerPreferences(customerId, token, preferences) {
        try {
            // Check ABAC policy
            const abacResult = await this.checkABACPolicy({
                agent: 'accounts-sub-agent',
                customerId,
                action: 'update_preferences',
                resource: 'customer_preferences',
            });
            if (!abacResult.allowed) {
                throw new Error(`ABAC policy violation: ${abacResult.reason}`);
            }
            const queryId = `update-prefs-${Date.now()}`;
            // Log update start
            await logDecision({
                scope: 'build',
                actor: 'ai-customer',
                action: 'customer_accounts_update_preferences',
                rationale: `Updating preferences for customer ${customerId}`,
                evidenceUrl: 'app/services/ai-customer/accounts-sub-agent.service.ts',
                payload: {
                    queryId,
                    customerId,
                    action: 'update_preferences',
                    preferences,
                    abacApproved: true,
                },
            });
            if (!this.mcpEnabled) {
                // Fallback - just return success
                return true;
            }
            // This would call actual Customer Accounts MCP tools
            const mcpCall = {
                tool: 'customer-accounts-mcp',
                action: 'update_preferences',
                customerId,
                token: token.substring(0, 10) + '...',
                preferences,
                requestId: `update-prefs-${Date.now()}`,
                timestamp: new Date().toISOString(),
            };
            // Simulate MCP response
            const result = await this.simulateUpdatePreferencesMCPCall(mcpCall);
            // Log successful response
            await logDecision({
                scope: 'build',
                actor: 'ai-customer',
                action: 'customer_accounts_update_preferences_success',
                rationale: `Customer preferences updated successfully`,
                evidenceUrl: 'app/services/ai-customer/accounts-sub-agent.service.ts',
                payload: {
                    queryId,
                    mcpRequestId: mcpCall.requestId,
                },
            });
            return result;
        }
        catch (error) {
            console.error('Error updating customer preferences:', error);
            await logDecision({
                scope: 'build',
                actor: 'ai-customer',
                action: 'customer_accounts_update_preferences_error',
                rationale: `Failed to update customer preferences: ${error}`,
                evidenceUrl: 'app/services/ai-customer/accounts-sub-agent.service.ts',
                payload: { error: error.message },
            });
            throw error;
        }
    }
    /**
     * Check ABAC (Attribute-Based Access Control) policy
     */
    async checkABACPolicy(policy) {
        try {
            // In production, this would check against actual ABAC policies
            // For now, implement basic validation
            // Only accounts-sub-agent can access Customer Accounts MCP
            if (policy.agent !== 'accounts-sub-agent') {
                return {
                    ...policy,
                    allowed: false,
                    reason: 'Only accounts-sub-agent can access Customer Accounts MCP',
                };
            }
            // Validate customer ID format
            if (!policy.customerId || policy.customerId.length < 3) {
                return {
                    ...policy,
                    allowed: false,
                    reason: 'Invalid customer ID format',
                };
            }
            // Allowed actions
            const allowedActions = ['get_orders', 'get_order_details', 'get_account_info', 'update_preferences', 'get_addresses'];
            if (!allowedActions.includes(policy.action)) {
                return {
                    ...policy,
                    allowed: false,
                    reason: 'Action not allowed',
                };
            }
            // Log ABAC check
            await logDecision({
                scope: 'build',
                actor: 'ai-customer',
                action: 'abac_policy_check',
                rationale: `ABAC policy check for ${policy.action}`,
                evidenceUrl: 'app/services/ai-customer/accounts-sub-agent.service.ts',
                payload: {
                    agent: policy.agent,
                    customerId: policy.customerId,
                    action: policy.action,
                    resource: policy.resource,
                },
            });
            return {
                ...policy,
                allowed: true,
            };
        }
        catch (error) {
            console.error('Error checking ABAC policy:', error);
            return {
                ...policy,
                allowed: false,
                reason: 'ABAC policy check failed',
            };
        }
    }
    /**
     * Simulate Customer Accounts MCP call for orders
     */
    async simulateCustomerAccountsMCPCall(mcpCall) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return this.getMockCustomerOrders(mcpCall.customerId);
    }
    /**
     * Simulate order details MCP call
     */
    async simulateOrderDetailsMCPCall(mcpCall) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return this.getMockOrderDetails(mcpCall.orderId);
    }
    /**
     * Simulate account info MCP call
     */
    async simulateAccountInfoMCPCall(mcpCall) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return this.getMockCustomerAccountInfo(mcpCall.customerId);
    }
    /**
     * Simulate update preferences MCP call
     */
    async simulateUpdatePreferencesMCPCall(mcpCall) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return true;
    }
    /**
     * Get mock customer orders
     */
    getMockCustomerOrders(customerId) {
        return [
            {
                id: 'order-1',
                orderNumber: 'ORD-001',
                status: 'fulfilled',
                totalPrice: { amount: '149.99', currencyCode: 'USD' },
                createdAt: '2025-01-15T10:30:00Z',
                lineItems: [
                    {
                        id: 'item-1',
                        title: 'Premium Brake Pads',
                        quantity: 1,
                        price: { amount: '89.99', currencyCode: 'USD' }
                    },
                    {
                        id: 'item-2',
                        title: 'Brake Fluid',
                        quantity: 2,
                        price: { amount: '30.00', currencyCode: 'USD' }
                    }
                ],
                shippingAddress: {
                    firstName: 'John',
                    lastName: 'Doe',
                    address1: '123 Main St',
                    city: 'Anytown',
                    province: 'CA',
                    country: 'US',
                    zip: '12345'
                },
                trackingInfo: {
                    number: 'TRK123456789',
                    url: 'https://tracking.example.com/TRK123456789',
                    status: 'delivered'
                }
            }
        ];
    }
    /**
     * Get mock order details
     */
    getMockOrderDetails(orderId) {
        const orders = this.getMockCustomerOrders('mock-customer');
        return orders.find(order => order.id === orderId) || null;
    }
    /**
     * Get mock customer account info
     */
    getMockCustomerAccountInfo(customerId) {
        return {
            id: customerId,
            email: 'customer@example.com',
            firstName: 'John',
            lastName: 'Doe',
            phone: '+1-555-123-4567',
            defaultAddress: {
                firstName: 'John',
                lastName: 'Doe',
                address1: '123 Main St',
                city: 'Anytown',
                province: 'CA',
                country: 'US',
                zip: '12345'
            },
            preferences: {
                newsletter: true,
                smsUpdates: false,
                language: 'en'
            }
        };
    }
    /**
     * Get Accounts Sub-Agent performance metrics
     */
    async getPerformanceMetrics() {
        try {
            const { data: queries, error } = await this.supabase
                .from('customer_account_queries')
                .select('*');
            if (error) {
                throw new Error(`Failed to fetch performance metrics: ${error.message}`);
            }
            const totalQueries = queries?.length || 0;
            const successfulQueries = queries?.filter(q => q.status === 'success').length || 0;
            const abacViolations = queries?.filter(q => q.abacViolation).length || 0;
            const piiAccessCount = queries?.filter(q => q.piiAccessed).length || 0;
            const responseTimes = queries?.map(q => q.processingTime || 0) || [];
            const averageResponseTime = responseTimes.length > 0
                ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
                : 0;
            return {
                totalQueries,
                successfulQueries,
                averageResponseTime,
                mcpEnabled: this.mcpEnabled,
                abacViolations,
                piiAccessCount,
            };
        }
        catch (error) {
            console.error('Error fetching performance metrics:', error);
            return {
                totalQueries: 0,
                successfulQueries: 0,
                averageResponseTime: 0,
                mcpEnabled: this.mcpEnabled,
                abacViolations: 0,
                piiAccessCount: 0,
            };
        }
    }
}
/**
 * Default Accounts Sub-Agent instance
 */
export const accountsSubAgent = new AccountsSubAgent();
//# sourceMappingURL=accounts-sub-agent.service.js.map