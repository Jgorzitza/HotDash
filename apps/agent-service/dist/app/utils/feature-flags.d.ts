interface FeatureFlags {
    revenueTile: boolean;
    aovTile: boolean;
    returnsTile: boolean;
    stockRiskTile: boolean;
    seoTile: boolean;
    cxTile: boolean;
    approvalsTile: boolean;
}
export declare function getFeatureFlags(): FeatureFlags;
export declare function setFeatureFlag(flag: keyof FeatureFlags, enabled: boolean): void;
export {};
//# sourceMappingURL=feature-flags.d.ts.map