/**
 * Smoke Test Results Tile
 *
 * Displays recent smoke test results and health status.
 */
export interface SmokeTestResult {
    timestamp: string;
    environment: string;
    passed: number;
    failed: number;
    skipped: number;
    total: number;
    duration: number;
    status: "healthy" | "degraded" | "unhealthy";
}
export interface SmokeTestData {
    latest: SmokeTestResult;
    history: SmokeTestResult[];
    trends: {
        passRate: number;
        avgDuration: number;
        failureRate: number;
    };
}
interface SmokeTestResultsTileProps {
    data: SmokeTestData;
}
export declare function SmokeTestResultsTile({ data }: SmokeTestResultsTileProps): React.JSX.Element;
export {};
//# sourceMappingURL=SmokeTestResultsTile.d.ts.map