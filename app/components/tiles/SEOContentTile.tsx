import type { SEOTileData } from "../../services/seo/tile-data";

interface SEOContentTileProps {
  data: SEOTileData;
}

export function SEOContentTile({ data }: SEOContentTileProps) {
  const { anomalies, summary } = data;

  return (
    <>
      <div style={{ marginBottom: "var(--occ-space-2)" }}>
        <p style={{
          margin: 0,
          fontSize: "var(--occ-font-size-large)",
          fontWeight: "var(--occ-font-weight-semibold)",
          color: summary.status === 'critical' ? 'var(--occ-color-critical)' :
                 summary.status === 'attention' ? 'var(--occ-color-warning)' :
                 'var(--occ-text-primary)'
        }}>
          {summary.primaryMessage}
        </p>
        {summary.secondaryMessage && (
          <p style={{
            margin: "var(--occ-space-1) 0 0 0",
            color: "var(--occ-text-secondary)",
            fontSize: "var(--occ-font-size-small)"
          }}>
            {summary.secondaryMessage}
          </p>
        )}
      </div>

      {anomalies.topAnomalies.length > 0 ? (
        <ul
          style={{
            margin: 0,
            paddingLeft: "1.1rem",
            display: "flex",
            flexDirection: "column",
            gap: "var(--occ-space-1)",
            color: "var(--occ-text-primary)",
          }}
        >
          {anomalies.topAnomalies.map((anomaly) => (
            <li key={anomaly.id}>
              <strong>{anomaly.affectedUrl || 'Page'}</strong>
              {' — '}
              {anomaly.description}
              {anomaly.severity === 'critical' && (
                <span style={{ color: 'var(--occ-color-critical)', marginLeft: 'var(--occ-space-1)' }}>
                  • critical
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: "var(--occ-text-secondary)", margin: 0 }}>
          No SEO issues detected. All metrics stable.
        </p>
      )}
    </>
  );
}
