import type { ServiceResult } from "../types";

export interface ShopifyGraphqlClient {
  graphql(
    query: string,
    options?: {
      variables?: Record<string, unknown>;
    },
  ): Promise<Response>;
}

export interface ShopifyServiceContext {
  admin: ShopifyGraphqlClient;
  shopDomain: string;
  operatorEmail?: string | null;
}

export interface SkuMetric {
  sku: string;
  title: string;
  quantity: number;
  revenue: number;
}

export interface FulfillmentIssue {
  orderId: string;
  name: string;
  displayStatus: string;
  createdAt: string;
}

export interface OrderSummary {
  shopDomain: string;
  totalRevenue: number;
  currency: string;
  orderCount: number;
  topSkus: SkuMetric[];
  pendingFulfillment: FulfillmentIssue[];
  generatedAt: string;
}

export interface InventoryAlert {
  sku: string;
  productId: string;
  variantId: string;
  title: string;
  quantityAvailable: number;
  threshold: number;
  daysOfCover?: number | null;
  generatedAt: string;
}

export type OrderSummaryResult = ServiceResult<OrderSummary>;
export type InventoryAlertResult = ServiceResult<InventoryAlert[]>;
