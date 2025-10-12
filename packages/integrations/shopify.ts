// packages/integrations/shopify.ts
// Admin GraphQL snippets for fulfillment states and cost updates.
export const ORDER_FULFILLMENTS_QUERY = `#graphql
query($first:Int!, $after:String) {
  orders(first:$first, after:$after, sortKey:CREATED_AT, reverse:true) {
    pageInfo { hasNextPage endCursor }
    edges { node {
      id name displayFulfillmentStatus
      fulfillments(first: 5) {
        id
        status
        trackingInfo { number url }
        events(first:10) {
          edges {
            node {
              id
              status
              happenedAt
            }
          }
        }
      }
    } }
  }
}`;

export const UPDATE_VARIANT_COST = `#graphql
mutation UpdateVariantCost($inventoryItemId: ID!, $cost: Decimal!) {
  inventoryItemUpdate(id: $inventoryItemId, input: { cost: $cost }) {
    inventoryItem {
      id
      unitCost {
        amount
        currencyCode
      }
    }
    userErrors {
      field
      message
    }
  }
}`;
