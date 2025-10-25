#!/usr/bin/env tsx

/**
 * GA4 Custom Dimensions Setup Script
 *
 * ANALYTICS-100: Creates hd_action_key custom dimension in GA4 Property 339826228
 * for Growth Engine action attribution tracking.
 *
 * Usage:
 *   npx tsx scripts/analytics/setup-ga4-custom-dimensions.ts
 */

import { 
  createActionAttributionDimension, 
  getActionAttributionConfig,
  validateActionAttributionDimension,
  testActionAttributionTracking
} from "../../app/services/ga/customDimensions";
import { getGaConfig } from "../../app/config/ga.server";

async function main() {
  console.log("🚀 GA4 Custom Dimensions Setup");
  console.log("=====================================");

  try {
    const config = getGaConfig();
    console.log(`📊 Property ID: ${config.propertyId}`);
    console.log(`🔧 Mode: ${config.mode}`);

    if (config.mode === "mock") {
      console.log("⚠️  Running in mock mode - no actual GA4 changes will be made");
    }

    // Check if dimension already exists
    console.log("\n🔍 Checking existing custom dimensions...");
    const isValid = await validateActionAttributionDimension(config.propertyId);
    
    if (isValid) {
      console.log("✅ hd_action_key custom dimension already exists and is configured correctly");
      return;
    }

    // Create the custom dimension
    console.log("\n📝 Creating hd_action_key custom dimension...");
    const dimensionConfig = getActionAttributionConfig();
    const result = await createActionAttributionDimension(dimensionConfig);

    console.log("✅ Custom dimension created successfully:");
    console.log(`   Name: ${result.name}`);
    console.log(`   Parameter: ${result.parameterName}`);
    console.log(`   Display Name: ${result.displayName}`);
    console.log(`   Scope: ${result.scope}`);
    console.log(`   Active: ${result.active}`);

    // Validate the setup
    console.log("\n🔍 Validating setup...");
    const validationResult = await validateActionAttributionDimension(config.propertyId);
    
    if (validationResult) {
      console.log("✅ Custom dimension validation passed");
    } else {
      console.log("❌ Custom dimension validation failed");
      process.exit(1);
    }

    // Test tracking (if not in mock mode)
    if (config.mode !== "mock") {
      console.log("\n🧪 Testing action attribution tracking...");
      const testResult = await testActionAttributionTracking(config.propertyId);
      
      if (testResult) {
        console.log("✅ Action attribution tracking test passed");
      } else {
        console.log("⚠️  Action attribution tracking test failed (may need time to propagate)");
      }
    }

    console.log("\n🎉 GA4 Custom Dimension Setup Complete!");
    console.log("\n📋 Next Steps:");
    console.log("1. Verify dimension appears in GA4 Admin > Data Display > Custom Definitions");
    console.log("2. Test events with hd_action_key parameter in GA4 DebugView");
    console.log("3. Query attribution data using GA4 Data API");

  } catch (error: any) {
    console.error("❌ Setup failed:", error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
