/**
 * Smoke Test Results API
 *
 * GET /api/smoke-tests/results
 *
 * Returns recent smoke test results for dashboard display.
 */
import { readdir, readFile } from "fs/promises";
import { join } from "path";
export async function loader({ request }) {
    try {
        const artifactsDir = join(process.cwd(), "artifacts", "smoke-tests");
        // Read all smoke test result files
        let files = [];
        try {
            files = await readdir(artifactsDir);
        }
        catch (error) {
            // Directory doesn't exist yet - return mock data
            return Response.json({
                status: "ok",
                data: getMockData(),
                source: "mock",
            });
        }
        // Filter and sort by timestamp (newest first)
        const resultFiles = files
            .filter(f => f.startsWith("smoke-test-") && f.endsWith(".json"))
            .sort()
            .reverse()
            .slice(0, 10); // Last 10 runs
        if (resultFiles.length === 0) {
            return Response.json({
                status: "ok",
                data: getMockData(),
                source: "mock",
            });
        }
        // Read result files
        const results = [];
        for (const file of resultFiles) {
            try {
                const content = await readFile(join(artifactsDir, file), "utf-8");
                const result = JSON.parse(content);
                // Determine status
                const passRate = result.total > 0 ? result.passed / result.total : 0;
                const status = passRate >= 0.95 ? "healthy" :
                    passRate >= 0.80 ? "degraded" :
                        "unhealthy";
                results.push({
                    timestamp: result.timestamp,
                    environment: result.environment,
                    passed: result.passed,
                    failed: result.failed,
                    skipped: result.skipped,
                    total: result.total,
                    duration: result.duration,
                    status,
                });
            }
            catch (error) {
                console.error(`Failed to parse ${file}:`, error);
            }
        }
        if (results.length === 0) {
            return Response.json({
                status: "ok",
                data: getMockData(),
                source: "mock",
            });
        }
        // Calculate trends
        const passRates = results.map(r => r.total > 0 ? r.passed / r.total : 0);
        const avgPassRate = passRates.reduce((a, b) => a + b, 0) / passRates.length;
        const durations = results.map(r => r.duration);
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
        const failureRate = 1 - avgPassRate;
        const data = {
            latest: results[0],
            history: results,
            trends: {
                passRate: avgPassRate * 100,
                avgDuration,
                failureRate,
            },
        };
        return Response.json({
            status: "ok",
            data,
            source: "fresh",
            fact: {
                id: Date.now(),
                createdAt: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        console.error("[Smoke Tests API] Error:", error);
        return Response.json({
            status: "error",
            error: error.message || "Failed to fetch smoke test results",
            data: getMockData(),
            source: "mock",
        }, { status: 500 });
    }
}
function getMockData() {
    return {
        latest: {
            timestamp: new Date().toISOString(),
            environment: "production",
            passed: 28,
            failed: 0,
            skipped: 2,
            total: 30,
            duration: 15000,
            status: "healthy",
        },
        history: [
            {
                timestamp: new Date().toISOString(),
                environment: "production",
                passed: 28,
                failed: 0,
                skipped: 2,
                total: 30,
                duration: 15000,
                status: "healthy",
            },
        ],
        trends: {
            passRate: 93.3,
            avgDuration: 15000,
            failureRate: 0.067,
        },
    };
}
//# sourceMappingURL=api.smoke-tests.results.js.map