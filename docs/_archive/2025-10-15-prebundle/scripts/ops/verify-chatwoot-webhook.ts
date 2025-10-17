#!/usr/bin/env ts-node
/**
 * Chatwoot Webhook Signature Verification Script
 *
 * Purpose: Verify HMAC-SHA256 signatures from Chatwoot webhooks
 * Usage: ts-node scripts/ops/verify-chatwoot-webhook.ts <payload-file> <signature> <secret>
 *
 * Example:
 *   ts-node scripts/ops/verify-chatwoot-webhook.ts test-payload.json \
 *     "abc123..." "your-webhook-secret"
 */

import * as crypto from "crypto";
import * as fs from "fs";

interface VerificationResult {
  valid: boolean;
  expectedSignature: string;
  receivedSignature: string;
  payloadHash: string;
  timestamp: string;
}

/**
 * Verify Chatwoot webhook signature using HMAC-SHA256
 */
function verifyWebhookSignature(
  payload: string,
  receivedSignature: string,
  webhookSecret: string,
): VerificationResult {
  const timestamp = new Date().toISOString();

  // Create HMAC with SHA-256
  const hmac = crypto.createHmac("sha256", webhookSecret);
  hmac.update(payload);
  const expectedSignature = hmac.digest("hex");

  // Calculate payload hash for debugging
  const payloadHash = crypto
    .createHash("sha256")
    .update(payload)
    .digest("hex")
    .substring(0, 16);

  const valid = expectedSignature === receivedSignature;

  return {
    valid,
    expectedSignature,
    receivedSignature,
    payloadHash,
    timestamp,
  };
}

/**
 * Generate signature for testing purposes
 */
function generateSignature(payload: string, webhookSecret: string): string {
  const hmac = crypto.createHmac("sha256", webhookSecret);
  hmac.update(payload);
  return hmac.digest("hex");
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`
Chatwoot Webhook Signature Verification

Usage:
  # Verify a signature
  ts-node verify-chatwoot-webhook.ts <payload-file> <signature> <secret>
  
  # Generate a signature for testing
  ts-node verify-chatwoot-webhook.ts --generate <payload-file> <secret>
  
  # Test with sample payload
  ts-node verify-chatwoot-webhook.ts --test

Examples:
  # Verify webhook
  ts-node verify-chatwoot-webhook.ts payload.json abc123... my-secret
  
  # Generate test signature
  ts-node verify-chatwoot-webhook.ts --generate payload.json my-secret
  
Options:
  --help, -h       Show this help message
  --generate       Generate signature for a payload
  --test           Run with built-in test payload
    `);
    process.exit(0);
  }

  // Handle --generate flag
  if (args[0] === "--generate") {
    if (args.length < 3) {
      console.error("Error: --generate requires <payload-file> <secret>");
      process.exit(1);
    }

    const payloadFile = args[1];
    const secret = args[2];

    try {
      const payload = fs.readFileSync(payloadFile, "utf-8");
      const signature = generateSignature(payload, secret);

      console.log("\n✅ Signature Generated Successfully\n");
      console.log(`Payload File: ${payloadFile}`);
      console.log(`Signature: ${signature}`);
      console.log(`\nUse this signature in X-Chatwoot-Signature header`);
      process.exit(0);
    } catch (error) {
      console.error(`Error reading payload file: ${error.message}`);
      process.exit(1);
    }
  }

  // Handle --test flag
  if (args[0] === "--test") {
    console.log("\n🧪 Running Test with Sample Payload\n");

    const testPayload = JSON.stringify({
      event: "message_created",
      account: { id: 1, name: "Test Account" },
      conversation: { id: 123, status: "open" },
      message: {
        id: 456,
        content: "Test message",
        message_type: 0,
        sender: { type: "contact" },
      },
    });

    const testSecret = "test-webhook-secret-12345";
    const testSignature = generateSignature(testPayload, testSecret);

    console.log("Test Payload:");
    console.log(JSON.stringify(JSON.parse(testPayload), null, 2));
    console.log(`\nTest Secret: ${testSecret}`);
    console.log(`Generated Signature: ${testSignature}`);

    // Verify it
    const result = verifyWebhookSignature(
      testPayload,
      testSignature,
      testSecret,
    );

    console.log(
      `\n${result.valid ? "✅" : "❌"} Verification: ${result.valid ? "VALID" : "INVALID"}`,
    );
    console.log(`Expected: ${result.expectedSignature}`);
    console.log(`Received: ${result.receivedSignature}`);

    process.exit(result.valid ? 0 : 1);
  }

  // Standard verification mode
  if (args.length < 3) {
    console.error(
      "Error: Required arguments: <payload-file> <signature> <secret>",
    );
    console.error("Run with --help for usage information");
    process.exit(1);
  }

  const payloadFile = args[0];
  const receivedSignature = args[1];
  const webhookSecret = args[2];

  try {
    const payload = fs.readFileSync(payloadFile, "utf-8");
    const result = verifyWebhookSignature(
      payload,
      receivedSignature,
      webhookSecret,
    );

    console.log("\n" + "=".repeat(60));
    console.log("Chatwoot Webhook Signature Verification");
    console.log("=".repeat(60) + "\n");

    console.log(`Payload File: ${payloadFile}`);
    console.log(`Payload Hash: ${result.payloadHash}...`);
    console.log(`Timestamp: ${result.timestamp}\n`);

    console.log(
      `${result.valid ? "✅" : "❌"} Verification Status: ${result.valid ? "VALID" : "INVALID"}\n`,
    );

    console.log("Signature Comparison:");
    console.log(`  Expected:  ${result.expectedSignature}`);
    console.log(`  Received:  ${result.receivedSignature}`);

    if (!result.valid) {
      console.log("\n⚠️  Signatures do not match!");
      console.log("Possible issues:");
      console.log("  - Incorrect webhook secret");
      console.log("  - Payload was modified");
      console.log("  - Signature encoding mismatch");
    } else {
      console.log("\n✅ Webhook signature is valid and authentic");
    }

    console.log("\n" + "=".repeat(60) + "\n");

    process.exit(result.valid ? 0 : 1);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

// Execute if run directly (ES module compatible)
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Export for use in other modules
export { verifyWebhookSignature, generateSignature };
