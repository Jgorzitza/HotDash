import type { ShopifyServiceContext } from "./types";
export declare const __internal: {
    setWaitImplementation: (fn: (ms: number) => Promise<void>) => void;
    resetWaitImplementation: () => void;
    setRandomImplementation: (fn: () => number) => void;
    resetRandomImplementation: () => void;
};
export declare function getShopifyServiceContext(request: Request): Promise<ShopifyServiceContext>;
//# sourceMappingURL=client.d.ts.map