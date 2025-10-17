interface FeatureFlags {
  revenueTile: boolean;
  aovTile: boolean;
  returnsTile: boolean;
  stockRiskTile: boolean;
  seoTile: boolean;
  cxTile: boolean;
  approvalsTile: boolean;
}

const defaultFlags: FeatureFlags = {
  revenueTile: true,
  aovTile: true,
  returnsTile: true,
  stockRiskTile: true,
  seoTile: true,
  cxTile: true,
  approvalsTile: true,
};

export function getFeatureFlags(): FeatureFlags {
  if (typeof window === "undefined") return defaultFlags;

  const stored = localStorage.getItem("feature-flags");
  if (!stored) return defaultFlags;

  try {
    return { ...defaultFlags, ...JSON.parse(stored) };
  } catch {
    return defaultFlags;
  }
}

export function setFeatureFlag(flag: keyof FeatureFlags, enabled: boolean) {
  const flags = getFeatureFlags();
  flags[flag] = enabled;
  localStorage.setItem("feature-flags", JSON.stringify(flags));
}
