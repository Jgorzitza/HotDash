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
import { APIResponse } from './api-client';
export interface ShopifyProduct {
    id: string;
    title: string;
    handle: string;
    status: 'active' | 'archived' | 'draft';
    product_type: string;
    vendor: string;
    tags: string[];
    variants: ShopifyVariant[];
    images: ShopifyImage[];
    created_at: string;
    updated_at: string;
}
export interface ShopifyVariant {
    id: string;
    product_id: string;
    title: string;
    price: string;
    sku: string;
    position: number;
    inventory_policy: 'deny' | 'continue';
    compare_at_price?: string;
    fulfillment_service: string;
    inventory_management: string;
    option1?: string;
    option2?: string;
    option3?: string;
    created_at: string;
    updated_at: string;
    taxable: boolean;
    barcode?: string;
    grams: number;
    image_id?: string;
    weight: number;
    weight_unit: string;
    inventory_item_id: string;
    inventory_quantity: number;
    old_inventory_quantity: number;
    requires_shipping: boolean;
    admin_graphql_api_id: string;
}
export interface ShopifyImage {
    id: string;
    product_id: string;
    position: number;
    created_at: string;
    updated_at: string;
    alt?: string;
    width: number;
    height: number;
    src: string;
    variant_ids: string[];
    admin_graphql_api_id: string;
}
export interface ShopifyOrder {
    id: string;
    name: string;
    email?: string;
    created_at: string;
    updated_at: string;
    cancelled_at?: string;
    closed_at?: string;
    processed_at: string;
    number: number;
    note?: string;
    token: string;
    gateway: string;
    test: boolean;
    total_price: string;
    subtotal_price: string;
    total_weight: number;
    total_tax: string;
    taxes_included: boolean;
    currency: string;
    financial_status: string;
    confirmed: boolean;
    total_discounts: string;
    buyer_accepts_marketing: boolean;
    name: string;
    referring_site?: string;
    landing_site?: string;
    cancelled_at?: string;
    closed_at?: string;
    processed_at: string;
    reference?: string;
    user_id?: string;
    location_id?: string;
    source_identifier?: string;
    source_url?: string;
    device_id?: string;
    phone?: string;
    customer_locale?: string;
    app_id?: string;
    browser_ip?: string;
    landing_site_ref?: string;
    order_number: number;
    discount_applications: any[];
    discount_codes: any[];
    note_attributes: any[];
    payment_gateway_names: string[];
    processing_method: string;
    checkout_id?: string;
    source_name: string;
    fulfillment_status?: string;
    order_adjustments: any[];
    billing_address: ShopifyAddress;
    shipping_address: ShopifyAddress;
    customer: ShopifyCustomer;
    line_items: ShopifyLineItem[];
    fulfillments: ShopifyFulfillment[];
    refunds: ShopifyRefund[];
}
export interface ShopifyAddress {
    first_name: string;
    address1: string;
    phone?: string;
    city: string;
    zip: string;
    province?: string;
    country: string;
    last_name: string;
    address2?: string;
    company?: string;
    latitude?: number;
    longitude?: number;
    name: string;
    country_code: string;
    province_code?: string;
}
export interface ShopifyCustomer {
    id: string;
    email?: string;
    accepts_marketing: boolean;
    created_at: string;
    updated_at: string;
    first_name: string;
    last_name: string;
    orders_count: number;
    state: string;
    total_spent: string;
    last_order_id?: string;
    note?: string;
    verified_email: boolean;
    multipass_identifier?: string;
    tax_exempt: boolean;
    phone?: string;
    tags: string;
    last_order_name?: string;
    currency: string;
    accepts_marketing_updated_at: string;
    marketing_opt_in_level?: string;
    admin_graphql_api_id: string;
    default_address: ShopifyAddress;
}
export interface ShopifyLineItem {
    id: string;
    variant_id: string;
    title: string;
    quantity: number;
    sku: string;
    variant_title?: string;
    vendor?: string;
    fulfillment_service: string;
    product_id: string;
    requires_shipping: boolean;
    taxable: boolean;
    gift_card: boolean;
    name: string;
    variant_inventory_management?: string;
    properties: any[];
    product_exists: boolean;
    fulfillable_quantity: number;
    grams: number;
    price: string;
    total_discount: string;
    fulfillment_status?: string;
    price_set: any;
    total_discount_set: any;
    discount_allocations: any[];
    duties: any[];
    admin_graphql_api_id: string;
    tax_lines: any[];
}
export interface ShopifyFulfillment {
    id: string;
    order_id: string;
    status: string;
    created_at: string;
    service: string;
    updated_at: string;
    tracking_company?: string;
    shipment_status?: string;
    location_id?: string;
    origin_address: any;
    receipt: any;
    name: string;
    admin_graphql_api_id: string;
    tracking_numbers: string[];
    tracking_urls: string[];
    line_items: ShopifyLineItem[];
}
export interface ShopifyRefund {
    id: string;
    order_id: string;
    created_at: string;
    note?: string;
    user_id?: string;
    processed_at: string;
    restock_type: string;
    admin_graphql_api_id: string;
    refund_line_items: any[];
    transactions: any[];
    order_adjustments: any[];
}
export declare class ShopifyAdapter {
    private client;
    constructor();
    getProducts(params?: {
        limit?: number;
        page_info?: string;
        created_at_min?: string;
        created_at_max?: string;
        updated_at_min?: string;
        updated_at_max?: string;
        published_status?: 'published' | 'unpublished' | 'any';
        published_at_min?: string;
        published_at_max?: string;
        fields?: string;
        product_type?: string;
        vendor?: string;
        collection_id?: string;
        ids?: string;
    }): Promise<APIResponse<{
        products: ShopifyProduct[];
    }>>;
    getProduct(id: string, fields?: string): Promise<APIResponse<{
        product: ShopifyProduct;
    }>>;
    createProduct(product: Partial<ShopifyProduct>): Promise<APIResponse<{
        product: ShopifyProduct;
    }>>;
    updateProduct(id: string, product: Partial<ShopifyProduct>): Promise<APIResponse<{
        product: ShopifyProduct;
    }>>;
    deleteProduct(id: string): Promise<APIResponse<void>>;
    getProductVariants(productId: string): Promise<APIResponse<{
        variants: ShopifyVariant[];
    }>>;
    getVariant(id: string): Promise<APIResponse<{
        variant: ShopifyVariant;
    }>>;
    createVariant(productId: string, variant: Partial<ShopifyVariant>): Promise<APIResponse<{
        variant: ShopifyVariant;
    }>>;
    updateVariant(id: string, variant: Partial<ShopifyVariant>): Promise<APIResponse<{
        variant: ShopifyVariant;
    }>>;
    deleteVariant(id: string): Promise<APIResponse<void>>;
    getOrders(params?: {
        limit?: number;
        page_info?: string;
        since_id?: string;
        created_at_min?: string;
        created_at_max?: string;
        updated_at_min?: string;
        updated_at_max?: string;
        processed_at_min?: string;
        processed_at_max?: string;
        status?: 'open' | 'closed' | 'cancelled' | 'any';
        financial_status?: 'authorized' | 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'voided' | 'partially_refunded' | 'any';
        fulfillment_status?: 'fulfilled' | 'null' | 'partial' | 'restocked' | 'any';
        fields?: string;
    }): Promise<APIResponse<{
        orders: ShopifyOrder[];
    }>>;
    getOrder(id: string, fields?: string): Promise<APIResponse<{
        order: ShopifyOrder;
    }>>;
    updateOrder(id: string, order: Partial<ShopifyOrder>): Promise<APIResponse<{
        order: ShopifyOrder;
    }>>;
    cancelOrder(id: string, reason?: string, email?: boolean): Promise<APIResponse<{
        order: ShopifyOrder;
    }>>;
    getFulfillments(orderId: string): Promise<APIResponse<{
        fulfillments: ShopifyFulfillment[];
    }>>;
    createFulfillment(orderId: string, fulfillment: {
        tracking_company?: string;
        tracking_numbers?: string[];
        tracking_urls?: string[];
        notify_customer?: boolean;
        line_items?: Array<{
            id: string;
            quantity: number;
        }>;
    }): Promise<APIResponse<{
        fulfillment: ShopifyFulfillment;
    }>>;
    updateFulfillment(orderId: string, fulfillmentId: string, fulfillment: Partial<ShopifyFulfillment>): Promise<APIResponse<{
        fulfillment: ShopifyFulfillment;
    }>>;
    cancelFulfillment(orderId: string, fulfillmentId: string): Promise<APIResponse<{
        fulfillment: ShopifyFulfillment;
    }>>;
    getCustomers(params?: {
        limit?: number;
        page_info?: string;
        since_id?: string;
        created_at_min?: string;
        created_at_max?: string;
        updated_at_min?: string;
        updated_at_max?: string;
        fields?: string;
    }): Promise<APIResponse<{
        customers: ShopifyCustomer[];
    }>>;
    getCustomer(id: string, fields?: string): Promise<APIResponse<{
        customer: ShopifyCustomer;
    }>>;
    createCustomer(customer: Partial<ShopifyCustomer>): Promise<APIResponse<{
        customer: ShopifyCustomer;
    }>>;
    updateCustomer(id: string, customer: Partial<ShopifyCustomer>): Promise<APIResponse<{
        customer: ShopifyCustomer;
    }>>;
    getInventoryLevels(params?: {
        inventory_item_ids?: string;
        location_ids?: string;
        limit?: number;
        page_info?: string;
    }): Promise<APIResponse<{
        inventory_levels: any[];
    }>>;
    adjustInventoryLevel(inventoryItemId: string, locationId: string, adjustment: number): Promise<APIResponse<{
        inventory_level: any;
    }>>;
    setInventoryLevel(inventoryItemId: string, locationId: string, available: number): Promise<APIResponse<{
        inventory_level: any;
    }>>;
    getWebhooks(): Promise<APIResponse<{
        webhooks: any[];
    }>>;
    createWebhook(webhook: {
        topic: string;
        address: string;
        format?: 'json' | 'xml';
    }): Promise<APIResponse<{
        webhook: any;
    }>>;
    deleteWebhook(id: string): Promise<APIResponse<void>>;
    getShop(): Promise<APIResponse<{
        shop: any;
    }>>;
}
export declare const shopifyAdapter: ShopifyAdapter;
//# sourceMappingURL=shopify-adapter.d.ts.map