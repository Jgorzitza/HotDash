/**
 * SEO Pipeline
 *
 * Processing pipeline for SEO data analysis
 */
export interface SEOPipelineConfig {
    threshold?: number;
    window?: string;
}
export declare function createPipeline(config?: SEOPipelineConfig): {
    process: (data: any) => Promise<any>;
};
/**
 * GA Sampling Error
 */
export declare class GaSamplingError extends Error {
    constructor(message: string);
}
/**
 * Build SEO anomaly bundle
 */
export declare function buildSeoAnomalyBundle(data: any): {
    anomalies: any[];
    summary: {};
};
//# sourceMappingURL=pipeline.d.ts.map