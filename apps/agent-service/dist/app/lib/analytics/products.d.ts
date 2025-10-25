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
export declare function getProductPerformance(): Promise<ProductPerformance[]>;
//# sourceMappingURL=products.d.ts.map