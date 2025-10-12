import type { LandingPageAnomaly } from "../../services/ga/ingest";

interface SEOContentTileProps {
  anomalies: LandingPageAnomaly[];
}

export function SEOContentTile({ anomalies }: SEOContentTileProps) {
  return (
    <>
      {anomalies.length ? (
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
          {anomalies.map((anomaly) => (
            <li key={anomaly.landingPage}>
              {anomaly.landingPage} — {anomaly.sessions} sessions (
              {(anomaly.wowDelta * 100).toFixed(1)}% WoW)
              {anomaly.isAnomaly ? " • attention" : ""}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: "var(--occ-text-secondary)", margin: 0 }}>
          No traffic anomalies detected.
        </p>
      )}
    </>
  );
}
