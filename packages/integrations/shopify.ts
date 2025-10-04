// packages/integrations/shopify.ts
// Admin GraphQL snippets for fulfillment states and cost updates.
export const ORDER_FULFILLMENTS_QUERY = `#graphql
query($first:Int!, $after:String) {
  orders(first:$first, after:$after, sortKey:CREATED_AT, reverse:true) {
    pageInfo { hasNextPage endCursor }
    edges { node {
      id name displayFulfillmentStatus
      fulfillments(first: 5) { edges { node { id status trackingInfo { number url } events(first:10){ edges{ node { id status createdAt } } } } } }
    } }
  }
}`;

export const UPDATE_VARIANT_COST = `#graphql
mutation($id: ID!, $cost: MoneyInput!) {
  productVariantUpdate(input:{id:$id, inventoryItem:{cost:$cost}}) {
    productVariant { id title inventoryItem { unitCost { amount currencyCode } } }
    userErrors { field message }
  }
}`;
