export interface ProductPerformance {
  productName: string;
  productId: string | number;
  views: number;
  addToCarts: number;
  purchases: number;
  revenue: number;
  addToCartRate: number;
  purchaseRate: number;
  avgPrice: number;
}

// Placeholder implementation; replace with real GA/Shopify join when ready
export async function getProductPerformance(): Promise<ProductPerformance[]> {
  return [];
}
