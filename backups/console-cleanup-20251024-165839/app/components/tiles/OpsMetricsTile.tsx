import type { OpsAggregateMetrics } from "../../services/metrics/aggregate";

interface OpsMetricsTileProps {
  metrics: OpsAggregateMetrics;
}

export function OpsMetricsTile({ metrics }: OpsMetricsTileProps) {
  const activation = metrics.activation;
  const sla = metrics.sla;
  const sectionStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "var(--occ-space-2)",
  };
  const metricValueStyle = {
    fontSize: "var(--occ-font-size-metric)",
    fontWeight: "var(--occ-font-weight-semibold)",
    margin: 0,
    color: "var(--occ-text-primary)",
  };
  const metaStyle = {
    color: "var(--occ-text-secondary)",
    margin: 0,
  };

  function formatPercent(value: number | undefined) {
    if (value === undefined || Number.isNaN(value)) return "–";
    return `${(value * 100).toFixed(1)}%`;
  }

  function formatMinutes(value: number | null | undefined) {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return "–";
    }
    return `${value.toFixed(1)} min`;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "var(--occ-space-4)",
      }}
    >
      <section style={sectionStyle}>
        <h3 style={{ margin: 0, color: "var(--occ-text-primary)" }}>
          Activation (7d)
        </h3>
        {activation ? (
          <>
            <p style={metricValueStyle}>
              {formatPercent(activation.activationRate)}
            </p>
            <p style={metaStyle}>
              {activation.activatedShops} / {activation.totalActiveShops} shops
              activated
            </p>
            <p style={metaStyle}>
              Window {new Date(activation.windowStart).toLocaleDateString()} —{" "}
              {""}
              {new Date(activation.windowEnd).toLocaleDateString()}
            </p>
          </>
        ) : (
          <p style={metaStyle}>No activation data yet.</p>
        )}
      </section>

      <section style={sectionStyle}>
        <h3 style={{ margin: 0, color: "var(--occ-text-primary)" }}>
          SLA Resolution (7d)
        </h3>
        {sla && sla.sampleSize > 0 ? (
          <>
            <p style={metricValueStyle}>{formatMinutes(sla.medianMinutes)}</p>
            <p style={metaStyle}>Median to first operator action</p>
            <p style={metaStyle}>P90: {formatMinutes(sla.p90Minutes)}</p>
            <p style={metaStyle}>Sample size: {sla.sampleSize}</p>
          </>
        ) : (
          <p style={metaStyle}>No resolved breaches in window.</p>
        )}
      </section>
    </div>
  );
}
