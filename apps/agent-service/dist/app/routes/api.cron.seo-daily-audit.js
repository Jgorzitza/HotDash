/**
 * Daily SEO Audit Cron Job
 *
 * POST /api/cron/seo-daily-audit
 *
 * Runs daily automated SEO audits for all configured shop domains.
 * This endpoint is called by a cron job scheduler (e.g., GitHub Actions,
 * external cron service, or pg_cron) to perform daily SEO health checks.
 *
 * Features:
 * - Audits all configured shop domains
 * - Stores results in database for historical tracking
 * - Generates anomaly reports for significant changes
 * - Sends notifications for critical issues
 *
 * @module routes/api/cron/seo-daily-audit
 */
import { runDailyAudit, getURLsToAudit } from "~/services/seo/automated-audit";
import { logDecision } from "~/services/decisions.server";
import { getCurrentShopDomain } from "~/config/shopify.server";
// Import Prisma client
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function action({ request }) {
    const startTime = Date.now();
    try {
        // Verify this is a legitimate cron request (basic security)
        const authHeader = request.headers.get("authorization");
        const expectedToken = process.env.CRON_SECRET_TOKEN;
        if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
            return Response.json({
                success: false,
                error: "Unauthorized - invalid cron token",
                timestamp: new Date().toISOString(),
            }, { status: 401 });
        }
        // Get all configured shop domains
        const shopDomains = await getConfiguredShopDomains();
        if (shopDomains.length === 0) {
            return Response.json({
                success: true,
                message: "No shop domains configured for SEO audit",
                timestamp: new Date().toISOString(),
            });
        }
        const results = [];
        // Run audit for each shop domain
        for (const shopDomain of shopDomains) {
            try {
                console.log(`[SEO Cron] Starting daily audit for ${shopDomain}`);
                // Create audit record in database
                const auditRecord = await prisma.seoAudit.create({
                    data: {
                        shopDomain,
                        auditType: "daily",
                        status: "running",
                        startedAt: new Date(),
                    },
                });
                // Get URLs to audit for this shop
                const urls = await getURLsToAudit(shopDomain);
                // Run the audit
                const auditResult = await runDailyAudit(urls);
                // Store audit results in database
                await storeAuditResults(auditRecord.id, auditResult);
                // Update audit record as completed
                await prisma.seoAudit.update({
                    where: { id: auditRecord.id },
                    data: {
                        status: "completed",
                        completedAt: new Date(),
                        totalPages: auditResult.summary.totalPages,
                        totalIssues: auditResult.summary.totalIssues,
                        criticalIssues: auditResult.summary.criticalIssues,
                        warningIssues: auditResult.summary.warningIssues,
                        infoIssues: auditResult.summary.infoIssues,
                        pagesWithIssues: auditResult.summary.pagesWithIssues,
                        durationMs: auditResult.summary.durationMs,
                    },
                });
                // Check for anomalies and generate report if needed
                await checkForAnomalies(shopDomain, auditResult);
                results.push({
                    shopDomain,
                    status: "completed",
                    pages: auditResult.summary.totalPages,
                    issues: auditResult.summary.totalIssues,
                    critical: auditResult.summary.criticalIssues,
                });
                console.log(`[SEO Cron] Completed audit for ${shopDomain}: ${auditResult.summary.totalIssues} issues found`);
            }
            catch (error) {
                console.error(`[SEO Cron] Failed audit for ${shopDomain}:`, error);
                // Update audit record as failed
                await prisma.seoAudit.update({
                    where: { id: auditRecord.id },
                    data: {
                        status: "failed",
                        completedAt: new Date(),
                        errorMessage: error.message,
                        durationMs: Date.now() - startTime,
                    },
                });
                results.push({
                    shopDomain,
                    status: "failed",
                    error: error.message,
                });
            }
        }
        const duration = Date.now() - startTime;
        // Log the cron job completion
        await logDecision({
            scope: "build",
            actor: "seo",
            action: "daily_audit_completed",
            rationale: `Daily SEO audit completed for ${shopDomains.length} shops in ${duration}ms`,
            evidenceUrl: `artifacts/seo/2025-10-22/daily-audit-${new Date().toISOString().split('T')[0]}.json`,
            payload: {
                shopDomains: shopDomains.length,
                results,
                duration,
                timestamp: new Date().toISOString(),
            },
        });
        return Response.json({
            success: true,
            message: `Daily SEO audit completed for ${shopDomains.length} shops`,
            results,
            duration,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("[SEO Cron] Daily audit failed:", error);
        await logDecision({
            scope: "build",
            actor: "seo",
            action: "daily_audit_failed",
            rationale: `Daily SEO audit failed: ${error.message}`,
            evidenceUrl: `artifacts/seo/2025-10-22/error-${new Date().toISOString().split('T')[0]}.json`,
            payload: {
                error: error.message,
                timestamp: new Date().toISOString(),
            },
        });
        return Response.json({
            success: false,
            error: error.message || "Daily SEO audit failed",
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
    finally {
        await prisma.$disconnect();
    }
}
/**
 * Get all configured shop domains for SEO auditing
 */
async function getConfiguredShopDomains() {
    // Use parameterized shop domain from environment configuration
    const shopDomain = getCurrentShopDomain();
    return [shopDomain];
}
/**
 * Store audit results in the database
 */
async function storeAuditResults(auditId, auditResult) {
    // Store each page result
    for (const page of auditResult.pages) {
        const pageRecord = await prisma.seoAuditPage.create({
            data: {
                auditId,
                url: page.url,
                title: page.title,
                titleLength: page.titleLength,
                metaDescription: page.metaDescription,
                metaLength: page.metaLength,
                h1Count: page.h1Count,
                h1Text: page.h1Text,
                imageCount: page.imageCount,
                imagesWithoutAlt: page.imagesWithoutAlt,
                issuesCount: page.issues.length,
                auditedAt: new Date(page.auditedAt),
            },
        });
        // Store each issue for this page
        for (const issue of page.issues) {
            await prisma.seoAuditIssue.create({
                data: {
                    pageId: pageRecord.id,
                    type: issue.type,
                    severity: issue.severity,
                    element: issue.element,
                    currentValue: issue.currentValue,
                    recommendedValue: issue.recommendedValue,
                    description: issue.description,
                },
            });
        }
    }
}
/**
 * Check for anomalies and generate reports if needed
 */
async function checkForAnomalies(shopDomain, auditResult) {
    // Get previous audit results for comparison
    const previousAudit = await prisma.seoAudit.findFirst({
        where: {
            shopDomain,
            status: "completed",
            auditType: "daily",
        },
        orderBy: { completedAt: "desc" },
        skip: 1, // Skip the current audit
    });
    if (!previousAudit) {
        console.log(`[SEO Cron] No previous audit found for ${shopDomain}, skipping anomaly check`);
        return;
    }
    // Check for significant changes
    const issuesIncrease = auditResult.summary.totalIssues - previousAudit.totalIssues;
    const criticalIncrease = auditResult.summary.criticalIssues - previousAudit.criticalIssues;
    // If issues increased significantly, log an anomaly
    if (issuesIncrease > 10 || criticalIncrease > 5) {
        await logDecision({
            scope: "build",
            actor: "seo",
            action: "seo_anomaly_detected",
            rationale: `SEO anomaly detected for ${shopDomain}: ${issuesIncrease} more issues, ${criticalIncrease} more critical issues`,
            evidenceUrl: `artifacts/seo/2025-10-22/anomaly-${shopDomain}-${new Date().toISOString().split('T')[0]}.json`,
            payload: {
                shopDomain,
                previousIssues: previousAudit.totalIssues,
                currentIssues: auditResult.summary.totalIssues,
                issuesIncrease,
                previousCritical: previousAudit.criticalIssues,
                currentCritical: auditResult.summary.criticalIssues,
                criticalIncrease,
                timestamp: new Date().toISOString(),
            },
        });
    }
}
//# sourceMappingURL=api.cron.seo-daily-audit.js.map