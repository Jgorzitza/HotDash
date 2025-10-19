import type { SEOAnomaly } from "./anomalies";

export function buildSeoDiagnostics(bundle: {
  anomalies: {
    all: SEOAnomaly[];
  };
}) {
  const totals = bundle.anomalies.all.reduce<
    Record<SEOAnomaly["severity"], number>
  >(
    (acc, anomaly) => {
      const severity = anomaly.severity;
      const current = acc[severity] ?? 0;
      acc[severity] = current + 1;
      return acc;
    },
    { critical: 0, warning: 0, info: 0 },
  );
  return { totals };
}
