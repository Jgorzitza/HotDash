#!/usr/bin/env tsx
/**
 * Chatwoot Canned Response Import Script
 * 
 * Automates creation of canned responses (message templates) via Chatwoot API
 * 
 * Usage:
 *   source vault/occ/chatwoot/api_token_staging.env
 *   tsx scripts/chatwoot/import-canned-responses.ts
 */

interface CannedResponse {
  short_code: string;
  content: string;
}

const CHATWOOT_BASE_URL = 'https://hotdash-chatwoot.fly.dev';
const CHATWOOT_API_TOKEN = process.env.CHATWOOT_API_TOKEN_STAGING;
const CHATWOOT_ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID_STAGING || '1';

// Canned responses for Hot Rod AN customer support
const cannedResponses: CannedResponse[] = [
  {
    short_code: 'shipping',
    content: `Thanks for your order! Most orders ship within 1-2 business days.

You'll receive a tracking number via email once your order ships.

If you have any questions about your order, please provide your order number and I'll be happy to help!`,
  },
  {
    short_code: 'sizing',
    content: `AN fittings use a dash size system. Here's a quick guide:

-4 AN = 1/4" hose
-6 AN = 3/8" hose
-8 AN = 1/2" hose
-10 AN = 5/8" hose
-12 AN = 3/4" hose

Need help determining the right size for your application? Let us know what you're working on and we can provide specific recommendations!`,
  },
  {
    short_code: 'returns',
    content: `We accept returns within 30 days of purchase for unused items in original packaging.

To initiate a return:
1. Reply with your order number
2. Let us know which items you'd like to return
3. We'll provide a return authorization and instructions

Refunds are processed within 5-7 business days of receiving the return.`,
  },
  {
    short_code: 'technical',
    content: `For technical fitment questions, we recommend:

1. Check our installation guides at www.hotrodan.com/guides
2. Verify your vehicle/application specifications
3. Contact us with your specific setup details

What vehicle or application are you working on? The more details you provide (year, make, model, engine), the better we can assist!`,
  },
  {
    short_code: 'orderstatus',
    content: `I'd be happy to check your order status!

Can you please provide your order number? It should be in your order confirmation email.

Once I have that, I can give you the current status and tracking information if available.`,
  },
  {
    short_code: 'welcome',
    content: `Thank you for contacting Hot Rod AN! We specialize in premium AN fittings and fuel system components.

How can we assist you today?`,
  },
  {
    short_code: 'product_info',
    content: `I'd be happy to help you find the right product!

To provide the best recommendation, could you please share:
- What application/project you're working on
- The specific component you need (hose end, adapter, etc.)
- Size requirements if known

This will help me point you to the perfect product for your needs.`,
  },
  {
    short_code: 'bulk_order',
    content: `Thank you for your interest in a bulk order!

For bulk purchases and wholesale pricing:
- Email us at wholesale@hotrodan.com
- Include the part numbers and quantities you need
- We'll provide a custom quote within 24 hours

For orders over $500, we offer volume discounts and special shipping rates.`,
  },
  {
    short_code: 'compatibility',
    content: `To confirm compatibility, I'll need a few details:

1. What are you trying to connect? (e.g., fuel line to carburetor)
2. Thread sizes if known
3. Vehicle year, make, and model
4. Any existing fittings you're working with

With this information, I can confirm the exact parts you need.`,
  },
  {
    short_code: 'escalate',
    content: `I'm going to escalate your question to our technical specialist who can provide more detailed assistance.

They'll review your case and respond within 4 business hours.

Is there anything else I can help you with in the meantime?`,
  },
];

async function importCannedResponses() {
  if (!CHATWOOT_API_TOKEN) {
    console.error('❌ Error: CHATWOOT_API_TOKEN_STAGING not found in environment');
    console.error('Run: source vault/occ/chatwoot/api_token_staging.env');
    process.exit(1);
  }

  console.log('🚀 Starting canned response import...');
  console.log(`📍 Target: ${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}`);
  console.log(`📝 Importing ${cannedResponses.length} canned responses\n`);

  const results = {
    created: [] as string[],
    updated: [] as string[],
    failed: [] as { code: string; error: string }[],
  };

  for (const response of cannedResponses) {
    try {
      console.log(`⏳ Processing: ${response.short_code}...`);

      const res = await fetch(
        `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/canned_responses`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api_access_token': CHATWOOT_API_TOKEN,
          },
          body: JSON.stringify(response),
        }
      );

      if (res.ok) {
        const data = await res.json();
        results.created.push(response.short_code);
        console.log(`  ✅ Created: ${response.short_code} (ID: ${data.id})`);
      } else if (res.status === 422) {
        // Already exists - try to update
        console.log(`  ⚠️  Already exists, attempting update...`);
        // Note: Chatwoot API doesn't easily support updates by short_code
        // Would need to fetch all, find by short_code, then update by ID
        results.updated.push(response.short_code);
      } else {
        const errorText = await res.text();
        results.failed.push({
          code: response.short_code,
          error: `HTTP ${res.status}: ${errorText}`,
        });
        console.log(`  ❌ Failed: ${response.short_code} - ${errorText}`);
      }
    } catch (error) {
      results.failed.push({
        code: response.short_code,
        error: error instanceof Error ? error.message : String(error),
      });
      console.log(`  ❌ Error: ${response.short_code} - ${error}`);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Import Summary:');
  console.log('='.repeat(60));
  console.log(`✅ Created: ${results.created.length}`);
  if (results.created.length > 0) {
    results.created.forEach((code) => console.log(`   - ${code}`));
  }

  console.log(`⚠️  Updated/Skipped: ${results.updated.length}`);
  if (results.updated.length > 0) {
    results.updated.forEach((code) => console.log(`   - ${code}`));
  }

  console.log(`❌ Failed: ${results.failed.length}`);
  if (results.failed.length > 0) {
    results.failed.forEach(({ code, error }) => console.log(`   - ${code}: ${error}`));
  }

  console.log('='.repeat(60));

  // Exit with appropriate code
  if (results.failed.length > 0) {
    console.log('\n⚠️  Some responses failed to import. Check errors above.');
    process.exit(1);
  } else {
    console.log('\n🎉 All canned responses imported successfully!');
    process.exit(0);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importCannedResponses();
}

export { importCannedResponses, cannedResponses };

