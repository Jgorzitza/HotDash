import { describe, it, expect } from "vitest";
import {
  detectTrafficAnomalies,
  scanForAnomalies,
} from "../../app/lib/seo/anomalies-detector";

describe("Anomalies Detector", () => {
  it("detects critical traffic drop", () => {
    const anomaly = detectTrafficAnomalies(550, 1000, "/test");
    expect(anomaly).not.toBeNull();
    expect(anomaly?.severity).toBe("critical");
    expect(anomaly?.type).toBe("traffic");
  });

  it("returns null when no anomaly", () => {
    const anomaly = detectTrafficAnomalies(1000, 950, "/test");
    expect(anomaly).toBeNull();
  });

  it("scans multiple URLs and sorts by severity", () => {
    const urlMetrics = [
      { url: "/page1", current: 800, previous: 900 },
      { url: "/page2", current: 400, previous: 1000 },
    ];
    const anomalies = scanForAnomalies(urlMetrics);
    expect(anomalies.length).toBe(1);
    expect(anomalies[0].severity).toBe("critical");
  });
});
