import type { AggregatedAdsMetrics } from "~/lib/ads/aggregations";

export type RiskLevel = "low" | "medium" | "high";

export type RollbackPlan = {
  flags: string[]; // e.g., ["ADS_METRICS_SLICE_B", "ADS_METRICS_SLICE_C"]
  instructions: string; // human-readable rollback steps
};

export type MetricsDelta = {
  roasDelta: number;
  cpcDelta: number;
  cpaDelta: number;
};

export type AdsApprovalEvidence = {
  kind: "ads-metrics-change";
  before: AggregatedAdsMetrics;
  after: AggregatedAdsMetrics;
  delta: MetricsDelta;
  risk: RiskLevel;
  risksNoted?: string[];
  rollback: RollbackPlan;
};

export function buildEvidence(
  before: AggregatedAdsMetrics,
  after: AggregatedAdsMetrics,
  options?: {
    risk?: RiskLevel;
    risksNoted?: string[];
    rollback?: Partial<RollbackPlan>;
  },
): AdsApprovalEvidence {
  const delta: MetricsDelta = {
    roasDelta: toFiniteOrZero(after.roas - before.roas),
    cpcDelta: toFiniteOrZero(after.cpc - before.cpc),
    cpaDelta: toFiniteOrZero(after.cpa - before.cpa),
  };

  const rollback: RollbackPlan = {
    flags: options?.rollback?.flags ?? ["ADS_METRICS_SLICE_B"],
    instructions:
      options?.rollback?.instructions ??
      "Disable ADS_METRICS_SLICE_B/C flags, revert imports to previous metric helpers, and redeploy.",
  };

  return {
    kind: "ads-metrics-change",
    before,
    after,
    delta,
    risk: options?.risk ?? inferRisk(delta),
    risksNoted: options?.risksNoted ?? [],
    rollback,
  };
}

export function validateEvidence(e: unknown): e is AdsApprovalEvidence {
  if (!e || typeof e !== "object") return false;
  const obj = e as AdsApprovalEvidence;
  return (
    obj.kind === "ads-metrics-change" &&
    !!obj.before &&
    !!obj.after &&
    isFiniteNumber(obj.delta?.roasDelta) &&
    isFiniteNumber(obj.delta?.cpcDelta) &&
    isFiniteNumber(obj.delta?.cpaDelta) &&
    ["low", "medium", "high"].includes(obj.risk) &&
    Array.isArray(obj.rollback?.flags) &&
    typeof obj.rollback?.instructions === "string"
  );
}

function inferRisk(d: MetricsDelta): RiskLevel {
  // Simple heuristic: large negative ROAS or large positive CPA is higher risk
  if (d.roasDelta < -0.5 || d.cpaDelta > 5) return "high";
  if (d.roasDelta < -0.2 || d.cpaDelta > 2) return "medium";
  return "low";
}

function toFiniteOrZero(n: unknown): number {
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}
