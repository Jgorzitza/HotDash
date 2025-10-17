export interface BuildResult {
  runDir: string;
  count: number;
  sources: {
    web: number;
    supabase_decisions: number;
    supabase_telemetry: number;
    curated: number;
  };
  duration: number;
  indexPath: string;
}
export interface BuildOptions {
  sources?: "all" | "web" | "supabase" | "curated";
  full?: boolean;
}
export declare function buildAll(
  logDirOverride?: string,
  options?: BuildOptions,
): Promise<BuildResult>;
export declare function getLatestIndexPath(): Promise<string | null>;
//# sourceMappingURL=buildIndex.d.ts.map
