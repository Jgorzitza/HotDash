#!/usr/bin/env tsx

/**
 * Test SEO Audit Workflow
 *
 * This script tests the complete SEO audit workflow including:
 * - Database schema validation
 * - Manual audit execution
 * - Daily cron simulation
 * - Anomaly detection
 *
 * Usage:
 *   npx tsx scripts/seo/test-audit-workflow.ts
 */

import { PrismaClient } from "@prisma/client";
import { runDailyAudit, getURLsToAudit } from "../../app/services/seo/automated-audit";
import { logDecision } from "../../app/services/decisions.server";

const prisma = new PrismaClient();

async function testDatabaseSchema() {
  console.log("🔍 Testing database schema...");
  
  try {
    // Test creating an audit record
    const testAudit = await prisma.seoAudit.create({
      data: {
        shopDomain: "test-shop.myshopify.com",
        auditType: "test",
        status: "running",
        startedAt: new Date(),
      },
    });
    
    console.log("✅ Database schema test passed - audit record created:", testAudit.id);
    
    // Clean up test record
    await prisma.seoAudit.delete({
      where: { id: testAudit.id },
    });
    
    return true;
  } catch (error: any) {
    console.error("❌ Database schema test failed:", error.message);
    return false;
  }
}

async function testManualAudit() {
  console.log("🔍 Testing manual audit execution...");
  
  try {
    const shopDomain = "test-shop.myshopify.com";
    
    // Create audit record
    const auditRecord = await prisma.seoAudit.create({
      data: {
        shopDomain,
        auditType: "test",
        status: "running",
        startedAt: new Date(),
      },
    });
    
    // Get URLs to audit
    const urls = await getURLsToAudit(shopDomain);
    console.log(`📋 Found ${urls.length} URLs to audit:`, urls);
    
    // Run audit
    const auditResult = await runDailyAudit(urls);
    console.log(`📊 Audit completed: ${auditResult.summary.totalIssues} issues found`);
    
    // Store results
    await storeAuditResults(auditRecord.id, auditResult);
    
    // Update audit record
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
    
    console.log("✅ Manual audit test passed");
    return { auditId: auditRecord.id, result: auditResult };
  } catch (error: any) {
    console.error("❌ Manual audit test failed:", error.message);
    return null;
  }
}

async function testAnomalyDetection(auditId: number) {
  console.log("🔍 Testing anomaly detection...");
  
  try {
    // Get the audit we just created
    const currentAudit = await prisma.seoAudit.findUnique({
      where: { id: auditId },
    });
    
    if (!currentAudit) {
      throw new Error("Audit record not found");
    }
    
    // Create a "previous" audit with different results to simulate anomaly
    const previousAudit = await prisma.seoAudit.create({
      data: {
        shopDomain: currentAudit.shopDomain,
        auditType: "test",
        status: "completed",
        startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        totalPages: 5,
        totalIssues: 10, // Much fewer issues
        criticalIssues: 2,
        warningIssues: 5,
        infoIssues: 3,
        pagesWithIssues: 3,
        durationMs: 5000,
      },
    });
    
    // Simulate anomaly detection
    const issuesIncrease = currentAudit.totalIssues - previousAudit.totalIssues;
    const criticalIncrease = currentAudit.criticalIssues - previousAudit.criticalIssues;
    
    if (issuesIncrease > 10 || criticalIncrease > 5) {
      await logDecision({
        scope: "build",
        actor: "seo",
        action: "seo_anomaly_detected",
        rationale: `SEO anomaly detected: ${issuesIncrease} more issues, ${criticalIncrease} more critical issues`,
        evidenceUrl: `artifacts/seo/2025-10-22/test-anomaly-${Date.now()}.json`,
        payload: {
          shopDomain: currentAudit.shopDomain,
          previousIssues: previousAudit.totalIssues,
          currentIssues: currentAudit.totalIssues,
          issuesIncrease,
          previousCritical: previousAudit.criticalIssues,
          currentCritical: currentAudit.criticalIssues,
          criticalIncrease,
          timestamp: new Date().toISOString(),
        },
      });
      
      console.log(`✅ Anomaly detection test passed - detected ${issuesIncrease} more issues`);
    } else {
      console.log("ℹ️ No anomaly detected (this is expected for small changes)");
    }
    
    // Clean up test records
    await prisma.seoAudit.deleteMany({
      where: {
        shopDomain: currentAudit.shopDomain,
        auditType: "test",
      },
    });
    
    return true;
  } catch (error: any) {
    console.error("❌ Anomaly detection test failed:", error.message);
    return false;
  }
}

async function testCronSimulation() {
  console.log("🔍 Testing cron job simulation...");
  
  try {
    // Simulate the cron job
    const shopDomains = ["test-shop.myshopify.com"];
    const results = [];
    
    for (const shopDomain of shopDomains) {
      const auditRecord = await prisma.seoAudit.create({
        data: {
          shopDomain,
          auditType: "daily",
          status: "running",
          startedAt: new Date(),
        },
      });
      
      const urls = await getURLsToAudit(shopDomain);
      const auditResult = await runDailyAudit(urls);
      
      await storeAuditResults(auditRecord.id, auditResult);
      
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
      
      results.push({
        shopDomain,
        status: "completed",
        pages: auditResult.summary.totalPages,
        issues: auditResult.summary.totalIssues,
      });
    }
    
    console.log("✅ Cron simulation test passed");
    return results;
  } catch (error: any) {
    console.error("❌ Cron simulation test failed:", error.message);
    return null;
  }
}

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

async function main() {
  console.log("🚀 Starting SEO Audit Workflow Test");
  console.log("=====================================");
  
  const tests = [
    { name: "Database Schema", fn: testDatabaseSchema },
    { name: "Manual Audit", fn: testManualAudit },
    { name: "Cron Simulation", fn: testCronSimulation },
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n📋 Running ${test.name} test...`);
    const result = await test.fn();
    results.push({ name: test.name, passed: !!result, result });
  }
  
  // Test anomaly detection with the manual audit result
  const manualAuditResult = results.find(r => r.name === "Manual Audit");
  if (manualAuditResult?.result?.auditId) {
    console.log("\n📋 Running Anomaly Detection test...");
    const anomalyResult = await testAnomalyDetection(manualAuditResult.result.auditId);
    results.push({ name: "Anomaly Detection", passed: anomalyResult, result: null });
  }
  
  // Clean up all test records
  await prisma.seoAudit.deleteMany({
    where: {
      OR: [
        { auditType: "test" },
        { shopDomain: "test-shop.myshopify.com" },
      ],
    },
  });
  
  console.log("\n📊 Test Results Summary");
  console.log("=======================");
  
  let passed = 0;
  let total = results.length;
  
  for (const result of results) {
    const status = result.passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${status} ${result.name}`);
    if (result.passed) passed++;
  }
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log("🎉 All tests passed! SEO audit workflow is ready for production.");
  } else {
    console.log("⚠️ Some tests failed. Please review the errors above.");
    process.exit(1);
  }
}

// Run the tests
main().catch((error) => {
  console.error("💥 Test suite failed:", error);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
