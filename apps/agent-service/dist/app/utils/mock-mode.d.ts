/**
 * Mock Mode Utilities
 *
 * Provides utilities for running the application in mock/dev mode
 * without real external service calls.
 */
export declare const isMockMode: () => boolean;
export declare const isProductionMode: () => boolean;
export declare const getMockData: <T>(mockData: T, realDataFn: () => Promise<T>) => Promise<T>;
//# sourceMappingURL=mock-mode.d.ts.map