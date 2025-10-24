/**
 * Multi-Project Analytics Aggregation Service
 *
 * Aggregates analytics across multiple projects/shops
 * CEO/agency view of all shops combined
 * Identifies top and bottom performers
 * Project comparison capabilities
 */
export interface ProjectMetrics {
    project: string;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    avgCTR: number;
    avgConversionRate: number;
    totalRevenue: number;
    totalSpend: number;
    overallROAS: number;
    rank?: number;
}
export interface MultiProjectSummary {
    totalProjects: number;
    aggregateMetrics: {
        totalImpressions: number;
        totalClicks: number;
        totalConversions: number;
        totalRevenue: number;
        totalSpend: number;
        avgCTR: number;
        avgConversionRate: number;
        overallROAS: number;
    };
    topPerformers: ProjectMetrics[];
    bottomPerformers: ProjectMetrics[];
    projectBreakdown: ProjectMetrics[];
}
export interface ProjectComparison {
    project1: string;
    project2: string;
    metrics: {
        project1: ProjectMetrics;
        project2: ProjectMetrics;
    };
    comparison: {
        impressionsDiff: number;
        clicksDiff: number;
        conversionsDiff: number;
        revenueDiff: number;
        roasDiff: number;
        winner: string;
    };
}
/**
 * Get metrics for a specific project
 */
export declare function getProjectMetrics(shopDomain: string, days?: number): Promise<ProjectMetrics>;
/**
 * Get aggregated metrics across all projects
 * CEO/agency view
 */
export declare function getMultiProjectSummary(days?: number): Promise<MultiProjectSummary>;
/**
 * Compare two projects side by side
 */
export declare function compareProjects(project1: string, project2: string, days?: number): Promise<ProjectComparison>;
/**
 * Get top performing projects by specific metric
 */
export declare function getTopProjectsByMetric(metric: "impressions" | "clicks" | "conversions" | "revenue" | "roas", limit?: number, days?: number): Promise<ProjectMetrics[]>;
/**
 * Get project performance rankings
 */
export declare function getProjectRankings(days?: number): Promise<Array<{
    rank: number;
    project: string;
    overallROAS: number;
    totalRevenue: number;
    grade: "A" | "B" | "C" | "D" | "F";
}>>;
//# sourceMappingURL=multi-project.d.ts.map