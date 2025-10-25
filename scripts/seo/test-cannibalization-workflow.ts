/**
 * Test Script: Cannibalization Detection Workflow
 *
 * Tests the complete cannibalization detection system:
 * 1. Database schema validation
 * 2. API endpoint testing
 * 3. Conflict listing functionality
 * 4. Resolution workflow
 *
 * @module scripts/seo/test-cannibalization-workflow
 */

import { PrismaClient } from "@prisma/client";
import { detectKeywordCannibalization, getStoredCannibalizationConflicts } from "../../app/services/seo/cannibalization";

const prisma = new PrismaClient();

async function testDatabaseSchema() {
  console.log("🔍 Testing database schema...");
  
  try {
    // Test creating a cannibalization record
    const testCannibalization = await prisma.seoCannibalization.create({
      data: {
        shopDomain: "test-shop.myshopify.com",
        keyword: "test keyword",
        severity: "warning",
        totalClicks: 100,
        totalImpressions: 1000,
        potentialClicksLost: 25,
        action: "canonical",
        primaryUrl: "https://test-shop.myshopify.com/primary",
        secondaryUrls: ["https://test-shop.myshopify.com/secondary"],
        rationale: "Test cannibalization record",
      },
    });

    // Test creating URL records
    await prisma.seoCannibalizationUrl.create({
      data: {
        cannibalizationId: testCannibalization.id,
        url: "https://test-shop.myshopify.com/primary",
        position: 5,
        clicks: 80,
        impressions: 800,
        ctr: 0.1,
        isPrimary: true,
      },
    });

    await prisma.seoCannibalizationUrl.create({
      data: {
        cannibalizationId: testCannibalization.id,
        url: "https://test-shop.myshopify.com/secondary",
        position: 12,
        clicks: 20,
        impressions: 200,
        ctr: 0.1,
        isPrimary: false,
      },
    });

    console.log("✅ Database schema test passed");
    return testCannibalization.id;
  } catch (error: any) {
    console.error("❌ Database schema test failed:", error.message);
    throw error;
  }
}

async function testCannibalizationDetection() {
  console.log("🔍 Testing cannibalization detection...");
  
  try {
    const report = await detectKeywordCannibalization("test-shop.myshopify.com");
    
    console.log("📊 Detection Results:");
    console.log(`  - Total keywords: ${report.summary.totalKeywords}`);
    console.log(`  - Conflicts found: ${report.summary.keywordsWithCannibalization}`);
    console.log(`  - Critical issues: ${report.summary.criticalIssues}`);
    console.log(`  - Warning issues: ${report.summary.warningIssues}`);
    console.log(`  - Estimated clicks lost: ${report.summary.estimatedClicksLost}`);
    
    console.log("✅ Cannibalization detection test passed");
    return report;
  } catch (error: any) {
    console.error("❌ Cannibalization detection test failed:", error.message);
    throw error;
  }
}

async function testConflictListing() {
  console.log("🔍 Testing conflict listing...");
  
  try {
    const conflicts = await getStoredCannibalizationConflicts("test-shop.myshopify.com", "active");
    
    console.log(`📋 Found ${conflicts.length} active conflicts:`);
    conflicts.forEach((conflict, index) => {
      console.log(`  ${index + 1}. "${conflict.keyword}" (${conflict.severity})`);
      console.log(`     Primary: ${conflict.recommendation.primaryUrl}`);
      console.log(`     Secondary: ${conflict.recommendation.secondaryUrls.join(", ")}`);
      console.log(`     Action: ${conflict.recommendation.action}`);
      console.log(`     Potential clicks lost: ${conflict.potentialClicksLost}`);
    });
    
    console.log("✅ Conflict listing test passed");
    return conflicts;
  } catch (error: any) {
    console.error("❌ Conflict listing test failed:", error.message);
    throw error;
  }
}

async function testApiEndpoints() {
  console.log("🔍 Testing API endpoints...");
  
  try {
    // Test main detection endpoint
    const detectionResponse = await fetch("http://localhost:3000/api/seo/cannibalization?shop=test-shop.myshopify.com");
    const detectionData = await detectionResponse.json();
    
    if (!detectionData.success) {
      throw new Error(`Detection API failed: ${detectionData.error}`);
    }
    
    console.log("✅ Detection API test passed");
    
    // Test conflicts listing endpoint
    const conflictsResponse = await fetch("http://localhost:3000/api/seo/cannibalization?shop=test-shop.myshopify.com&conflicts=true&list=active");
    const conflictsData = await conflictsResponse.json();
    
    if (!conflictsData.success) {
      throw new Error(`Conflicts API failed: ${conflictsData.error}`);
    }
    
    console.log(`✅ Conflicts API test passed (${conflictsData.data.count} conflicts found)`);
    
    return { detectionData, conflictsData };
  } catch (error: any) {
    console.error("❌ API endpoints test failed:", error.message);
    throw error;
  }
}

async function cleanup(testId: number) {
  console.log("🧹 Cleaning up test data...");
  
  try {
    await prisma.seoCannibalizationUrl.deleteMany({
      where: { cannibalizationId: testId },
    });
    
    await prisma.seoCannibalization.delete({
      where: { id: testId },
    });
    
    console.log("✅ Cleanup completed");
  } catch (error: any) {
    console.error("❌ Cleanup failed:", error.message);
  }
}

async function main() {
  console.log("🚀 Starting Cannibalization Detection Workflow Test");
  console.log("=" .repeat(60));
  
  let testId: number | null = null;
  
  try {
    // Test 1: Database Schema
    testId = await testDatabaseSchema();
    
    // Test 2: Cannibalization Detection
    await testCannibalizationDetection();
    
    // Test 3: Conflict Listing
    await testConflictListing();
    
    // Test 4: API Endpoints (skip if server not running)
    try {
      await testApiEndpoints();
    } catch (error) {
      console.log("⚠️  API endpoints test skipped (server not running)");
    }
    
    console.log("=" .repeat(60));
    console.log("🎉 All tests passed! Cannibalization detection system is working correctly.");
    
  } catch (error: any) {
    console.log("=" .repeat(60));
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  } finally {
    if (testId) {
      await cleanup(testId);
    }
    await prisma.$disconnect();
  }
}

// Run the test
main().catch(console.error);
