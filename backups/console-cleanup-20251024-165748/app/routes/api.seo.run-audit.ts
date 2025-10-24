/**
 * API Route: Run SEO Audit
 *
 * POST /api/seo/run-audit
 *
 * Triggers a daily automated SEO audit that checks:
 * - Title tags (presence, length, uniqueness)
 * - Meta descriptions (presence, length, uniqueness)
 * - Header tags (H1 presence and structure)
 * - Images (alt text presence)
 *
 * Returns comprehensive audit results with issues categorized by severity.
 *
 * @module routes/api/seo/run-audit
 */

import { type ActionFunctionArgs } from "react-router";
import { json } from "~/utils/http.server";
import { runDailyAudit, getURLsToAudit } from "../services/seo/automated-audit";
import { PrismaClient } from "@prisma/client";
import { logDecision } from "~/services/decisions.server";

const prisma = new PrismaClient();

export async function action({ request }: ActionFunctionArgs) {
  const startTime = Date.now();
  
  try {
    const url = new URL(request.url);
    const shopDomain =
      url.searchParams.get("shop") || "default-shop.myshopify.com";

    // Create audit record in database
    const auditRecord = await prisma.seoAudit.create({
      data: {
        shopDomain,
        auditType: "manual",
        status: "running",
        startedAt: new Date(),
      },
    });

    // Get URLs to audit
    const urls = await getURLsToAudit(shopDomain);

    // Run audit
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

    // Log the manual audit
    await logDecision({
      scope: "build",
      actor: "seo",
      action: "manual_audit_completed",
      rationale: `Manual SEO audit completed for ${shopDomain}: ${auditResult.summary.totalIssues} issues found`,
      evidenceUrl: `artifacts/seo/2025-10-22/manual-audit-${auditRecord.id}.json`,
      payload: {
        auditId: auditRecord.id,
        shopDomain,
        totalPages: auditResult.summary.totalPages,
        totalIssues: auditResult.summary.totalIssues,
        criticalIssues: auditResult.summary.criticalIssues,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
    });

    return Response.json({
      success: true,
      data: {
        ...auditResult,
        auditId: auditRecord.id,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[API] SEO audit error:", error);

    // Log the failed audit
    await logDecision({
      scope: "build",
      actor: "seo",
      action: "manual_audit_failed",
      rationale: `Manual SEO audit failed for ${shopDomain}: ${error.message}`,
      evidenceUrl: `artifacts/seo/2025-10-22/error-${Date.now()}.json`,
      payload: {
        shopDomain,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
    });

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to run SEO audit",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Store audit results in the database
 */
async function storeAuditResults(auditId: number, auditResult: any) {
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
 * GET endpoint to retrieve last audit results
 */
export async function loader({ request }: ActionFunctionArgs) {
  try {
    const url = new URL(request.url);
    const shopDomain =
      url.searchParams.get("shop") || "default-shop.myshopify.com";

    // Get URLs and run audit (will use cached results if available)
    const urls = await getURLsToAudit(shopDomain);
    const auditResult = await runDailyAudit(urls);

    return Response.json({
      success: true,
      data: auditResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[API] SEO audit error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to retrieve SEO audit results",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
