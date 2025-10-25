/**
 * Validate Secrets Script
 * 
 * Validates all required secrets are present and properly formatted
 * 
 * Usage:
 *   npx tsx scripts/security/validate-secrets.ts
 * 
 * Task: SECURITY-AUDIT-003
 */

import { getSecretsManager, SecretCategory } from '../../app/services/security/secrets-manager';

function main() {
  console.log('🔍 Validating Secrets...\n');
  
  const manager = getSecretsManager();
  let hasErrors = false;
  
  // Check all required secrets
  console.log('📋 Checking Required Secrets...');
  const { isValid, missing } = manager.validateAllRequired();
  
  if (isValid) {
    console.log('✅ All required secrets present\n');
  } else {
    console.log('❌ Missing required secrets:');
    missing.forEach(name => console.log(`   - ${name}`));
    console.log('');
    hasErrors = true;
  }
  
  // Validate each category
  const categories = [
    SecretCategory.SHOPIFY,
    SecretCategory.DATABASE,
    SecretCategory.CHATWOOT,
    SecretCategory.ANALYTICS,
  ];
  
  console.log('🔐 Validating Secret Categories...');
  
  categories.forEach(category => {
    const result = manager.validateCategory(category);
    
    if (result.isValid) {
      console.log(`✅ ${category} secrets valid`);
    } else {
      console.log(`❌ ${category} secrets invalid:`);
      result.errors.forEach(error => console.log(`   - ${error}`));
      hasErrors = true;
    }
  });
  
  console.log('');
  
  // Get audit report
  console.log('📊 Secrets Audit Report:');
  const report = manager.getAuditReport();
  
  console.log(`   Total: ${report.total}`);
  console.log(`   Present: ${report.present}`);
  console.log(`   Missing: ${report.missing}`);
  console.log(`   Needs Rotation: ${report.needsRotation}`);
  console.log('');
  
  console.log('   By Category:');
  Object.entries(report.byCategory).forEach(([category, stats]) => {
    const percentage = ((stats.present / stats.total) * 100).toFixed(0);
    console.log(`     ${category}: ${stats.present}/${stats.total} (${percentage}%)`);
  });
  
  console.log('');
  
  if (hasErrors) {
    console.log('❌ Validation failed. Please fix the errors above.');
    process.exit(1);
  } else {
    console.log('✅ All validations passed!');
    process.exit(0);
  }
}

main();

