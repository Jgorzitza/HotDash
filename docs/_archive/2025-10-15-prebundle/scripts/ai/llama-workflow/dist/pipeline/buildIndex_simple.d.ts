export interface BuildOptions {
  sources: string;
  full: boolean;
}
export interface BuildResult {
  success: boolean;
  runDir: string;
  count: number;
  manifest: {
    timestamp: string;
    sources: string[];
    document_count: number;
    processing_time_ms: number;
  };
}
export declare function buildAll(
  logDir?: string,
  options?: Partial<BuildOptions>,
): Promise<BuildResult>;
export declare function getLatestIndexPath(): Promise<string | null>;
//# sourceMappingURL=buildIndex_simple.d.ts.map
