/**
 * Customer Accounts Tools
 * 
 * Tools for the Accounts Agent to interact with Customer Accounts MCP.
 * Wraps the AccountsSubAgent service with OAuth and ABAC enforcement.
 * 
 * SECURITY: These tools handle PII and require OAuth tokens.
 * Only the Accounts Agent should have access to these tools.
 */

import { tool } from '@openai/agents';
import { z } from 'zod';
import { AccountsSubAgent } from '../../../../app/services/ai-customer/accounts-sub-agent.service.js';

// Initialize the AccountsSubAgent service
const accountsService = new AccountsSubAgent();

/**
 * Get customer orders
 * 
 * Retrieves order history for an authenticated customer.
 * Requires OAuth token and ABAC approval.
 */
export const getCustomerOrders = tool({
  name: 'get_customer_orders',
  description: 'Get order history for an authenticated customer. Requires OAuth token. Returns list of orders with details.',
  parameters: z.object({
    customerId: z.string().describe('The customer ID from the authenticated session'),
    token: z.string().describe('OAuth token for the customer session'),
    limit: z.number().min(1).max(50).default(10).describe('Maximum number of orders to return (1-50)'),
  }),
  async execute({ customerId, token, limit }) {
    try {
      const orders = await accountsService.getCustomerOrders(customerId, token, limit);
      
      return {
        success: true,
        orders,
        count: orders.length,
        message: `Retrieved ${orders.length} orders for customer ${customerId}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve customer orders',
      };
    }
  },
});

/**
 * Get order details
 * 
 * Retrieves detailed information for a specific order.
 * Requires OAuth token and ABAC approval.
 */
export const getOrderDetails = tool({
  name: 'get_order_details',
  description: 'Get detailed information for a specific order. Requires OAuth token. Returns order details including items, shipping, and status.',
  parameters: z.object({
    customerId: z.string().describe('The customer ID from the authenticated session'),
    orderId: z.string().describe('The order ID to retrieve details for'),
    token: z.string().describe('OAuth token for the customer session'),
  }),
  async execute({ customerId, orderId, token }) {
    try {
      const orderDetails = await accountsService.getOrderDetails(customerId, orderId, token);
      
      return {
        success: true,
        order: orderDetails,
        message: `Retrieved details for order ${orderId}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to retrieve order details for ${orderId}`,
      };
    }
  },
});

/**
 * Get customer account info
 * 
 * Retrieves account information for an authenticated customer.
 * Requires OAuth token and ABAC approval.
 * 
 * WARNING: This accesses PII (email, phone, addresses).
 */
export const getAccountInfo = tool({
  name: 'get_account_info',
  description: 'Get account information for an authenticated customer. Requires OAuth token. Returns email, phone, addresses (PII). Use only when necessary.',
  parameters: z.object({
    customerId: z.string().describe('The customer ID from the authenticated session'),
    token: z.string().describe('OAuth token for the customer session'),
  }),
  async execute({ customerId, token }) {
    try {
      const accountInfo = await accountsService.getAccountInfo(customerId, token);
      
      return {
        success: true,
        account: accountInfo,
        message: `Retrieved account info for customer ${customerId}`,
        piiAccessed: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve account information',
      };
    }
  },
});

/**
 * Update customer preferences
 * 
 * Updates customer preferences (marketing, notifications, etc.).
 * Requires OAuth token and ABAC approval.
 */
export const updatePreferences = tool({
  name: 'update_preferences',
  description: 'Update customer preferences (marketing, notifications). Requires OAuth token and approval. Returns success status.',
  parameters: z.object({
    customerId: z.string().describe('The customer ID from the authenticated session'),
    token: z.string().describe('OAuth token for the customer session'),
    preferences: z.object({
      marketing: z.boolean().optional().describe('Marketing email opt-in'),
      notifications: z.boolean().optional().describe('Order notification opt-in'),
      sms: z.boolean().optional().describe('SMS notification opt-in'),
    }).describe('Preferences to update'),
  }),
  async execute({ customerId, token, preferences }) {
    try {
      const success = await accountsService.updatePreferences(customerId, token, preferences);
      
      return {
        success,
        message: success 
          ? `Updated preferences for customer ${customerId}` 
          : 'Failed to update preferences',
        preferences,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to update customer preferences',
      };
    }
  },
});

/**
 * Get account metrics
 * 
 * Retrieves metrics for the Accounts Agent (for monitoring).
 * Does not require OAuth token.
 */
export const getAccountsMetrics = tool({
  name: 'get_accounts_metrics',
  description: 'Get metrics for the Accounts Agent (total queries, success rate, ABAC violations). For monitoring only.',
  parameters: z.object({}),
  async execute() {
    try {
      const metrics = await accountsService.getMetrics();
      
      return {
        success: true,
        metrics,
        message: 'Retrieved Accounts Agent metrics',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve metrics',
      };
    }
  },
});

