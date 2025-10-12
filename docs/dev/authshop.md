---
title: Admin
description: |-
  Contains methods for authenticating and interacting with the Admin API.

  This function can handle requests for apps embedded in the Admin, Admin extensions, or non-embedded apps.
api_version: v1 latest
api_name: shopify-app-react-router
source_url:
  html: https://shopify.dev/docs/api/shopify-app-react-router/latest/authenticate/admin
  md: https://shopify.dev/docs/api/shopify-app-react-router/latest/authenticate/admin.md
---

# Adminobject

Contains methods for authenticating and interacting with the Admin API.

This function can handle requests for apps embedded in the Admin, Admin extensions, or non-embedded apps.

## authenticate.​admin([request](#authenticateadmin-propertydetail-request)​)

Authenticates requests coming from the Shopify admin.

Note

The shape of the returned object changes depending on the `distribution` config. Merchant custom apps (`AppDistribution.ShopifyAdmin`) are not embedded so do not return session tokens or redirect functionality. All other distributions are embedded and so they return a context with session tokens and redirect functionality.

### Parameters

* request

  Request

  required

### Returns

* Promise\<AdminContext\<Config>>

### AdminContext

```ts
EmbeddedTypedAdminContext<Config> & ScopesContext
```

### EmbeddedTypedAdminContext

```ts
Config['distribution'] extends AppDistribution.ShopifyAdmin
    ? NonEmbeddedAdminContext<Config>
    : EmbeddedAdminContext<Config>
```

### AppDistribution

* AppStore

  ```ts
  app_store
  ```

* SingleMerchant

  ```ts
  single_merchant
  ```

* ShopifyAdmin

  ```ts
  shopify_admin
  ```

```ts
export enum AppDistribution {
  AppStore = 'app_store',
  SingleMerchant = 'single_merchant',
  ShopifyAdmin = 'shopify_admin',
}
```

### NonEmbeddedAdminContext

* admin

  Methods for interacting with the GraphQL / REST Admin APIs for the store that made the request.

  ```ts
  AdminApiContext
  ```

* billing

  Billing methods for this store, based on the plans defined in the \`billing\` config option.

  ```ts
  BillingContext<Config>
  ```

* cors

  A function that ensures the CORS headers are set correctly for the response.

  ```ts
  EnsureCORSFunction
  ```

* session

  The session for the user who made the request. This comes from the session storage which \`shopifyApp\` uses to store sessions in your database of choice. Use this to get shop or user-specific data.

  ```ts
  Session
  ```

```ts
export interface NonEmbeddedAdminContext<Config extends AppConfigArg>
  extends AdminContextInternal<Config> {}
```

### AdminApiContext

* graphql

  Methods for interacting with the Shopify Admin GraphQL API

  ```ts
  GraphQLClient<AdminOperations>
  ```

````ts
export interface AdminApiContext {
  /**
   * Methods for interacting with the Shopify Admin GraphQL API
   *
   * {@link https://shopify.dev/docs/api/admin-graphql}
   * {@link https://github.com/Shopify/shopify-app-js/blob/main/packages/apps/shopify-api/docs/reference/clients/Graphql.md}
   *
   * @example
   * <caption>Querying the GraphQL API.</caption>
   * <description>Use `admin.graphql` to make query / mutation requests.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { ActionFunctionArgs } from "react-router";
   * import { authenticate } from "../shopify.server";
   *
   * export const action = async ({ request }: ActionFunctionArgs) => {
   *   const { admin } = await authenticate.admin(request);
   *
   *   const response = await admin.graphql(
   *     `#graphql
   *     mutation populateProduct($input: ProductInput!) {
   *       productCreate(input: $input) {
   *         product {
   *           id
   *         }
   *       }
   *     }`,
   *     {
   *       variables: {
   *         input: { title: "Product Name" },
   *       },
   *     },
   *   );
   *
   *   const productData = await response.json();
   *   return ({
   *     productId: productData.data?.productCreate?.product?.id,
   *   });
   * }
   * ```
   *
   * ```ts
   * // /app/shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-react-router/server";
   *
   * const shopify = shopifyApp({
   *   // ...
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   *
   * @example
   * <caption>Handling GraphQL errors.</caption>
   * <description>Catch `GraphqlQueryError` errors to see error messages from the API.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { ActionFunctionArgs } from "react-router";
   * import { authenticate } from "../shopify.server";
   *
   * export const action = async ({ request }: ActionFunctionArgs) => {
   *   const { admin } = await authenticate.admin(request);
   *
   *   try {
   *     const response = await admin.graphql(
   *       `#graphql
   *       query incorrectQuery {
   *         products(first: 10) {
   *           nodes {
   *             not_a_field
   *           }
   *         }
   *       }`,
   *     );
   *
   *     return ({ data: await response.json() });
   *   } catch (error) {
   *     if (error instanceof GraphqlQueryError) {
   *       // error.body.errors:
   *       // { graphQLErrors: [
   *       //   { message: "Field 'not_a_field' doesn't exist on type 'Product'" }
   *       // ] }
   *       return ({ errors: error.body?.errors }, { status: 500 });
   *     }
   *     return ({ message: "An error occurred" }, { status: 500 });
   *   }
   * }
   * ```
   *
   * ```ts
   * // /app/shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-react-router/server";
   *
   * const shopify = shopifyApp({
   *   // ...
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   */
  graphql: GraphQLClient<AdminOperations>;
}
````

### GraphQLClient

* query

  ```ts
  Operation extends keyof Operations
  ```

* options

  ```ts
  GraphQLQueryOptions<Operation, Operations>
  ```

interface Promise\<T> { /\*\* \* Attaches callbacks for the resolution and/or rejection of the Promise. \* @param onfulfilled The callback to execute when the Promise is resolved. \* @param onrejected The callback to execute when the Promise is rejected. \* @returns A Promise for the completion of which ever callback is executed. \*/ then\<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike\<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike\<TResult2>) | undefined | null): Promise\<TResult1 | TResult2>; /\*\* \* Attaches a callback for only the rejection of the Promise. \* @param onrejected The callback to execute when the Promise is rejected. \* @returns A Promise for the completion of the callback. \*/ catch\<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike\<TResult>) | undefined | null): Promise\<T | TResult>; }, interface Promise\<T> {}, Promise: PromiseConstructor, interface Promise\<T> { readonly \[Symbol.toStringTag]: string; }, interface Promise\<T> { /\*\* \* Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The \* resolved value cannot be modified from the callback. \* @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected). \* @returns A Promise for the completion of the callback. \*/ finally(onfinally?: (() => void) | undefined | null): Promise\<T>; }

```ts
interface Promise<T> {
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;

    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
}, interface Promise<T> {}, Promise: PromiseConstructor, interface Promise<T> {
    readonly [Symbol.toStringTag]: string;
}, interface Promise<T> {
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
}
```

```ts
<
  Operation extends keyof Operations,
>(
  query: Operation,
  options?: GraphQLQueryOptions<Operation, Operations>,
) => Promise<GraphQLResponse<Operation, Operations>>
```

### GraphQLQueryOptions

* apiVersion

  The version of the API to use for the request.

  ```ts
  ApiVersion
  ```

* headers

  Additional headers to include in the request.

  ```ts
  Record<string, any>
  ```

* signal

  An optional AbortSignal to cancel the request.

  ```ts
  AbortSignal
  ```

* tries

  The total number of times to try the request if it fails.

  ```ts
  number
  ```

* variables

  The variables to pass to the operation.

  ```ts
  ApiClientRequestOptions<Operation, Operations>["variables"]
  ```

```ts
export interface GraphQLQueryOptions<
  Operation extends keyof Operations,
  Operations extends AllOperations,
> {
  /**
   * The variables to pass to the operation.
   */
  variables?: ApiClientRequestOptions<Operation, Operations>['variables'];
  /**
   * The version of the API to use for the request.
   */
  apiVersion?: ApiVersion;
  /**
   * Additional headers to include in the request.
   */
  headers?: Record<string, any>;
  /**
   * The total number of times to try the request if it fails.
   */
  tries?: number;

  /**
   * An optional AbortSignal to cancel the request.
   */
  signal?: AbortSignal;
}
```

### BillingContext

* cancel

  Cancels an ongoing subscription, given its ID.

  ```ts
  (options: CancelBillingOptions) => Promise<AppSubscription>
  ```

* check

  Checks if the shop has an active payment for any plan defined in the \`billing\` config option.

  ```ts
  <Options extends CheckBillingOptions<Config>>(options?: Options) => Promise<BillingCheckResponseObject>
  ```

* createUsageRecord

  Creates a usage record for an app subscription.

  ```ts
  (options: CreateUsageRecordOptions) => Promise<UsageRecord>
  ```

* request

  Requests payment for the plan.

  ```ts
  (options: RequestBillingOptions<Config>) => Promise<never>
  ```

* require

  Checks if the shop has an active payment for any plan defined in the \`billing\` config option.

  ```ts
  (options: RequireBillingOptions<Config>) => Promise<BillingCheckResponseObject>
  ```

* updateUsageCappedAmount

  Updates the capped amount for a usage billing plan.

  ```ts
  (options: UpdateUsageCappedAmountOptions) => Promise<never>
  ```

````ts
export interface BillingContext<Config extends AppConfigArg> {
  /**
   * Checks if the shop has an active payment for any plan defined in the `billing` config option.
   *
   * @returns A promise that resolves to an object containing the active purchases for the shop.
   *
   * @example
   * <caption>Requesting billing right away.</caption>
   * <description>Call `billing.request` in the `onFailure` callback to immediately redirect to the Shopify page to request payment.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs } from "react-router";
   * import { authenticate, MONTHLY_PLAN } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { billing } = await authenticate.admin(request);
   *   await billing.require({
   *     plans: [MONTHLY_PLAN],
   *     isTest: true,
   *     onFailure: async () => billing.request({ plan: MONTHLY_PLAN }),
   *   });
   *
   *   // App logic
   * };
   * ```
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp, BillingInterval } from "@shopify/shopify-app-react-router/server";
   *
   * export const MONTHLY_PLAN = 'Monthly subscription';
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   billing: {
   *     [MONTHLY_PLAN]: {
   *       lineItems: [
   *         {
   *           amount: 5,
   *           currencyCode: 'USD',
   *           interval: BillingInterval.Every30Days,
   *         }
   *       ],
   *     },
   *   }
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   *
   * @example
   * <caption>Redirect to a plan selection page.</caption>
   * <description>When the app has multiple plans, create a page in your App that allows the merchant to select a plan. If a merchant does not have the required plan you can redirect them to page in your app to select one.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs, redirect } from "react-router";
   * import { authenticate, MONTHLY_PLAN, ANNUAL_PLAN } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { billing } = await authenticate.admin(request);
   *   const billingCheck = await billing.require({
   *     plans: [MONTHLY_PLAN, ANNUAL_PLAN],
   *     isTest: true,
   *     onFailure: () => redirect('/select-plan'),
   *   });
   *
   *   const subscription = billingCheck.appSubscriptions[0];
   *   console.log(`Shop is on ${subscription.name} (id ${subscription.id})`);
   *
   *   // App logic
   * };
   * ```
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp, BillingInterval } from "@shopify/shopify-app-react-router/server";
   *
   * export const MONTHLY_PLAN = 'Monthly subscription';
   * export const ANNUAL_PLAN = 'Annual subscription';
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   billing: {
   *     [MONTHLY_PLAN]: {
   *       lineItems: [
   *         {
   *           amount: 5,
   *           currencyCode: 'USD',
   *           interval: BillingInterval.Every30Days,
   *         }
   *       ],
   *     },
   *     [ANNUAL_PLAN]: {
   *       lineItems: [
   *         {
   *           amount: 50,
   *           currencyCode: 'USD',
   *           interval: BillingInterval.Annual,
   *         }
   *       ],
   *     },
   *   }
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   */
  require: (
    options: RequireBillingOptions<Config>,
  ) => Promise<BillingCheckResponseObject>;

  /**
   * Checks if the shop has an active payment for any plan defined in the `billing` config option.
   *
   * @returns A promise that resolves to an object containing the active purchases for the shop.
   *
   * @example
   * <caption>Check what billing plans a merchant is subscribed to.</caption>
   * <description>Use billing.check if you want to determine which plans are in use. Unlike `require`, `check` does not
   * throw an error if no active billing plans are present. </description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs } from "react-router";
   * import { authenticate, MONTHLY_PLAN } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { billing } = await authenticate.admin(request);
   *   const { hasActivePayment, appSubscriptions } = await billing.check({
   *     plans: [MONTHLY_PLAN],
   *     isTest: false,
   *   });
   *   console.log(hasActivePayment);
   *   console.log(appSubscriptions);
   * };
   * ```
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp, BillingInterval } from "@shopify/shopify-app-react-router/server";
   *
   * export const MONTHLY_PLAN = 'Monthly subscription';
   * export const ANNUAL_PLAN = 'Annual subscription';
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   billing: {
   *     [MONTHLY_PLAN]: {
   *       lineItems: [
   *         {
   *           amount: 5,
   *           currencyCode: 'USD',
   *           interval: BillingInterval.Every30Days,
   *         }
   *       ],
   *     },
   *     [ANNUAL_PLAN]: {
   *       lineItems: [
   *         {
   *           amount: 50,
   *           currencyCode: 'USD',
   *           interval: BillingInterval.Annual,
   *         }
   *       ],
   *     },
   *   }
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   *
   * @example
   * <caption>Check for payments without filtering.</caption>
   * <description>Use billing.check to see if any payments exist for the store, regardless of whether it's a test or
   * matches one or more plans.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs } from "react-router";
   * import { authenticate, MONTHLY_PLAN } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { billing } = await authenticate.admin(request);
   *   const { hasActivePayment, appSubscriptions } = await billing.check();
   *   // This will be true if any payment is found
   *   console.log(hasActivePayment);
   *   console.log(appSubscriptions);
   * };
   * ```
   */
  check: <Options extends CheckBillingOptions<Config>>(
    options?: Options,
  ) => Promise<BillingCheckResponseObject>;

  /**
   * Requests payment for the plan.
   *
   * @returns Redirects to the confirmation URL for the payment.
   *
   * @example
   * <caption>Using a custom return URL.</caption>
   * <description>Change where the merchant is returned to after approving the purchase using the `returnUrl` option.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs } from "react-router";
   * import { authenticate, MONTHLY_PLAN } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { billing } = await authenticate.admin(request);
   *   await billing.require({
   *     plans: [MONTHLY_PLAN],
   *     onFailure: async () => billing.request({
   *       plan: MONTHLY_PLAN,
   *       isTest: true,
   *       returnUrl: 'https://admin.shopify.com/store/my-store/apps/my-app/billing-page',
   *     }),
   *   });
   *
   *   // App logic
   * };
   * ```
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp, BillingInterval } from "@shopify/shopify-app-react-router/server";
   *
   * export const MONTHLY_PLAN = 'Monthly subscription';
   * export const ANNUAL_PLAN = 'Annual subscription';
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   billing: {
   *     [MONTHLY_PLAN]: {
   *       lineItems: [
   *         {
   *           amount: 5,
   *           currencyCode: 'USD',
   *           interval: BillingInterval.Every30Days,
   *         }
   *       ],
   *     },
   *     [ANNUAL_PLAN]: {
   *       lineItems: [
   *         {
   *           amount: 50,
   *           currencyCode: 'USD',
   *           interval: BillingInterval.Annual,
   *         }
   *       ],
   *     },
   *   }
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   *
   * @example
   * <caption>Overriding plan settings.</caption>
   * <description>Customize the plan for a merchant when requesting billing. Any fields from the plan can be overridden, as long as the billing interval for line items matches the config.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs } from "react-router";
   * import { authenticate, MONTHLY_PLAN } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { billing } = await authenticate.admin(request);
   *   await billing.require({
   *     plans: [MONTHLY_PLAN],
   *     onFailure: async () => billing.request({
   *       plan: MONTHLY_PLAN,
   *       isTest: true,
   *       trialDays: 14,
   *       lineItems: [
   *         {
   *           interval: BillingInterval.Every30Days,
   *           discount: { value: { percentage: 0.1 } },
   *         },
   *       ],
   *     }),
   *   });
   *
   *   // App logic
   * };
   * ```
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp, BillingInterval } from "@shopify/shopify-app-react-router/server";
   *
   * export const MONTHLY_PLAN = 'Monthly subscription';
   * export const ANNUAL_PLAN = 'Annual subscription';
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   billing: {
   *     [MONTHLY_PLAN]: {
   *       lineItems: [
   *         {
   *           amount: 5,
   *           currencyCode: 'USD',
   *           interval: BillingInterval.Every30Days,
   *         }
   *       ],
   *     },
   *     [ANNUAL_PLAN]: {
   *       lineItems: [
   *         {
   *           amount: 50,
   *           currencyCode: 'USD',
   *           interval: BillingInterval.Annual,
   *         }
   *       ],
   *     },
   *   }
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   */
  request: (options: RequestBillingOptions<Config>) => Promise<never>;

  /**
   * Cancels an ongoing subscription, given its ID.
   *
   * @returns The cancelled subscription.
   *
   * @example
   * <caption>Cancelling a subscription.</caption>
   * <description>Use the `billing.cancel` function to cancel an active subscription with the id returned from `billing.require`.</description>
   * ```ts
   * // /app/routes/cancel-subscription.ts
   * import { LoaderFunctionArgs } from "react-router";
   * import { authenticate, MONTHLY_PLAN } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { billing } = await authenticate.admin(request);
   *   const billingCheck = await billing.require({
   *     plans: [MONTHLY_PLAN],
   *     onFailure: async () => billing.request({ plan: MONTHLY_PLAN }),
   *   });
   *
   *   const subscription = billingCheck.appSubscriptions[0];
   *   const cancelledSubscription = await billing.cancel({
   *     subscriptionId: subscription.id,
   *     isTest: true,
   *     prorate: true,
   *    });
   *
   *   // App logic
   * };
   * ```
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp, BillingInterval } from "@shopify/shopify-app-react-router/server";
   *
   * export const MONTHLY_PLAN = 'Monthly subscription';
   * export const ANNUAL_PLAN = 'Annual subscription';
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   billing: {
   *     [MONTHLY_PLAN]: {
   *       lineItems: [
   *         {
   *           amount: 5,
   *           currencyCode: 'USD',
   *           interval: BillingInterval.Every30Days,
   *         }
   *       ],
   *     },
   *     [ANNUAL_PLAN]: {
   *       lineItems: [
   *         {
   *           amount: 50,
   *           currencyCode: 'USD',
   *           interval: BillingInterval.Annual,
   *         }
   *       ],
   *     },
   *   }
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   */
  cancel: (options: CancelBillingOptions) => Promise<AppSubscription>;

  /**
   * Creates a usage record for an app subscription.
   *
   * @returns Returns a usage record when one was created successfully.
   *
   * @example
   * <caption>Creating a usage record</caption>
   * <description>Create a usage record for the active usage billing plan</description>
   * ```ts
   * // /app/routes/create-usage-record.ts
   * import { ActionFunctionArgs } from "react-router";
   * import { authenticate, MONTHLY_PLAN } from "../shopify.server";
   *
   * export const action = async ({ request }: ActionFunctionArgs) => {
   *    const { billing } = await authenticate.admin(request);
   *
   *   const chargeBilling = await billing.createUsageRecord({
   *      description: "Usage record for product creation",
   *      price: {
   *        amount: 1,
   *        currencyCode: "USD",
   *       },
   *      isTest: true,
   *    });
   *  console.log(chargeBilling);
   *
   *   // App logic
   * };
   * ```
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp, BillingInterval } from "@shopify/shopify-app-react-router/server";
   *
   * export const USAGE_PLAN = 'Usage subscription';
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   billing: {
   *     [USAGE_PLAN]: {
   *       lineItems: [
   *         {
   *           amount: 5,
   *           currencyCode: 'USD',
   *           interval: BillingInterval.Usage,
   *         }
   *       ],
   *     },
   *   }
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   */
  createUsageRecord: (
    options: CreateUsageRecordOptions,
  ) => Promise<UsageRecord>;

  /**
   * Updates the capped amount for a usage billing plan.
   *
   * @returns Redirects to a confirmation page to update the usage billing plan.
   *
   * @example
   * <caption>Updating the capped amount for a usage billing plan.</caption>
   * <description>Update the capped amount for the usage billing plan specified by `subscriptionLineItemId`.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { ActionFunctionArgs } from "react-router";
   * import { authenticate } from "../shopify.server";
   *
   * export const action = async ({ request }: ActionFunctionArgs) => {
   *   const { billing } = await authenticate.admin(request);
   *
   *   await billing.updateUsageCappedAmount({
   *     subscriptionLineItemId: "gid://shopify/AppSubscriptionLineItem/12345?v=1&index=1",
   *     cappedAmount: {
   *       amount: 10,
   *       currencyCode: "USD"
   *     },
   *   });
   *
   *   // App logic
   * };
   * ```
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp, BillingInterval } from "@shopify/shopify-app-react-router/server";
   *
   * export const USAGE_PLAN = 'Usage subscription';
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   billing: {
   *     [USAGE_PLAN]: {
   *       lineItems: [
   *         {
   *           amount: 5,
   *           currencyCode: 'USD',
   *           interval: BillingInterval.Usage,
   *           terms: "Usage based"
   *         }
   *       ],
   *     },
   *   }
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   */
  updateUsageCappedAmount: (
    options: UpdateUsageCappedAmountOptions,
  ) => Promise<never>;
}
````

### CancelBillingOptions

* isTest

  Whether to use the test mode. This prevents the credit card from being charged.

  ```ts
  boolean
  ```

* prorate

  Whether to issue prorated credits for the unused portion of the app subscription. There will be a corresponding deduction (based on revenue share) to your Partner account. For example, if a $10.00 app subscription (with 0% revenue share) is cancelled and prorated half way through the billing cycle, then the merchant will be credited $5.00 and that amount will be deducted from your Partner account.

  ```ts
  boolean
  ```

* subscriptionId

  The ID of the subscription to cancel.

  ```ts
  string
  ```

```ts
export interface CancelBillingOptions {
  /**
   * The ID of the subscription to cancel.
   */
  subscriptionId: string;
  /**
   * Whether to issue prorated credits for the unused portion of the app subscription. There will be a corresponding
   * deduction (based on revenue share) to your Partner account. For example, if a $10.00 app subscription
   * (with 0% revenue share) is cancelled and prorated half way through the billing cycle, then the merchant will be
   * credited $5.00 and that amount will be deducted from your Partner account.
   */
  prorate?: boolean;
  /**
   * Whether to use the test mode. This prevents the credit card from being charged.
   */
  isTest?: boolean;
}
```

### CheckBillingOptions

* isTest

  Whether to include charges that were created on test mode. Test shops and demo shops cannot be charged.

  ```ts
  boolean
  ```

* plans

  The plans to check for. Must be one of the values defined in the \`billing\` config option.

  ```ts
  (keyof Config["billing"])[]
  ```

```ts
export interface CheckBillingOptions<Config extends AppConfigArg>
  extends Omit<BillingCheckParams, 'session' | 'plans' | 'returnObject'> {
  /**
   * The plans to check for. Must be one of the values defined in the `billing` config option.
   */
  plans?: (keyof Config['billing'])[];
}
```

### CreateUsageRecordOptions

* description

  The description of the app usage record.

  ```ts
  string
  ```

* idempotencyKey

  ```ts
  string
  ```

* isTest

  Whether to use the test mode. This prevents the credit card from being charged.

  ```ts
  boolean
  ```

* price

  The price of the app usage record.

  ```ts
  { amount: number; currencyCode: string; }
  ```

* subscriptionLineItemId

  ```ts
  string
  ```

```ts
export interface CreateUsageRecordOptions {
  /**
   * The description of the app usage record.
   */
  description: string;
  /**
   * The price of the app usage record.
   */
  price: {
    /**
     * The amount to charge for this usage record.
     */
    amount: number;
    /**
     * The currency code for this usage record.
     */
    currencyCode: string;
  };
  /**
   * Whether to use the test mode. This prevents the credit card from being charged.
   */
  isTest: boolean;
  /*
   * Defines the usage pricing plan the merchant is subscribed to.
   */
  subscriptionLineItemId?: string;
  /*
   * A unique key generated to avoid duplicate charges.
   */
  idempotencyKey?: string;
}
```

### RequestBillingOptions

* isTest

  Whether to use the test mode. This prevents the credit card from being charged. Test shops and demo shops cannot be charged.

  ```ts
  boolean
  ```

* plan

  The plan to request. Must be one of the values defined in the \`billing\` config option.

  ```ts
  keyof Config["billing"]
  ```

* returnUrl

  The URL to return to after the merchant approves the payment.

  ```ts
  string
  ```

```ts
export interface RequestBillingOptions<Config extends AppConfigArg>
  extends Omit<BillingRequestParams, 'session' | 'plan' | 'returnObject'> {
  /**
   * The plan to request. Must be one of the values defined in the `billing` config option.
   */
  plan: keyof Config['billing'];
  /**
   * Whether to use the test mode. This prevents the credit card from being charged. Test shops and demo shops cannot be charged.
   */
  isTest?: boolean;
  /**
   * The URL to return to after the merchant approves the payment.
   */
  returnUrl?: string;
}
```

### RequireBillingOptions

* isTest

  Whether to include charges that were created on test mode. Test shops and demo shops cannot be charged.

  ```ts
  boolean
  ```

* onFailure

  How to handle the request if the shop doesn't have an active payment for any plan.

  ```ts
  (error: any) => Promise<Response>
  ```

* plans

  The plans to check for. Must be one of the values defined in the \`billing\` config option.

  ```ts
  (keyof Config["billing"])[]
  ```

```ts
export interface RequireBillingOptions<Config extends AppConfigArg>
  extends Omit<BillingCheckParams, 'session' | 'plans' | 'returnObject'> {
  /**
   * The plans to check for. Must be one of the values defined in the `billing` config option.
   */
  plans: (keyof Config['billing'])[];
  /**
   * How to handle the request if the shop doesn't have an active payment for any plan.
   */
  onFailure: (error: any) => Promise<Response>;
}
```

### UpdateUsageCappedAmountOptions

* cappedAmount

  The maximum charge for the usage billing plan.

  ```ts
  { amount: number; currencyCode: string; }
  ```

* subscriptionLineItemId

  The subscription line item ID to update.

  ```ts
  string
  ```

```ts
export interface UpdateUsageCappedAmountOptions {
  /**
   * The subscription line item ID to update.
   */
  subscriptionLineItemId: string;
  /**
   * The maximum charge for the usage billing plan.
   */
  cappedAmount: {
    /**
     * The amount to update.
     */
    amount: number;
    /**
     * The currency code to update.
     */
    currencyCode: string;
  };
}
```

### EnsureCORSFunction



```ts
export interface EnsureCORSFunction {
  (response: Response): Response;
}
```

### EmbeddedAdminContext

* admin

  Methods for interacting with the GraphQL / REST Admin APIs for the store that made the request.

  ```ts
  AdminApiContext
  ```

* billing

  Billing methods for this store, based on the plans defined in the \`billing\` config option.

  ```ts
  BillingContext<Config>
  ```

* cors

  A function that ensures the CORS headers are set correctly for the response.

  ```ts
  EnsureCORSFunction
  ```

* redirect

  A function that redirects the user to a new page, ensuring that the appropriate parameters are set for embedded apps. Returned only for embedded apps (all apps except merchant custom apps).

  ```ts
  RedirectFunction
  ```

* session

  The session for the user who made the request. This comes from the session storage which \`shopifyApp\` uses to store sessions in your database of choice. Use this to get shop or user-specific data.

  ```ts
  Session
  ```

* sessionToken

  The decoded and validated session token for the request. Returned only for embedded apps (all distribution types except merchant custom apps)

  ```ts
  JwtPayload
  ```

````ts
export interface EmbeddedAdminContext<Config extends AppConfigArg>
  extends AdminContextInternal<Config> {
  /**
   * The decoded and validated session token for the request.
   *
   * Returned only for embedded apps (all distribution types except merchant custom apps)
   *
   * {@link https://shopify.dev/docs/apps/auth/oauth/session-tokens#payload}
   *
   * @example
   * <caption>Using the decoded session token.</caption>
   * <description>Get user-specific data using the `sessionToken` object.</description>
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderFunctionArgs, json } from "react-router";
   * import { authenticate } from "../shopify.server";
   * import { getMyAppData } from "~/db/model.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { sessionToken } = await authenticate.admin(
   *     request
   *   );
   *   return (await getMyAppData({user: sessionToken.sub}));
   * };
   * ```
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-react-router/server";
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   useOnlineTokens: true,
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   */
  sessionToken: JwtPayload;

  /**
   * A function that redirects the user to a new page, ensuring that the appropriate parameters are set for embedded
   * apps.
   *
   * Returned only for embedded apps (all apps except merchant custom apps).
   *
   * @example
   * <caption>Redirecting to an app route.</caption>
   * <description>Use the `redirect` helper to safely redirect between pages.</description>
   * ```ts
   * // /app/routes/admin/my-route.ts
   * import { LoaderFunctionArgs, json } from "react-router";
   * import { authenticate } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { session, redirect } = await authenticate.admin(request);
   *   return redirect("/");
   * };
   * ```
   *
   * @example
   * <caption>Redirecting to a page in the Shopify Admin.</caption>
   * <description>Redirects to a product page in the Shopify admin. Pass in a `target` option of `_top` or `_parent` to navigate in the current window, or `_blank` to open a new tab.</description>
   * ```ts
   * // /app/routes/admin/my-route.ts
   * import { LoaderFunctionArgs, json } from "react-router";
   * import { authenticate } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { session, redirect } = await authenticate.admin(request);
   *   return redirect("shopify://admin/products/123456", { target: '_parent' });
   * };
   * ```
   *
   * @example
   * <caption>Redirecting outside of the Admin embedded app page.</caption>
   * <description>Pass in a `target` option of `_top` or `_parent` to navigate in the current window, or `_blank` to open a new tab.</description>
   * ```ts
   * // /app/routes/admin/my-route.ts
   * import { LoaderFunctionArgs, json } from "react-router";
   * import { authenticate } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { session, redirect } = await authenticate.admin(request);
   *   return redirect("/", { target: '_parent' });
   * };
   * ```
   */
  redirect: RedirectFunction;
}
````

### RedirectFunction

* url

  ```ts
  string
  ```

* init

  ```ts
  RedirectInit
  ```

Response

```ts
Response
```

```ts
(url: string, init?: RedirectInit) => Response
```

### RedirectInit

```ts
number | (ResponseInit & {target?: RedirectTarget})
```

### RedirectTarget

```ts
'_self' | '_parent' | '_top' | '_blank'
```

### ScopesContext

* scopes

  Methods to manage scopes for the store that made the request.

  ```ts
  ScopesApiContext
  ```

```ts
export interface ScopesContext {
  /**
   * Methods to manage scopes for the store that made the request.
   */
  scopes: ScopesApiContext;
}
```

### ScopesApiContext

The Scopes API enables embedded apps and extensions to request merchant consent for access scopes.

* query

  Queries Shopify for the scopes for this app on this shop

  ```ts
  () => Promise<ScopesDetail>
  ```

* request

  Requests the merchant to grant the provided scopes for this app on this shop Warning: This method performs a server-side redirect.

  ```ts
  (scopes: string[]) => Promise<void>
  ```

* revoke

  Revokes the provided scopes from this app on this shop Warning: This method throws an \[error]\(https\://shopify.dev/docs/api/admin-graphql/unstable/objects/AppRevokeAccessScopesAppRevokeScopeError) if the provided optional scopes contains a required scope.

  ```ts
  (scopes: string[]) => Promise<ScopesRevokeResponse>
  ```

````ts
export interface ScopesApiContext {
  /**
   * Queries Shopify for the scopes for this app on this shop
   *
   * @returns {ScopesDetail} The scope details.
   *
   * @example
   * <caption>Query for granted scopes.</caption>
   * <description>Call `scopes.query` to get scope details.</description>
   * ```ts
   * // /app._index.tsx
   * import type { LoaderFunctionArgs } from "react-router";
   * import { useLoaderData } from "react-router";
   * import { authenticate } from "../shopify.server";
   * import { json } from "react-router";
   *
   * export const loader = async ({ request }: LoaderFunctionArgs) => {
   *   const { scopes } = await authenticate.admin(request);
   *
   *   const scopesDetail =  await scopes.query();
   *
   *   return ({
   *     hasWriteProducts: scopesDetail.granted.includes('write_products'),
   *   });
   * };
   *
   * export default function Index() {
   *   const {hasWriteProducts} = useLoaderData<typeof loader>();
   *
   *   ...
   * }
   * ```
   */
  query: () => Promise<ScopesDetail>;

  /**
   * Requests the merchant to grant the provided scopes for this app on this shop
   *
   * Warning: This method performs a server-side redirect.
   *
   * @example
   * <caption>Request consent from the merchant to grant the provided scopes for this app.</caption>
   * <description>Call `scopes.request` to request optional scopes.</description>
   * ```ts
   * // /app/routes/app.request.tsx
   * import type { ActionFunctionArgs } from "react-router";
   * import { useFetcher } from "react-router";
   * import { authenticate } from "../shopify.server";
   * import { json } from "react-router";
   *
   * // Example of an action to POST a request to for optional scopes
   * export const action = async ({ request }: ActionFunctionArgs) => {
   *   const { scopes } = await authenticate.admin(request);
   *
   *   const body = await request.formData();
   *   const scopesToRequest = body.getAll("scopes") as string[];
   *
   *   // If the scopes are not already granted, a full page redirect to the request URL occurs
   *   await scopes.request(scopesToRequest);
   *   // otherwise return an empty response
   *   return ({});
   * };
   *
   * export default function Index() {
   *   const fetcher = useFetcher<typeof action>();
   *
   *   const handleRequest = () => {
   *     fetcher.submit({scopes: ["write_products"]}, {
   *       method: "POST",
   *     });
   *   };
   *
   *   ...
   * }
   * ```
   */
  request: (scopes: Scope[]) => Promise<void>;

  /**
   * Revokes the provided scopes from this app on this shop
   *
   * Warning: This method throws an [error](https://shopify.dev/docs/api/admin-graphql/unstable/objects/AppRevokeAccessScopesAppRevokeScopeError) if the provided optional scopes contains a required scope.
   *
   * @example
   * <caption>Revoke optional scopes.</caption>
   * <description>Call `scopes.revoke` to revoke optional scopes.</description>
   * ```ts
   * // /app._index.tsx
   * import type { ActionFunctionArgs } from "react-router";
   * import { useFetcher } from "react-router";
   * import { authenticate } from "../shopify.server";
   * import { json } from "react-router";
   *
   * // Example of an action to POST optional scopes to revoke
   * export const action = async ({ request }: ActionFunctionArgs) => {
   *   const { scopes } = await authenticate.admin(request);
   *
   *   const body = await request.formData();
   *   const scopesToRevoke = body.getAll("scopes") as string[];
   *
   *   const revokedResponse = await scopes.revoke(scopesToRevoke);
   *
   *   return (revokedResponse);
   * };
   *
   * export default function Index() {
   *   const fetcher = useFetcher<typeof action>();
   *
   *   const handleRevoke = () => {
   *     fetcher.submit({scopes: ["write_products"]}, {
   *       method: "POST",
   *     });
   *   };
   *
   *   ...
   * }
   * ```
   */
  revoke: (scopes: Scope[]) => Promise<ScopesRevokeResponse>;
}
````

### ScopesDetail

* granted

  The scopes that have been granted on the shop for this app

  ```ts
  string[]
  ```

* optional

  The optional scopes that the app has declared in its configuration

  ```ts
  string[]
  ```

* required

  The required scopes that the app has declared in its configuration

  ```ts
  string[]
  ```

```ts
export interface ScopesDetail {
  /**
   * The scopes that have been granted on the shop for this app
   */
  granted: Scope[];
  /**
   * The required scopes that the app has declared in its configuration
   */
  required: Scope[];
  /**
   * The optional scopes that the app has declared in its configuration
   */
  optional: Scope[];
}
```

### ScopesRevokeResponse

* revoked

  The scopes that have been revoked on the shop for this app

  ```ts
  string[]
  ```

```ts
export interface ScopesRevokeResponse {
  /**
   * The scopes that have been revoked on the shop for this app
   */
  revoked: Scope[];
}
```

### Examples

* #### Authenticate, run API mutation, and redirect

  ##### Description

  Authenticate, run API mutation, and redirect

  ##### /app/routes/\*\*.ts

  ```typescript
  import {type ActionFunctionArgs, data} from 'react-router';
  import {GraphqlQueryError} from '@shopify/shopify-api';

  import {authenticate} from '../shopify.server';

  export const action = async ({request}: ActionFunctionArgs) => {
    const {admin, redirect} = await authenticate.admin(request);

    try {
      await admin.graphql(
        `#graphql
        mutation updateProductTitle($input: ProductInput!) {
          productUpdate(input: $input) {
            product {
              id
            }
          }
        }`,
        {
          variables: {
            input: {id: '123', title: 'New title'},
          },
        },
      );

      return redirect('/app/product-updated');
    } catch (error) {
      if (error instanceof GraphqlQueryError) {
        return data({errors: error.body?.errors}, {status: 500});
      }

      return new Response('Failed to update product title', {status: 500});
    }
  };
  ```

## Examples

### cors

Setting CORS headers for a admin request

Use the `cors` helper to ensure your app can respond to requests from admin extensions.

### Examples

* #### Setting CORS headers for a admin request

  ##### Description

  Use the \`cors\` helper to ensure your app can respond to requests from admin extensions.

  ##### /app/routes/admin/my-route.ts

  ```typescript
  import { LoaderFunctionArgs, json } from "react-router";
  import { authenticate } from "../shopify.server";
  import { getMyAppData } from "~/db/model.server";

  export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session, cors } = await authenticate.admin(request);
    return cors(await getMyAppData({user: session.onlineAccessInfo!.id})));
  };
  ```

### redirect

Redirecting to an app route

Use the `redirect` helper to safely redirect between pages.

Redirecting to a page in the Shopify Admin

Redirects to a product page in the Shopify admin. Pass in a `target` option of `_top` or `_parent` to navigate in the current window, or `_blank` to open a new tab.

Redirecting outside of the Admin embedded app page

Pass in a `target` option of `_top` or `_parent` to navigate in the current window, or `_blank` to open a new tab.

### Examples

* #### Redirecting to an app route

  ##### Description

  Use the \`redirect\` helper to safely redirect between pages.

  ##### /app/routes/admin/my-route.ts

  ```typescript
  import { LoaderFunctionArgs, json } from "react-router";
  import { authenticate } from "../shopify.server";

  export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session, redirect } = await authenticate.admin(request);
    return redirect("/");
  };
  ```

* #### Redirecting to a page in the Shopify Admin

  ##### Description

  Redirects to a product page in the Shopify admin. Pass in a \`target\` option of \`\_top\` or \`\_parent\` to navigate in the current window, or \`\_blank\` to open a new tab.

  ##### /app/routes/admin/my-route.ts

  ```typescript
  import { LoaderFunctionArgs, json } from "react-router";
  import { authenticate } from "../shopify.server";

  export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session, redirect } = await authenticate.admin(request);
    return redirect("shopify://admin/products/123456", { target: '_parent' });
  };
  ```

* #### Redirecting outside of the Admin embedded app page

  ##### Description

  Pass in a \`target\` option of \`\_top\` or \`\_parent\` to navigate in the current window, or \`\_blank\` to open a new tab.

  ##### /app/routes/admin/my-route.ts

  ```typescript
  import { LoaderFunctionArgs, json } from "react-router";
  import { authenticate } from "../shopify.server";

  export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session, redirect } = await authenticate.admin(request);
    return redirect("/", { target: '_parent' });
  };
  ```

### session

Using offline sessions

Get your app's shop-specific data using an offline session.

Using online sessions

Get your app's user-specific data using an online session.

### Examples

* #### Using offline sessions

  ##### Description

  Get your app's shop-specific data using an offline session.

  ##### /app/routes/\*\*\\/\*.ts

  ```typescript
  import { LoaderFunctionArgs, json } from "react-router";
  import { authenticate } from "../shopify.server";
  import { getMyAppData } from "~/db/model.server";

  export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session } = await authenticate.admin(request);
    return (await getMyAppData({shop: session.shop}));
  };
  ```

  ##### shopify.server.ts

  ```typescript
  import { shopifyApp } from "@shopify/shopify-app-react-router/server";

  const shopify = shopifyApp({
    // ...etc
  });
  export default shopify;
  export const authenticate = shopify.authenticate;
  ```

* #### Using online sessions

  ##### Description

  Get your app's user-specific data using an online session.

  ##### /app/routes/\*\*\\/\*.ts

  ```typescript
  import { LoaderFunctionArgs, json } from "react-router";
  import { authenticate } from "../shopify.server";
  import { getMyAppData } from "~/db/model.server";

  export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session } = await authenticate.admin(request);
    return (await getMyAppData({user: session.onlineAccessInfo!.id}));
  };
  ```

  ##### shopify.server.ts

  ```typescript
  import { shopifyApp } from "@shopify/shopify-app-react-router/server";

  const shopify = shopifyApp({
    // ...etc
    useOnlineTokens: true,
  });
  export default shopify;
  export const authenticate = shopify.authenticate;
  ```

### sessionToken

Using the decoded session token

Get user-specific data using the `sessionToken` object.

### Examples

* #### Using the decoded session token

  ##### Description

  Get user-specific data using the \`sessionToken\` object.

  ##### /app/routes/\*\*\\/\*.ts

  ```typescript
  import { LoaderFunctionArgs, json } from "react-router";
  import { authenticate } from "../shopify.server";
  import { getMyAppData } from "~/db/model.server";

  export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { sessionToken } = await authenticate.admin(
      request
    );
    return (await getMyAppData({user: sessionToken.sub}));
  };
  ```

  ##### shopify.server.ts

  ```typescript
  import { shopifyApp } from "@shopify/shopify-app-react-router/server";

  const shopify = shopifyApp({
    // ...etc
    useOnlineTokens: true,
  });
  export default shopify;
  export const authenticate = shopify.authenticate;
  ```

### graphql

Querying the GraphQL API

Use `admin.graphql` to make query / mutation requests.

Handling GraphQL errors

Catch `GraphqlQueryError` errors to see error messages from the API.

### Examples

* #### Querying the GraphQL API

  ##### Description

  Use \`admin.graphql\` to make query / mutation requests.

  ##### /app/routes/\*\*\\/\*.ts

  ```typescript
  import { ActionFunctionArgs } from "react-router";
  import { authenticate } from "../shopify.server";

  export const action = async ({ request }: ActionFunctionArgs) => {
    const { admin } = await authenticate.admin(request);

    const response = await admin.graphql(
      `#graphql
      mutation populateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
          }
        }
      }`,
      {
        variables: {
          input: { title: "Product Name" },
        },
      },
    );

    const productData = await response.json();
    return ({
      productId: productData.data?.productCreate?.product?.id,
    });
  }
  ```

  ##### /app/shopify.server.ts

  ```typescript
  import { shopifyApp } from "@shopify/shopify-app-react-router/server";

  const shopify = shopifyApp({
    // ...
  });
  export default shopify;
  export const authenticate = shopify.authenticate;
  ```

* #### Handling GraphQL errors

  ##### Description

  Catch \`GraphqlQueryError\` errors to see error messages from the API.

  ##### /app/routes/\*\*\\/\*.ts

  ```typescript
  import { ActionFunctionArgs } from "react-router";
  import { authenticate } from "../shopify.server";

  export const action = async ({ request }: ActionFunctionArgs) => {
    const { admin } = await authenticate.admin(request);

    try {
      const response = await admin.graphql(
        `#graphql
        query incorrectQuery {
          products(first: 10) {
            nodes {
              not_a_field
            }
          }
        }`,
      );

      return ({ data: await response.json() });
    } catch (error) {
      if (error instanceof GraphqlQueryError) {
        // error.body.errors:
        // { graphQLErrors: [
        //   { message: "Field 'not_a_field' doesn't exist on type 'Product'" }
        // ] }
        return ({ errors: error.body?.errors }, { status: 500 });
      }
      return ({ message: "An error occurred" }, { status: 500 });
    }
  }
  ```

  ##### /app/shopify.server.ts

  ```typescript
  import { shopifyApp } from "@shopify/shopify-app-react-router/server";

  const shopify = shopifyApp({
    // ...
  });
  export default shopify;
  export const authenticate = shopify.authenticate;
  ```

### cancel

Cancelling a subscription

Use the `billing.cancel` function to cancel an active subscription with the id returned from `billing.require`.

### Examples

* #### Cancelling a subscription

  ##### Description

  Use the \`billing.cancel\` function to cancel an active subscription with the id returned from \`billing.require\`.

  ##### /app/routes/cancel-subscription.ts

  ```typescript
  import { LoaderFunctionArgs } from "react-router";
  import { authenticate, MONTHLY_PLAN } from "../shopify.server";

  export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { billing } = await authenticate.admin(request);
    const billingCheck = await billing.require({
      plans: [MONTHLY_PLAN],
      onFailure: async () => billing.request({ plan: MONTHLY_PLAN }),
    });

    const subscription = billingCheck.appSubscriptions[0];
    const cancelledSubscription = await billing.cancel({
      subscriptionId: subscription.id,
      isTest: true,
      prorate: true,
     });

    // App logic
  };
  ```

  ##### shopify.server.ts

  ```typescript
  import { shopifyApp, BillingInterval } from "@shopify/shopify-app-react-router/server";

  export const MONTHLY_PLAN = 'Monthly subscription';
  export const ANNUAL_PLAN = 'Annual subscription';

  const shopify = shopifyApp({
    // ...etc
    billing: {
      [MONTHLY_PLAN]: {
        lineItems: [
          {
            amount: 5,
            currencyCode: 'USD',
            interval: BillingInterval.Every30Days,
          }
        ],
      },
      [ANNUAL_PLAN]: {
        lineItems: [
          {
            amount: 50,
            currencyCode: 'USD',
            interval: BillingInterval.Annual,
          }
        ],
      },
    }
  });
  export default shopify;
  export const authenticate = shopify.authenticate;
  ```

### check

Check what billing plans a merchant is subscribed to

Use billing.check if you want to determine which plans are in use. Unlike `require`, `check` does notthrow an error if no active billing plans are present.

Check for payments without filtering

Use billing.check to see if any payments exist for the store, regardless of whether it's a test ormatches one or more plans.

### Examples

* #### Check what billing plans a merchant is subscribed to

  ##### Description

  Use billing.check if you want to determine which plans are in use. Unlike \`require\`, \`check\` does notthrow an error if no active billing plans are present.

  ##### /app/routes/\*\*\\/\*.ts

  ```typescript
  import { LoaderFunctionArgs } from "react-router";
  import { authenticate, MONTHLY_PLAN } from "../shopify.server";

  export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { billing } = await authenticate.admin(request);
    const { hasActivePayment, appSubscriptions } = await billing.check({
      plans: [MONTHLY_PLAN],
      isTest: false,
    });
    console.log(hasActivePayment);
    console.log(appSubscriptions);
  };
  ```

  ##### shopify.server.ts

  ```typescript
  import { shopifyApp, BillingInterval } from "@shopify/shopify-app-react-router/server";

  export const MONTHLY_PLAN = 'Monthly subscription';
  export const ANNUAL_PLAN = 'Annual subscription';

  const shopify = shopifyApp({
    // ...etc
    billing: {
      [MONTHLY_PLAN]: {
        lineItems: [
          {
            amount: 5,
            currencyCode: 'USD',
            interval: BillingInterval.Every30Days,
          }
        ],
      },
      [ANNUAL_PLAN]: {
        lineItems: [
          {
            amount: 50,
            currencyCode: 'USD',
            interval: BillingInterval.Annual,
          }
        ],
      },
    }
  });
  export default shopify;
  export const authenticate = shopify.authenticate;
  ```

* #### Check for payments without filtering

  ##### Description

  Use billing.check to see if any payments exist for the store, regardless of whether it's a test ormatches one or more plans.

  ##### /app/routes/\*\*\\/\*.ts

  ```typescript
  import { LoaderFunctionArgs } from "react-router";
  import { authenticate, MONTHLY_PLAN } from "../shopify.server";

  export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { billing } = await authenticate.admin(request);
    const { hasActivePayment, appSubscriptions } = await billing.check();
    // This will be true if any payment is found
    console.log(hasActivePayment);
    console.log(appSubscriptions);
  };
  ```

### createUsageRecord

Creating a usage record

Create a usage record for the active usage billing plan

### Examples

* #### Creating a usage record

  ##### Description

  Create a usage record for the active usage billing plan

  ##### /app/routes/create-usage-record.ts

  ```typescript
  import { ActionFunctionArgs } from "react-router";
  import { authenticate, MONTHLY_PLAN } from "../shopify.server";

  export const action = async ({ request }: ActionFunctionArgs) => {
     const { billing } = await authenticate.admin(request);

    const chargeBilling = await billing.createUsageRecord({
       description: "Usage record for product creation",
       price: {
         amount: 1,
         currencyCode: "USD",
        },
       isTest: true,
     });
   console.log(chargeBilling);

    // App logic
  };
  ```

  ##### shopify.server.ts

  ```typescript
  import { shopifyApp, BillingInterval } from "@shopify/shopify-app-react-router/server";

  export const USAGE_PLAN = 'Usage subscription';

  const shopify = shopifyApp({
    // ...etc
    billing: {
      [USAGE_PLAN]: {
        lineItems: [
          {
            amount: 5,
            currencyCode: 'USD',
            interval: BillingInterval.Usage,
          }
        ],
      },
    }
  });
  export default shopify;
  export const authenticate = shopify.authenticate;
  ```

### request

Using a custom return URL

Change where the merchant is returned to after approving the purchase using the `returnUrl` option.

Overriding plan settings

Customize the plan for a merchant when requesting billing. Any fields from the plan can be overridden, as long as the billing interval for line items matches the config.

### Examples

* #### Using a custom return URL

  ##### Description

  Change where the merchant is returned to after approving the purchase using the \`returnUrl\` option.

  ##### /app/routes/\*\*\\/\*.ts

  ```typescript
  import { LoaderFunctionArgs } from "react-router";
  import { authenticate, MONTHLY_PLAN } from "../shopify.server";

  export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { billing } = await authenticate.admin(request);
    await billing.require({
      plans: [MONTHLY_PLAN],
      onFailure: async () => billing.request({
        plan: MONTHLY_PLAN,
        isTest: true,
        returnUrl: 'https://admin.shopify.com/store/my-store/apps/my-app/billing-page',
      }),
    });

    // App logic
  };
  ```

  ##### shopify.server.ts

  ```typescript
  import { shopifyApp, BillingInterval } from "@shopify/shopify-app-react-router/server";

  export const MONTHLY_PLAN = 'Monthly subscription';
  export const ANNUAL_PLAN = 'Annual subscription';

  const shopify = shopifyApp({
    // ...etc
    billing: {
      [MONTHLY_PLAN]: {
        lineItems: [
          {
            amount: 5,
            currencyCode: 'USD',
            interval: BillingInterval.Every30Days,
          }
        ],
      },
      [ANNUAL_PLAN]: {
        lineItems: [
          {
            amount: 50,
            currencyCode: 'USD',
            interval: BillingInterval.Annual,
          }
        ],
      },
    }
  });
  export default shopify;
  export const authenticate = shopify.authenticate;
  ```

* #### Overriding plan settings

  ##### Description

  Customize the plan for a merchant when requesting billing. Any fields from the plan can be overridden, as long as the billing interval for line items matches the config.

  ##### /app/routes/\*\*\\/\*.ts

  ```typescript
  import { LoaderFunctionArgs } from "react-router";
  import { authenticate, MONTHLY_PLAN } from "../shopify.server";

  export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { billing } = await authenticate.admin(request);
    await billing.require({
      plans: [MONTHLY_PLAN],
      onFailure: async () => billing.request({
        plan: MONTHLY_PLAN,
        isTest: true,
        trialDays: 14,
        lineItems: [
          {
            interval: BillingInterval.Every30Days,
            discount: { value: { percentage: 0.1 } },
          },
        ],
      }),
    });

    // App logic
  };
  ```

  ##### shopify.server.ts

  ```typescript
  import { shopifyApp, BillingInterval } from "@shopify/shopify-app-react-router/server";

  export const MONTHLY_PLAN = 'Monthly subscription';
  export const ANNUAL_PLAN = 'Annual subscription';

  const shopify = shopifyApp({
    // ...etc
    billing: {
      [MONTHLY_PLAN]: {
        lineItems: [
          {
            amount: 5,
            currencyCode: 'USD',
            interval: BillingInterval.Every30Days,
          }
        ],
      },
      [ANNUAL_PLAN]: {
        lineItems: [
          {
            amount: 50,
            currencyCode: 'USD',
            interval: BillingInterval.Annual,
          }
        ],
      },
    }
  });
  export default shopify;
  export const authenticate = shopify.authenticate;
  ```

### require

Requesting billing right away

Call `billing.request` in the `onFailure` callback to immediately redirect to the Shopify page to request payment.

Redirect to a plan selection page

When the app has multiple plans, create a page in your App that allows the merchant to select a plan. If a merchant does not have the required plan you can redirect them to page in your app to select one.

### Examples

* #### Requesting billing right away

  ##### Description

  Call \`billing.request\` in the \`onFailure\` callback to immediately redirect to the Shopify page to request payment.

  ##### /app/routes/\*\*\\/\*.ts

  ```typescript
  import { LoaderFunctionArgs } from "react-router";
  import { authenticate, MONTHLY_PLAN } from "../shopify.server";

  export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { billing } = await authenticate.admin(request);
    await billing.require({
      plans: [MONTHLY_PLAN],
      isTest: true,
      onFailure: async () => billing.request({ plan: MONTHLY_PLAN }),
    });

    // App logic
  };
  ```

  ##### shopify.server.ts

  ```typescript
  import { shopifyApp, BillingInterval } from "@shopify/shopify-app-react-router/server";

  export const MONTHLY_PLAN = 'Monthly subscription';

  const shopify = shopifyApp({
    // ...etc
    billing: {
      [MONTHLY_PLAN]: {
        lineItems: [
          {
            amount: 5,
            currencyCode: 'USD',
            interval: BillingInterval.Every30Days,
          }
        ],
      },
    }
  });
  export default shopify;
  export const authenticate = shopify.authenticate;
  ```

* #### Redirect to a plan selection page

  ##### Description

  When the app has multiple plans, create a page in your App that allows the merchant to select a plan. If a merchant does not have the required plan you can redirect them to page in your app to select one.

  ##### /app/routes/\*\*\\/\*.ts

  ```typescript
  import { LoaderFunctionArgs, redirect } from "react-router";
  import { authenticate, MONTHLY_PLAN, ANNUAL_PLAN } from "../shopify.server";

  export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { billing } = await authenticate.admin(request);
    const billingCheck = await billing.require({
      plans: [MONTHLY_PLAN, ANNUAL_PLAN],
      isTest: true,
      onFailure: () => redirect('/select-plan'),
    });

    const subscription = billingCheck.appSubscriptions[0];
    console.log(`Shop is on ${subscription.name} (id ${subscription.id})`);

    // App logic
  };
  ```

  ##### shopify.server.ts

  ```typescript
  import { shopifyApp, BillingInterval } from "@shopify/shopify-app-react-router/server";

  export const MONTHLY_PLAN = 'Monthly subscription';
  export const ANNUAL_PLAN = 'Annual subscription';

  const shopify = shopifyApp({
    // ...etc
    billing: {
      [MONTHLY_PLAN]: {
        lineItems: [
          {
            amount: 5,
            currencyCode: 'USD',
            interval: BillingInterval.Every30Days,
          }
        ],
      },
      [ANNUAL_PLAN]: {
        lineItems: [
          {
            amount: 50,
            currencyCode: 'USD',
            interval: BillingInterval.Annual,
          }
        ],
      },
    }
  });
  export default shopify;
  export const authenticate = shopify.authenticate;
  ```

### updateUsageCappedAmount

Updating the capped amount for a usage billing plan

Update the capped amount for the usage billing plan specified by `subscriptionLineItemId`.

### Examples

* #### Updating the capped amount for a usage billing plan

  ##### Description

  Update the capped amount for the usage billing plan specified by \`subscriptionLineItemId\`.

  ##### /app/routes/\*\*\\/\*.ts

  ```typescript
  import { ActionFunctionArgs } from "react-router";
  import { authenticate } from "../shopify.server";

  export const action = async ({ request }: ActionFunctionArgs) => {
    const { billing } = await authenticate.admin(request);

    await billing.updateUsageCappedAmount({
      subscriptionLineItemId: "gid://shopify/AppSubscriptionLineItem/12345?v=1&index=1",
      cappedAmount: {
        amount: 10,
        currencyCode: "USD"
      },
    });

    // App logic
  };
  ```

  ##### shopify.server.ts

  ```typescript
  import { shopifyApp, BillingInterval } from "@shopify/shopify-app-react-router/server";

  export const USAGE_PLAN = 'Usage subscription';

  const shopify = shopifyApp({
    // ...etc
    billing: {
      [USAGE_PLAN]: {
        lineItems: [
          {
            amount: 5,
            currencyCode: 'USD',
            interval: BillingInterval.Usage,
            terms: "Usage based"
          }
        ],
      },
    }
  });
  export default shopify;
  export const authenticate = shopify.authenticate;
  ```

### query

Query for granted scopes

Call `scopes.query` to get scope details.

### Examples

* #### Query for granted scopes

  ##### Description

  Call \`scopes.query\` to get scope details.

  ##### /app.\_index.tsx

  ```typescript
  import type { LoaderFunctionArgs } from "react-router";
  import { useLoaderData } from "react-router";
  import { authenticate } from "../shopify.server";
  import { json } from "react-router";

  export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { scopes } = await authenticate.admin(request);

    const scopesDetail =  await scopes.query();

    return ({
      hasWriteProducts: scopesDetail.granted.includes('write_products'),
    });
  };

  export default function Index() {
    const {hasWriteProducts} = useLoaderData<typeof loader>();

    ...
  }
  ```

### request

Request consent from the merchant to grant the provided scopes for this app

Call `scopes.request` to request optional scopes.

### Examples

* #### Request consent from the merchant to grant the provided scopes for this app

  ##### Description

  Call \`scopes.request\` to request optional scopes.

  ##### /app/routes/app.request.tsx

  ```typescript
  import type { ActionFunctionArgs } from "react-router";
  import { useFetcher } from "react-router";
  import { authenticate } from "../shopify.server";
  import { json } from "react-router";

  // Example of an action to POST a request to for optional scopes
  export const action = async ({ request }: ActionFunctionArgs) => {
    const { scopes } = await authenticate.admin(request);

    const body = await request.formData();
    const scopesToRequest = body.getAll("scopes") as string[];

    // If the scopes are not already granted, a full page redirect to the request URL occurs
    await scopes.request(scopesToRequest);
    // otherwise return an empty response
    return ({});
  };

  export default function Index() {
    const fetcher = useFetcher<typeof action>();

    const handleRequest = () => {
      fetcher.submit({scopes: ["write_products"]}, {
        method: "POST",
      });
    };

    ...
  }
  ```

### revoke

Revoke optional scopes

Call `scopes.revoke` to revoke optional scopes.

### Examples

* #### Revoke optional scopes

  ##### Description

  Call \`scopes.revoke\` to revoke optional scopes.

  ##### /app.\_index.tsx

  ```typescript
  import type { ActionFunctionArgs } from "react-router";
  import { useFetcher } from "react-router";
  import { authenticate } from "../shopify.server";
  import { json } from "react-router";

  // Example of an action to POST optional scopes to revoke
  export const action = async ({ request }: ActionFunctionArgs) => {
    const { scopes } = await authenticate.admin(request);

    const body = await request.formData();
    const scopesToRevoke = body.getAll("scopes") as string[];

    const revokedResponse = await scopes.revoke(scopesToRevoke);

    return (revokedResponse);
  };

  export default function Index() {
    const fetcher = useFetcher<typeof action>();

    const handleRevoke = () => {
      fetcher.submit({scopes: ["write_products"]}, {
        method: "POST",
      });
    };

    ...
  }
  ```

## Related

[![](https://shopify.dev/images/icons/32/pickaxe-1.png)![](https://shopify.dev/images/icons/32/pickaxe-1-dark.png)](https://shopify.dev/docs/api/shopify-app-react-router/apis/admin-api)

[Interact with the Admin API.API context](https://shopify.dev/docs/api/shopify-app-react-router/apis/admin-api)

[![](https://shopify.dev/images/icons/32/pickaxe-1.png)![](https://shopify.dev/images/icons/32/pickaxe-1-dark.png)](https://shopify.dev/docs/api/shopify-app-react-router/apis/billing)

[Bill merchants for your app using the Admin API.Billing context](https://shopify.dev/docs/api/shopify-app-react-router/apis/billing)

---

## Common Issue: Don't Ask for SHOPIFY_ADMIN_TOKEN

**Updated**: 2025-10-12

**Problem**: Agents sometimes request `SHOPIFY_ADMIN_TOKEN` environment variable.

**Why This Is Wrong**:
- React Router 7 + Shopify CLI v3 auto-generates session tokens
- `authenticate.admin(request)` handles everything automatically  
- No manual API tokens needed

**Correct Pattern**:
```typescript
// In loader or action:
export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  // admin.graphql() now works - no manual token needed!
}
```

**For External Services** (like Agent SDK):
- Option A: Call back to main app's API endpoints (recommended)
- Option B: Extract session from webhook context (request-scoped)
- Don't: Store long-term tokens or build custom OAuth

**If You're Asking for Shopify Credentials**: You're doing it wrong. Use `authenticate.admin(request)`.
