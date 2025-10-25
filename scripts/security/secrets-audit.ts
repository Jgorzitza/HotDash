/**
 * Secrets Audit Script
 * 
 * Generates comprehensive audit report of all secrets
 * 
 * Usage:
 *   npx tsx scripts/security/secrets-audit.ts
 * 
 * Task: SECURITY-AUDIT-003
 */

import { getSecretsManager } from '../../app/services/security/secrets-manager';

function main() {
  console.log('📊 Secrets Audit Report\n');
  console.log('='.repeat(80));
  console.log('');
  
  const manager = getSecretsManager();
  const report = manager.getAuditReport();
  const needsRotation = manager.getSecretsNeedingRotation();
  const { isValid, missing } = manager.validateAllRequired();
  
  // Summary
  console.log('Summary:');
  console.log(`  Total Secrets: ${report.total}`);
  console.log(`  Present: ${report.present} (${((report.present / report.total) * 100).toFixed(1)}%)`);
  console.log(`  Missing: ${report.missing}`);
  console.log(`  Needs Rotation: ${needsRotation.length}`);
  console.log('');
  
  // By Category
  console.log('By Category:');
  Object.entries(report.byCategory).forEach(([category, stats]) => {
    const percentage = ((stats.present / stats.total) * 100).toFixed(0);
    const status = stats.present === stats.total ? '✅' : '⚠️';
    console.log(`  ${status} ${category}: ${stats.present}/${stats.total} (${percentage}%)`);
  });
  console.log('');
  
  // Missing Secrets
  if (missing.length > 0) {
    console.log('Missing Required Secrets:');
    missing.forEach(name => console.log(`  ❌ ${name}`));
    console.log('');
  }
  
  // Rotation Needed
  if (needsRotation.length > 0) {
    console.log('Secrets Needing Rotation:');
    needsRotation.forEach(meta => {
      const status = meta.lastRotated 
        ? `${getDaysSince(meta.lastRotated)} days old`
        : 'never rotated';
      console.log(`  ⚠️  ${meta.name} (${status})`);
    });
    console.log('');
  }
  
  // Recommendations
  console.log('Recommendations:');
  
  if (missing.length > 0) {
    console.log('  1. Set missing required secrets in .env.local');
  }
  
  if (needsRotation.length > 0) {
    console.log('  2. Rotate secrets that are overdue');
    console.log('     See: docs/security/secrets-management.md');
  }
  
  if (missing.length === 0 && needsRotation.length === 0) {
    console.log('  ✅ All secrets are properly configured and up to date!');
  }
  
  console.log('');
  console.log('='.repeat(80));
  
  // Exit code
  if (!isValid || needsRotation.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

function getDaysSince(date: Date): number {
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

main();

