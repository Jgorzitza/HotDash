/**
 * SEO Pipeline
 *
 * Processing pipeline for SEO data analysis
 */
export function createPipeline(config) {
    return {
        process: async (data) => data,
    };
}
/**
 * GA Sampling Error
 */
export class GaSamplingError extends Error {
    constructor(message) {
        super(message);
        this.name = "GaSamplingError";
    }
}
/**
 * Build SEO anomaly bundle
 */
export function buildSeoAnomalyBundle(data) {
    return {
        anomalies: [],
        summary: {},
    };
}
//# sourceMappingURL=pipeline.js.map