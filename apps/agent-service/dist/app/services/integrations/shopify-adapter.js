/**
 * Shopify Integration Adapter
 *
 * Provides type-safe methods for Shopify Admin API operations:
 * - Products and variants
 * - Orders and fulfillments
 * - Inventory management
 * - Customer data
 * - Webhooks
 */
import { APIClient } from './api-client';
import { integrationManager } from './integration-manager';
export class ShopifyAdapter {
    client;
    constructor() {
        this.client = new APIClient({
            baseURL: `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/2024-01`,
            headers: {
                'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
            },
            rateLimit: {
                maxRequestsPerSecond: 2,
                burstSize: 10,
            },
        });
    }
    // Products
    async getProducts(params) {
        return integrationManager.executeRequest('shopify', (client) => client.get('/products.json', { params }));
    }
    async getProduct(id, fields) {
        return integrationManager.executeRequest('shopify', (client) => client.get(`/products/${id}.json`, { params: fields ? { fields } : undefined }));
    }
    async createProduct(product) {
        return integrationManager.executeRequest('shopify', (client) => client.post('/products.json', { product }));
    }
    async updateProduct(id, product) {
        return integrationManager.executeRequest('shopify', (client) => client.put(`/products/${id}.json`, { product }));
    }
    async deleteProduct(id) {
        return integrationManager.executeRequest('shopify', (client) => client.delete(`/products/${id}.json`));
    }
    // Variants
    async getProductVariants(productId) {
        return integrationManager.executeRequest('shopify', (client) => client.get(`/products/${productId}/variants.json`));
    }
    async getVariant(id) {
        return integrationManager.executeRequest('shopify', (client) => client.get(`/variants/${id}.json`));
    }
    async createVariant(productId, variant) {
        return integrationManager.executeRequest('shopify', (client) => client.post(`/products/${productId}/variants.json`, { variant }));
    }
    async updateVariant(id, variant) {
        return integrationManager.executeRequest('shopify', (client) => client.put(`/variants/${id}.json`, { variant }));
    }
    async deleteVariant(id) {
        return integrationManager.executeRequest('shopify', (client) => client.delete(`/variants/${id}.json`));
    }
    // Orders
    async getOrders(params) {
        return integrationManager.executeRequest('shopify', (client) => client.get('/orders.json', { params }));
    }
    async getOrder(id, fields) {
        return integrationManager.executeRequest('shopify', (client) => client.get(`/orders/${id}.json`, { params: fields ? { fields } : undefined }));
    }
    async updateOrder(id, order) {
        return integrationManager.executeRequest('shopify', (client) => client.put(`/orders/${id}.json`, { order }));
    }
    async cancelOrder(id, reason, email) {
        return integrationManager.executeRequest('shopify', (client) => client.post(`/orders/${id}/cancel.json`, { reason, email }));
    }
    // Fulfillments
    async getFulfillments(orderId) {
        return integrationManager.executeRequest('shopify', (client) => client.get(`/orders/${orderId}/fulfillments.json`));
    }
    async createFulfillment(orderId, fulfillment) {
        return integrationManager.executeRequest('shopify', (client) => client.post(`/orders/${orderId}/fulfillments.json`, { fulfillment }));
    }
    async updateFulfillment(orderId, fulfillmentId, fulfillment) {
        return integrationManager.executeRequest('shopify', (client) => client.put(`/orders/${orderId}/fulfillments/${fulfillmentId}.json`, { fulfillment }));
    }
    async cancelFulfillment(orderId, fulfillmentId) {
        return integrationManager.executeRequest('shopify', (client) => client.post(`/orders/${orderId}/fulfillments/${fulfillmentId}/cancel.json`));
    }
    // Customers
    async getCustomers(params) {
        return integrationManager.executeRequest('shopify', (client) => client.get('/customers.json', { params }));
    }
    async getCustomer(id, fields) {
        return integrationManager.executeRequest('shopify', (client) => client.get(`/customers/${id}.json`, { params: fields ? { fields } : undefined }));
    }
    async createCustomer(customer) {
        return integrationManager.executeRequest('shopify', (client) => client.post('/customers.json', { customer }));
    }
    async updateCustomer(id, customer) {
        return integrationManager.executeRequest('shopify', (client) => client.put(`/customers/${id}.json`, { customer }));
    }
    // Inventory
    async getInventoryLevels(params) {
        return integrationManager.executeRequest('shopify', (client) => client.get('/inventory_levels.json', { params }));
    }
    async adjustInventoryLevel(inventoryItemId, locationId, adjustment) {
        return integrationManager.executeRequest('shopify', (client) => client.post('/inventory_levels/adjust.json', {
            inventory_item_id: inventoryItemId,
            location_id: locationId,
            adjustment,
        }));
    }
    async setInventoryLevel(inventoryItemId, locationId, available) {
        return integrationManager.executeRequest('shopify', (client) => client.post('/inventory_levels/set.json', {
            inventory_item_id: inventoryItemId,
            location_id: locationId,
            available,
        }));
    }
    // Webhooks
    async getWebhooks() {
        return integrationManager.executeRequest('shopify', (client) => client.get('/webhooks.json'));
    }
    async createWebhook(webhook) {
        return integrationManager.executeRequest('shopify', (client) => client.post('/webhooks.json', { webhook }));
    }
    async deleteWebhook(id) {
        return integrationManager.executeRequest('shopify', (client) => client.delete(`/webhooks/${id}.json`));
    }
    // Shop information
    async getShop() {
        return integrationManager.executeRequest('shopify', (client) => client.get('/shop.json'));
    }
}
export const shopifyAdapter = new ShopifyAdapter();
//# sourceMappingURL=shopify-adapter.js.map