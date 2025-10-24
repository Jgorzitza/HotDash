/**
 * Check Secret Rotation Script
 * 
 * Checks which secrets need rotation based on rotation policy
 * 
 * Usage:
 *   npx tsx scripts/security/check-rotation.ts
 * 
 * Task: SECURITY-AUDIT-003
 */

import { getSecretsManager } from '../../app/services/security/secrets-manager';

function main() {
  console.log('🔄 Checking Secret Rotation Status...\n');
  
  const manager = getSecretsManager();
  const needsRotation = manager.getSecretsNeedingRotation();
  
  if (needsRotation.length === 0) {
    console.log('✅ All secrets are up to date. No rotation needed.');
    process.exit(0);
  }
  
  console.log(`⚠️  ${needsRotation.length} secret(s) need rotation:\n`);
  
  needsRotation.forEach(meta => {
    const status = meta.lastRotated 
      ? `last rotated ${getDaysSince(meta.lastRotated)} days ago`
      : 'never rotated';
    
    console.log(`   - ${meta.name}`);
    console.log(`     Category: ${meta.category}`);
    console.log(`     Status: ${status}`);
    console.log(`     Rotation policy: every ${meta.rotationDays} days`);
    console.log('');
  });
  
  console.log('📖 See docs/security/secrets-management.md for rotation procedures.');
  
  // Exit with warning code
  process.exit(1);
}

function getDaysSince(date: Date): number {
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

main();

