/**
 * SEO Pipeline
 *
 * Processing pipeline for SEO data analysis
 */

export interface SEOPipelineConfig {
  threshold?: number;
  window?: string;
}

export function createPipeline(_config?: SEOPipelineConfig) {
  return {
    process: async (data: any) => data,
  };
}

/**
 * GA Sampling Error
 */
export class GaSamplingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GaSamplingError";
  }
}

/**
 * Build SEO anomaly bundle (placeholder compatible with RR7 routes)
 */
export function buildSeoAnomalyBundle(_data: any) {
  return {
    anomalies: [],
    summary: {},
  } as any;
}
