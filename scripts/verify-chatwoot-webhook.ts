#!/usr/bin/env node
/**
 * Chatwoot Webhook Signature Verification Script
 * 
 * Purpose: Verify HMAC signatures from Chatwoot webhooks for security
 * Usage: node scripts/verify-chatwoot-webhook.ts <payload> <signature> [secret]
 * 
 * Created: 2025-10-12
 * Owner: Chatwoot Agent
 */

import { createHmac } from 'crypto';

interface VerificationResult {
  valid: boolean;
  expectedSignature: string;
  providedSignature: string;
  algorithm: 'sha256';
  timestamp: string;
}

/**
 * Verify Chatwoot webhook signature using HMAC SHA-256
 * 
 * @param payload - Raw webhook payload (JSON string)
 * @param signature - X-Chatwoot-Signature header value
 * @param secret - Webhook secret from Chatwoot settings
 * @returns Verification result with details
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): VerificationResult {
  // Create HMAC with SHA-256
  const hmac = createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');
  
  return {
    valid: signature === expectedSignature,
    expectedSignature,
    providedSignature: signature,
    algorithm: 'sha256',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Verify webhook and print results
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node verify-chatwoot-webhook.ts <payload> <signature> [secret]');
    console.error('');
    console.error('Examples:');
    console.error('  # With inline secret');
    console.error('  node verify-chatwoot-webhook.ts \'{"event":"message_created"}\' abc123 my-webhook-secret');
    console.error('');
    console.error('  # With environment variable');
    console.error('  export CHATWOOT_WEBHOOK_SECRET=my-webhook-secret');
    console.error('  node verify-chatwoot-webhook.ts \'{"event":"message_created"}\' abc123');
    process.exit(1);
  }
  
  const payload = args[0];
  const signature = args[1];
  const secret = args[2] || process.env.CHATWOOT_WEBHOOK_SECRET;
  
  if (!secret) {
    console.error('Error: Webhook secret required');
    console.error('Provide as argument or set CHATWOOT_WEBHOOK_SECRET env var');
    process.exit(1);
  }
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔐 Chatwoot Webhook Signature Verification');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  
  const result = verifyWebhookSignature(payload, signature, secret);
  
  console.log(`Timestamp: ${result.timestamp}`);
  console.log(`Algorithm: HMAC-${result.algorithm.toUpperCase()}`);
  console.log('');
  console.log('Payload:');
  console.log(`  ${payload.substring(0, 100)}${payload.length > 100 ? '...' : ''}`);
  console.log('');
  console.log('Signature Comparison:');
  console.log(`  Provided:  ${result.providedSignature}`);
  console.log(`  Expected:  ${result.expectedSignature}`);
  console.log('');
  
  if (result.valid) {
    console.log('✅ VALID - Signature matches! Webhook is authentic.');
    console.log('');
    console.log('This webhook came from Chatwoot and has not been tampered with.');
    process.exit(0);
  } else {
    console.log('❌ INVALID - Signature mismatch! Webhook may be forged.');
    console.log('');
    console.log('⚠️  WARNING: Do not process this webhook!');
    console.log('');
    console.log('Possible causes:');
    console.log('  - Wrong webhook secret');
    console.log('  - Payload was modified in transit');
    console.log('  - Signature from different Chatwoot account');
    console.log('  - Man-in-the-middle attack');
    process.exit(1);
  }
}

// Run if called directly (ESM compatible)
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === __filename;

if (isMainModule) {
  main();
}

