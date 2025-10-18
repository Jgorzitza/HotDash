import type { SEOAnomaly } from "./anomalies";

export function buildSeoDiagnostics(bundle: {
  anomalies: {
    all: SEOAnomaly[];
  };
}) {
  const totals = bundle.anomalies.all.reduce(
    (acc, a) => {
      acc[a.severity] = (acc[a.severity] || 0) as number;
      // @ts-ignore - narrow at runtime
      acc[a.severity] += 1;
      return acc;
    },
    { critical: 0, warning: 0, info: 0 } as Record<string, number>,
  );
  return { totals };
}

