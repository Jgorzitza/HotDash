export type WebVitals = {
  LCP: number; // ms
  FID: number; // ms
  CLS: number; // unitless
};

export type VitalsAssessment = {
  metric: "LCP" | "FID" | "CLS";
  value: number;
  threshold: number;
  device: "mobile" | "desktop";
  passes: boolean;
};

const THRESHOLDS = {
  LCP: 2500,
  FID: 100,
  CLS: 0.1,
} as const;

export function normalizeVitals(
  vitals: Partial<WebVitals>,
  device: "mobile" | "desktop" = "mobile",
): VitalsAssessment[] {
  const out: VitalsAssessment[] = [];
  if (typeof vitals.LCP === "number") {
    out.push({
      metric: "LCP",
      value: vitals.LCP,
      threshold: THRESHOLDS.LCP,
      device,
      passes: vitals.LCP <= THRESHOLDS.LCP,
    });
  }
  if (typeof vitals.FID === "number") {
    out.push({
      metric: "FID",
      value: vitals.FID,
      threshold: THRESHOLDS.FID,
      device,
      passes: vitals.FID <= THRESHOLDS.FID,
    });
  }
  if (typeof vitals.CLS === "number") {
    out.push({
      metric: "CLS",
      value: vitals.CLS,
      threshold: THRESHOLDS.CLS,
      device,
      passes: vitals.CLS <= THRESHOLDS.CLS,
    });
  }
  return out;
}
