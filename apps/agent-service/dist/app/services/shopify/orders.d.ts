import { type ServiceResult } from "../types";
import type { FulfillmentIssue, OrderSummaryResult, ShopifyServiceContext } from "./types";
export declare function getSalesPulseSummary(context: ShopifyServiceContext): Promise<OrderSummaryResult>;
export declare function getPendingFulfillments(context: ShopifyServiceContext): Promise<ServiceResult<FulfillmentIssue[]>>;
//# sourceMappingURL=orders.d.ts.map