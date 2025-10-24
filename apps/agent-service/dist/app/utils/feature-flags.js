const defaultFlags = {
    revenueTile: true,
    aovTile: true,
    returnsTile: true,
    stockRiskTile: true,
    seoTile: true,
    cxTile: true,
    approvalsTile: true,
};
export function getFeatureFlags() {
    if (typeof window === "undefined")
        return defaultFlags;
    const stored = localStorage.getItem("feature-flags");
    if (!stored)
        return defaultFlags;
    try {
        return { ...defaultFlags, ...JSON.parse(stored) };
    }
    catch {
        return defaultFlags;
    }
}
export function setFeatureFlag(flag, enabled) {
    const flags = getFeatureFlags();
    flags[flag] = enabled;
    localStorage.setItem("feature-flags", JSON.stringify(flags));
}
//# sourceMappingURL=feature-flags.js.map