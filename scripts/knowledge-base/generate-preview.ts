#!/usr/bin/env tsx
/**
 * Generate CEO Preview Document
 * 
 * Creates a formatted markdown document for CEO review of scraped content
 * CEO can mark each section as: Approve / Reject / Edit
 * 
 * Usage:
 *   npx tsx scripts/knowledge-base/generate-preview.ts <scrape-file>
 * 
 * Example:
 *   npx tsx scripts/knowledge-base/generate-preview.ts staging/knowledge-base/hotrodan-scrape-2025-10-24.json
 * 
 * Output:
 *   staging/knowledge-base/ceo-review-YYYY-MM-DD.md
 */

import { promises as fs } from "fs";
import { join } from "path";

interface ScrapedPage {
  url: string;
  title: string;
  content: string;
  scrapedAt: string;
  category: 'policy' | 'faq' | 'product' | 'about' | 'support';
  error?: string;
}

interface ScrapeResult {
  scrapedAt: string;
  totalPages: number;
  successfulPages: number;
  failedPages: number;
  pages: ScrapedPage[];
}

/**
 * Truncate content for preview (first 500 chars + ...)
 */
function truncateContent(content: string, maxLength: number = 500): string {
  if (content.length <= maxLength) {
    return content;
  }
  return content.slice(0, maxLength) + '...\n\n[Content truncated - full content will be committed if approved]';
}

/**
 * Generate markdown preview for a single page
 */
function generatePagePreview(page: ScrapedPage, index: number): string {
  const preview = `
## Section ${index + 1}: ${page.title}

**URL:** ${page.url}  
**Category:** ${page.category}  
**Scraped:** ${new Date(page.scrapedAt).toLocaleString()}  
**Content Length:** ${page.content.length} characters

${page.error ? `**⚠️ Error:** ${page.error}\n` : ''}

### Content Preview

\`\`\`
${truncateContent(page.content, 800)}
\`\`\`

### CEO Action Required

**Decision:** [ ] Approve  [ ] Reject  [ ] Edit

**Notes/Edits:**
<!-- CEO: Add any notes or edits here -->


**Approval Signature:** ___________________  
**Date:** ___________________

---
`;
  return preview;
}

/**
 * Generate complete CEO review document
 */
function generateReviewDocument(scrapeResult: ScrapeResult, scrapeFilePath: string): string {
  const dateStr = scrapeResult.scrapedAt.split('T')[0];
  
  const header = `# Knowledge Base Content Review - ${dateStr}

**CEO:** Justin  
**Reviewer:** CEO (Justin)  
**Source:** hotrodan.com website scrape  
**Scrape File:** ${scrapeFilePath}  
**Total Sections:** ${scrapeResult.totalPages}  
**Successful:** ${scrapeResult.successfulPages}  
**Failed:** ${scrapeResult.failedPages}

---

## 🚨 CRITICAL INSTRUCTIONS

**Before approving ANY content:**

1. **Review each section carefully** - Verify accuracy of policies, FAQ, and product information
2. **Mark your decision** - Check ONE box: Approve / Reject / Edit
3. **Add notes/edits** - If editing, specify exact changes in the Notes section
4. **Sign and date** - Add your signature and date for each approved section
5. **Save as approved** - Save this file as \`ceo-review-${dateStr}-approved.md\`
6. **Run commit script** - Only then run the commit script with the approved file

**What gets committed:**
- ONLY sections marked "Approve" will be committed to the knowledge base
- Sections marked "Reject" will be skipped
- Sections marked "Edit" will use your edited version from Notes

**Approval metadata:**
- All commits will include CEO approval metadata
- Approval date and signature will be recorded
- Source URL and scrape date will be preserved

---

## 📊 Summary by Category

`;

  // Group pages by category
  const byCategory: Record<string, ScrapedPage[]> = {};
  for (const page of scrapeResult.pages) {
    if (!byCategory[page.category]) {
      byCategory[page.category] = [];
    }
    byCategory[page.category].push(page);
  }
  
  let summary = '';
  for (const [category, pages] of Object.entries(byCategory)) {
    const successful = pages.filter(p => !p.error).length;
    const failed = pages.filter(p => p.error).length;
    summary += `- **${category}:** ${pages.length} pages (${successful} successful, ${failed} failed)\n`;
  }
  
  const sections = `
${summary}

---

## 📄 Content Sections for Review

${scrapeResult.pages.map((page, index) => generatePagePreview(page, index)).join('\n')}

---

## ✅ Final Approval

**I, Justin (CEO), have reviewed all sections above and:**

- [ ] Approve all sections marked "Approve" for commit to knowledge base
- [ ] Confirm all edits are accurate and ready for commit
- [ ] Authorize commit of approved content with my signature below

**CEO Signature:** ___________________  
**Date:** ___________________  
**Time:** ___________________

---

## 📋 Next Steps

1. **Save this file as:** \`ceo-review-${dateStr}-approved.md\`
2. **Run commit script:**
   \`\`\`bash
   npx tsx scripts/knowledge-base/commit-approved.ts staging/knowledge-base/ceo-review-${dateStr}-approved.md
   \`\`\`
3. **Verify commits:** Check that only approved sections were committed
4. **Test queries:** Run sample queries to verify knowledge base is working

---

**Generated:** ${new Date().toISOString()}  
**Script:** scripts/knowledge-base/generate-preview.ts
`;

  return header + sections;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Error: No scrape file specified');
    console.error('\nUsage:');
    console.error('  npx tsx scripts/knowledge-base/generate-preview.ts <scrape-file>');
    console.error('\nExample:');
    console.error('  npx tsx scripts/knowledge-base/generate-preview.ts staging/knowledge-base/hotrodan-scrape-2025-10-24.json');
    process.exit(1);
  }
  
  const scrapeFilePath = args[0];
  
  console.log('📝 Generating CEO preview document\n');
  console.log('='.repeat(80));
  console.log(`\n📂 Reading: ${scrapeFilePath}`);
  
  // Read scrape file
  const scrapeData = await fs.readFile(scrapeFilePath, 'utf-8');
  const scrapeResult: ScrapeResult = JSON.parse(scrapeData);
  
  console.log(`\n📊 Scrape summary:`);
  console.log(`   Total pages: ${scrapeResult.totalPages}`);
  console.log(`   Successful: ${scrapeResult.successfulPages}`);
  console.log(`   Failed: ${scrapeResult.failedPages}`);
  
  // Generate preview document
  console.log(`\n📝 Generating preview document...`);
  const previewDoc = generateReviewDocument(scrapeResult, scrapeFilePath);
  
  // Save preview
  const dateStr = scrapeResult.scrapedAt.split('T')[0];
  const stagingDir = join(process.cwd(), 'staging', 'knowledge-base');
  const outputPath = join(stagingDir, `ceo-review-${dateStr}.md`);
  
  await fs.writeFile(outputPath, previewDoc);
  
  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Preview document generated!\n');
  console.log(`💾 Saved to: ${outputPath}`);
  console.log(`\n📋 Next steps:`);
  console.log(`   1. Open the preview document in your editor`);
  console.log(`   2. Review each section carefully`);
  console.log(`   3. Mark: Approve / Reject / Edit for each section`);
  console.log(`   4. Add your signature and date`);
  console.log(`   5. Save as: ceo-review-${dateStr}-approved.md`);
  console.log(`   6. Run: npx tsx scripts/knowledge-base/commit-approved.ts staging/knowledge-base/ceo-review-${dateStr}-approved.md\n`);
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

