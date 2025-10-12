/**
 * Quality Rubric Testing
 * Test 20 agent responses against Hot Rod AN quality criteria
 */

import { assessResponse, batchAssess, QUALITY_DIMENSIONS } from './src/quality/rubric.js';
import fs from 'fs/promises';

// Sample responses representing different quality levels
const testResponses = [
  // High Quality Responses (Score: 4.5-5.0)
  {
    id: 1,
    query: 'What PTFE hoses do you sell?',
    response: `We offer PTFE braided hoses in three sizes for your fuel system build:

- AN-6 (3/8" ID): Great for most street applications up to 500 HP
- AN-8 (1/2" ID): Perfect for high-performance and forced induction setups (500-800 HP)
- AN-10 (5/8" ID): Ideal for serious racing applications (800+ HP)

All feature PTFE liner compatible with gasoline, E85, and methanol. Available in black nylon braided or stainless steel braided covering.

View our complete selection: https://hotrodan.com/products/ptfe-hose

Need help choosing the right size for your LS swap? Let me know your engine specs!`,
    sources: [
      { text: 'PTFE hoses...', metadata: { url: 'https://hotrodan.com/products/ptfe-hose' }, score: 0.95 },
      { text: 'AN sizing guide...', metadata: { url: 'https://hotrodan.com/tech/sizing' }, score: 0.88 },
    ],
    expectedInfo: ['AN-6', 'AN-8', 'AN-10', 'PTFE'],
  },
  
  {
    id: 2,
    query: 'Tell me about the Walbro 255 LPH pump',
    response: `The Walbro TI Automotive 255 LPH is a great choice for EFI fuel systems! We carry both versions:

**In-Tank Version (GCA758)**:
- 255 LPH flow rate
- Supports up to 525 HP on gasoline
- Direct replacement for many GM applications
- E85 compatible

**Inline Version (GSL392)**:
- Same 255 LPH flow rate
- External mounting for fuel cell setups
- Ideal for custom hot rod builds

Both pumps work great with our AN-6 fuel line kits for LS swaps.

https://hotrodan.com/products/walbro-255

What type of fuel system setup are you running?`,
    sources: [
      { text: 'Walbro specs...', metadata: { url: 'https://hotrodan.com/products/walbro-255' }, score: 0.92 },
    ],
    expectedInfo: ['255 LPH', 'in-tank', 'inline', 'E85'],
  },
  
  // Medium Quality Responses (Score: 3.5-4.4)
  {
    id: 3,
    query: 'What are AN fittings used for?',
    response: `AN fittings are used in plumbing systems for fuel, oil, and other fluids. They provide secure, leak-free connections and are commonly used in performance vehicle applications.

AN stands for Army-Navy specification. The fittings come in different sizes like AN-6, AN-8, and AN-10.

We sell various AN fittings for your project.`,
    sources: [
      { text: 'AN fitting info...', metadata: { url: 'https://hotrodan.com/tech/an-basics' }, score: 0.78 },
    ],
    expectedInfo: ['fuel', 'AN'],
  },
  
  {
    id: 4,
    query: 'Do you have fuel pressure regulators?',
    response: `Yes, we carry the Corvette-style fuel filter regulator combo unit. It includes built-in AN-6 adapter fittings for easy installation.

This is a popular choice for LS swaps and other EFI conversions.

https://hotrodan.com/products/corvette-filter-regulator`,
    sources: [
      { text: 'Filter regulator...', metadata: { url: 'https://hotrodan.com/products/corvette-filter-regulator' }, score: 0.85 },
    ],
    expectedInfo: ['regulator', 'fuel'],
  },
  
  // Low Quality Responses (Score: <3.5)
  {
    id: 5,
    query: 'What size hose for my LS swap?',
    response: `For an LS swap, you would typically use AN-6 or AN-8 hose depending on your application. Please consult with a professional for your specific setup.`,
    sources: [],
    expectedInfo: ['AN-6', 'AN-8', 'LS'],
  },
  
  {
    id: 6,
    query: 'Can I use these fittings with brake lines?',
    response: `Yes, PTFE fittings can be used for various automotive applications.`,
    sources: [],
    expectedInfo: ['brake', 'PTFE'],
  },
  
  // More test cases...
  {
    id: 7,
    query: 'What comes in the AN-6 bundle?',
    response: `Our AN-6 bundle deal includes 30 feet of nylon braided PTFE hose plus 8 AN-6 reusable fittings (mix of straight, 45°, and 90° swivels).

Perfect for installing a complete fuel system on your hot rod build. Fits AN-6 hose size (3/8" ID).

All the essentials in one package - saves you about 15% vs buying separately.

https://hotrodan.com/products/an-6-bundle

Building an LS swap? This kit has everything you need for the fuel lines!`,
    sources: [
      { text: 'Bundle details...', metadata: { url: 'https://hotrodan.com/products/an-6-bundle' }, score: 0.96 },
      { text: 'AN-6 specs...', metadata: { url: 'https://hotrodan.com/tech/an-sizing' }, score: 0.82 },
    ],
    expectedInfo: ['hose', 'fittings', '8 fittings'],
  },
  
  {
    id: 8,
    query: 'How do I install PTFE fittings?',
    response: `Installing PTFE fittings requires our aluminum vice jaws and a spanner wrench:

1. Cut hose to length with our AN hose shears
2. Secure hose in vice jaws (protects the braided covering)
3. Thread the fitting onto the hose
4. Tighten with spanner wrench - do NOT overtighten!
5. Check for even ferrule compression

Pro tip: The braided cover should sit flush with the fitting collar.

Tools you'll need:
- Aluminum vice jaws: https://hotrodan.com/products/vice-jaws
- Spanner wrench: https://hotrodan.com/products/spanner-wrench
- Hose cutting shears: https://hotrodan.com/products/hose-shears

First time installing? Take it slow - PTFE fittings are reusable so you can practice!`,
    sources: [
      { text: 'Installation guide...', metadata: { url: 'https://hotrodan.com/tech/install-guide' }, score: 0.91 },
      { text: 'Tool recommendations...', metadata: { url: 'https://hotrodan.com/products/tools' }, score: 0.86 },
    ],
    expectedInfo: ['vice', 'wrench', 'ferrule'],
  },
  
  {
    id: 9,
    query: 'What colors do your hoses come in?',
    response: `Our PTFE braided hoses are available in several color combinations:

**Black Nylon Braided** (solid):
- Classic all-black look

**Black with Colored Checks**:
- Orange and black
- Green and black
- Red and black
- Blue and black
- Purple and black
- Yellow and black

**Other Options**:
- Black/silver nylon
- Stainless steel braided (natural stainless finish)

All available in AN-6, AN-8, and AN-10 sizes.

Popular choice for engine bays: red and black for a clean performance look!

https://hotrodan.com/products/ptfe-hoses`,
    sources: [
      { text: 'Color options...', metadata: { url: 'https://hotrodan.com/products/ptfe-hoses' }, score: 0.94 },
    ],
    expectedInfo: ['black', 'orange', 'red', 'blue'],
  },
  
  {
    id: 10,
    query: 'What fuel pump do I need for 600 HP LS build?',
    response: `For a 600 HP LS build, I recommend our Aeromotive Stealth 340 LPH in-tank fuel pump.

**Why this pump:**
- 340 LPH flow supports 600+ HP
- E85 compatible (important for forced induction)
- Proven reliability in high-performance applications
- Direct fitment in most fuel tanks

**Alternative**: Walbro 255 LPH if you're on a budget, but you'll be near its upper limit at 600 HP.

Both work perfectly with our AN-8 fuel line kits for LS swaps.

Aeromotive Stealth: https://hotrodan.com/products/aeromotive-stealth
LS fuel line kit: https://hotrodan.com/products/ls-fuel-kit

Running E85 or pump gas? That affects sizing too.`,
    sources: [
      { text: 'Aeromotive pump specs...', metadata: { url: 'https://hotrodan.com/products/aeromotive-stealth' }, score: 0.93 },
      { text: 'Fuel pump sizing guide...', metadata: { url: 'https://hotrodan.com/tech/pump-sizing' }, score: 0.87 },
      { text: 'LS swap fuel systems...', metadata: { url: 'https://hotrodan.com/tech/ls-fuel' }, score: 0.81 },
    ],
    expectedInfo: ['340 LPH', 'Aeromotive', 'E85', 'LS'],
  },
  
  // Additional varied responses
  {
    id: 11,
    query: 'Do transmission coolers help?',
    response: `Absolutely! Transmission coolers are crucial for hot rod builds, especially with performance upgrades.

We carry two great options:

**Tru-Cool Max 40K (LPD4739)**:
- 40,000 GVW rating
- Max cooling capacity
- Perfect for towing or racing

**Derale 13-Row Series 9500**:
- 34,000 BTU/hour
- Plate-fin design
- Great for street/strip applications

Both keep your trans temps under control and extend transmission life significantly.

https://hotrodan.com/products/transmission-coolers

What's your application - street, strip, or both?`,
    sources: [
      { text: 'Cooler specs...', metadata: { url: 'https://hotrodan.com/products/transmission-coolers' }, score: 0.89 },
    ],
    expectedInfo: ['transmission', 'cooler'],
  },
  
  {
    id: 12,
    query: 'What is the difference between nylon and stainless hose?',
    response: `Great question! Both have PTFE liner (same fuel compatibility), but different outer coverings:

**Nylon Braided**:
- Lighter weight
- More flexible/easier to route
- Various color options
- Lower cost
- Great for engine bays and visible areas

**Stainless Steel Braided**:
- More abrasion resistant
- Higher heat tolerance
- Professional race look
- Slightly more expensive
- Best for exhaust area or harsh environments

For most hot rod fuel systems, nylon braided is perfect. Stainless if you need max protection.

Both available in AN-6, AN-8, AN-10.`,
    sources: [
      { text: 'Hose comparison...', metadata: { url: 'https://hotrodan.com/tech/hose-types' }, score: 0.84 },
    ],
    expectedInfo: ['nylon', 'stainless', 'PTFE'],
  },
  
  {
    id: 13,
    query: 'Shipping to California?',
    response: `Yes! We ship to California and all 50 states.

Standard shipping is typically 3-5 business days. We'll send tracking info once your order ships.

Any questions about your specific order? Let me know!`,
    sources: [],
    expectedInfo: ['shipping', 'California'],
  },
  
  {
    id: 14,
    query: 'What is your return policy?',
    response: `Our return policy allows returns within 30 days of purchase for unused items in original packaging.

If you have any issues with your Hot Rod AN parts, reach out and we'll take care of you!`,
    sources: [],
    expectedInfo: ['return', '30 days'],
  },
  
  {
    id: 15,
    query: 'Which ferrules fit AN-8?',
    response: `We sell replacement ferrules for AN fittings. The AN-8 size ferrules are available.

https://hotrodan.com/products/replacement-ferrules`,
    sources: [
      { text: 'Ferrule products...', metadata: { url: 'https://hotrodan.com/products/ferrules' }, score: 0.76 },
    ],
    expectedInfo: ['ferrule', 'AN-8'],
  },
  
  {
    id: 16,
    query: 'Can I use this for brake lines?',
    response: `Yes, PTFE hose can be used for brake applications due to its excellent temperature and pressure resistance.

However, check your specific application requirements and local regulations for brake line materials.`,
    sources: [],
    expectedInfo: ['brake', 'PTFE'],
  },
  
  {
    id: 17,
    query: 'What tools do I need to install AN fittings?',
    response: `Essential tools for installing your AN PTFE fittings:

**Must-Have:**
1. Aluminum vice jaws - Protect the braided covering while assembling
2. Adjustable spanner wrench (AN3-AN12) - Tighten fittings without damaging
3. AN hose cutting shears - Clean cuts through stainless or nylon braid

**Bundle Deal**: Get all three tools for your install: https://hotrodan.com/products/installation-tools

**Pro tip**: Don't use regular vice or pliers - you'll crush the braiding!

First time? The vice jaws and spanner wrench make installation way easier and prevent damage.`,
    sources: [
      { text: 'Tool guide...', metadata: { url: 'https://hotrodan.com/tech/tools' }, score: 0.90 },
      { text: 'Vice jaws...', metadata: { url: 'https://hotrodan.com/products/vice-jaws' }, score: 0.88 },
    ],
    expectedInfo: ['vice', 'wrench', 'shears'],
  },
  
  {
    id: 18,
    query: 'Tell me about your return style LS kit',
    response: `Our return-style LS engine fuel line kit includes everything for a clean fuel system install:

**Included:**
- Pre-measured PTFE hose for supply and return lines
- Complete AN fittings set
- Adapters for LS fuel rails
- Mounting hardware

**Why return style:**
- Better for high-performance applications
- Maintains consistent fuel pressure
- Works with most aftermarket fuel pumps

**Alternative**: We also have a returnless kit if your  setup doesn't need a return line.

Return style kit: https://hotrodan.com/products/return-ls-kit
Returnless kit: https://hotrodan.com/products/returnless-ls-kit

What fuel pump are you running with your LS?`,
    sources: [
      { text: 'LS kit details...', metadata: { url: 'https://hotrodan.com/products/ls-kits' }, score: 0.94 },
      { text: 'Return vs returnless...', metadata: { url: 'https://hotrodan.com/tech/fuel-systems' }, score: 0.81 },
    ],
    expectedInfo: ['return', 'LS', 'kit', 'fuel'],
  },
  
  {
    id: 19,
    query: 'What is AN-6 equivalent to?',
    response: `AN-6 has an inside diameter of 3/8 inch (approximately 9.5mm).

It's the standard size for most fuel lines in hot rod and performance applications.`,
    sources: [
      { text: 'AN sizing...', metadata: { url: 'https://hotrodan.com/tech/an-sizes' }, score: 0.79 },
    ],
    expectedInfo: ['3/8', 'diameter', 'AN-6'],
  },
  
  {
    id: 20,
    query: 'What pressure can PTFE hose handle?',
    response: `PTFE braided hose is rated for high pressure applications, typically 1500+ PSI depending on size and construction.

Perfect for fuel systems, brake lines, and other high-pressure automotive uses.

Check the specific product page for exact pressure ratings by size.`,
    sources: [
      { text: 'PTFE specs...', metadata: { url: 'https://hotrodan.com/tech/ptfe' }, score: 0.72 },
    ],
    expectedInfo: ['pressure', 'PTFE', 'PSI'],
  },
];

console.log('🎯 Agent Response Quality Rubric Test\n');
console.log('Testing 20 responses against Hot Rod AN quality criteria\n');
console.log('='.repeat(80) + '\n');

// Display rubric criteria
console.log('QUALITY RUBRIC DIMENSIONS:\n');
Object.entries(QUALITY_DIMENSIONS).forEach(([key, dim]) => {
  console.log(`${dim.name} (Weight: ${(dim.weight * 100).toFixed(0)}%)`);
  console.log(`  ${dim.description}`);
  console.log(`  5 = ${dim.criteria[5]}`);
  console.log(`  1 = ${dim.criteria[1]}\n`);
});

console.log('='.repeat(80) + '\n');

// Test each response
const results: any[] = [];

for (const test of testResponses) {
  console.log(`[${test.id}/20] ${test.query}`);
  
  const assessment = assessResponse({
    response: test.response,
    customerQuery: test.query,
    sources: test.sources,
    expectedInfo: test.expectedInfo,
  });
  
  console.log(`  Overall Score: ${assessment.overallScore.toFixed(2)}/5.0 ${assessment.passThreshold ? '✅ PASS' : '❌ FAIL'}`);
  
  assessment.dimensionScores.forEach(score => {
    console.log(`    ${score.dimension}: ${score.score}/5 (${(score.weight * 100).toFixed(0)}%) - ${score.reasoning}`);
  });
  
  if (assessment.recommendations.length > 0) {
    console.log(`  Recommendations:`);
    assessment.recommendations.forEach(rec => {
      console.log(`    - ${rec}`);
    });
  }
  
  console.log('');
  
  results.push({
    ...test,
    assessment,
  });
}

// Batch analysis
console.log('='.repeat(80));
console.log('BATCH ANALYSIS SUMMARY');
console.log('='.repeat(80) + '\n');

const batchResult = batchAssess(testResponses);

console.log(`Total Responses: ${batchResult.summary.totalResponses}`);
console.log(`Pass Rate: ${(batchResult.summary.passRate * 100).toFixed(1)}% (threshold: ≥4.0/5.0)`);
console.log(`Average Overall Score: ${batchResult.summary.avgOverallScore.toFixed(2)}/5.0\n`);

console.log('Average Scores by Dimension:');
Object.entries(batchResult.summary.avgByDimension).forEach(([dim, score]) => {
  const dimInfo = QUALITY_DIMENSIONS[dim as keyof typeof QUALITY_DIMENSIONS];
  console.log(`  ${dimInfo.name}: ${score.toFixed(2)}/5.0 (${(dimInfo.weight * 100).toFixed(0)}% weight)`);
});

if (batchResult.summary.commonIssues.length > 0) {
  console.log(`\nCommon Issues (>30% of responses):`);
  batchResult.summary.commonIssues.forEach(issue => {
    console.log(`  - ${issue}`);
  });
}

// Save results
const reportPath = 'packages/memory/logs/quality/quality-rubric-test-' + new Date().toISOString().slice(0,10) + '.json';
await fs.mkdir('packages/memory/logs/quality', { recursive: true });
await fs.writeFile(reportPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  rubricVersion: '1.0',
  criteria: QUALITY_DIMENSIONS,
  testResults: results,
  summary: batchResult.summary,
}, null, 2));

console.log(`\n✅ Quality rubric test results saved to: ${reportPath}`);

console.log(`\n🎯 RUBRIC ${batchResult.summary.avgOverallScore >= 4.0 ? 'VALIDATED ✅' : 'NEEDS TUNING ⚠️'}`);
console.log(`   Target: ≥4.0/5.0 average | Actual: ${batchResult.summary.avgOverallScore.toFixed(2)}/5.0\n`);

EOF
cat test-quality-rubric.ts | head -50
