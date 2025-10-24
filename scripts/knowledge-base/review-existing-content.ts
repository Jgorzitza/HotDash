#!/usr/bin/env tsx
/**
 * Review Existing Knowledge Base Content
 * 
 * Generates a CEO review document for existing knowledge base content
 * Allows CEO to verify accuracy of content already in the knowledge base
 * 
 * Usage:
 *   npx tsx scripts/knowledge-base/review-existing-content.ts
 * 
 * Output:
 *   staging/knowledge-base/existing-content-review-YYYY-MM-DD.md
 */

import { promises as fs } from "fs";
import { join } from "path";
import { readdir } from "fs/promises";

interface ExistingFile {
  filename: string;
  path: string;
  content: string;
  size: number;
  lines: number;
}

/**
 * Read all files from data/support directory
 */
async function readExistingContent(): Promise<ExistingFile[]> {
  const supportDir = join(process.cwd(), 'data', 'support');
  const files: ExistingFile[] = [];
  
  try {
    const filenames = await readdir(supportDir);
    
    for (const filename of filenames) {
      if (!filename.endsWith('.md')) continue;
      
      const filePath = join(supportDir, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n').length;
      
      files.push({
        filename,
        path: filePath,
        content,
        size: content.length,
        lines,
      });
    }
  } catch (error) {
    console.error('Error reading support directory:', error);
  }
  
  return files;
}

/**
 * Generate preview for a single file
 */
function generateFilePreview(file: ExistingFile, index: number): string {
  const preview = `
## File ${index + 1}: ${file.filename}

**Path:** ${file.path}  
**Size:** ${file.size} characters  
**Lines:** ${file.lines}

### Content Preview (First 50 lines)

\`\`\`markdown
${file.content.split('\n').slice(0, 50).join('\n')}
${file.lines > 50 ? '\n... [Content truncated - see full file for complete content]' : ''}
\`\`\`

### CEO Accuracy Review

**Is this content accurate?** [ ] Yes  [ ] No  [ ] Needs Editing

**Issues found (if any):**
<!-- CEO: List any inaccuracies, outdated information, or needed corrections -->


**Corrections/Edits:**
<!-- CEO: Provide specific corrections if needed -->


**Approval:**
- [ ] Content is accurate - keep as-is
- [ ] Content needs minor edits - see corrections above
- [ ] Content is inaccurate - needs major revision
- [ ] Content should be removed

**Signature:** ___________________  
**Date:** ___________________

---
`;
  return preview;
}

/**
 * Generate complete review document
 */
function generateReviewDocument(files: ExistingFile[]): string {
  const dateStr = new Date().toISOString().split('T')[0];
  
  const header = `# Existing Knowledge Base Content Review - ${dateStr}

**CEO:** Justin  
**Reviewer:** CEO (Justin)  
**Purpose:** Verify accuracy of existing knowledge base content  
**Total Files:** ${files.length}

---

## 🚨 CRITICAL INSTRUCTIONS

**This review is for EXISTING content already in the knowledge base.**

**Your task:**

1. **Review each file carefully** - Check for accuracy, completeness, and correctness
2. **Mark accuracy status** - Is content accurate? Yes / No / Needs Editing
3. **Document issues** - List any inaccuracies or outdated information
4. **Provide corrections** - If editing needed, specify exact changes
5. **Make decision** - Keep as-is / Minor edits / Major revision / Remove
6. **Sign and date** - Add your signature and date for each file
7. **Save as approved** - Save this file as \`existing-content-review-${dateStr}-approved.md\`

**What happens next:**
- Files marked "Keep as-is" remain unchanged
- Files marked "Minor edits" will be updated with your corrections
- Files marked "Major revision" will be flagged for content agent to rewrite
- Files marked "Remove" will be deleted from knowledge base

---

## 📊 Content Summary

**Files in knowledge base:**
${files.map(f => `- ${f.filename} (${f.lines} lines, ${f.size} chars)`).join('\n')}

**Total content:** ${files.reduce((sum, f) => sum + f.size, 0).toLocaleString()} characters

---

## 📄 Files for Review

${files.map((file, index) => generateFilePreview(file, index)).join('\n')}

---

## ✅ Final Approval

**I, Justin (CEO), have reviewed all files above and:**

- [ ] Confirm all files marked "Keep as-is" are accurate
- [ ] Confirm all corrections are accurate and ready to apply
- [ ] Authorize updates/removals as marked above

**CEO Signature:** ___________________  
**Date:** ___________________  
**Time:** ___________________

---

## 📋 Next Steps

1. **Save this file as:** \`existing-content-review-${dateStr}-approved.md\`
2. **Apply corrections:**
   - Content agent will apply minor edits
   - Content agent will rewrite files marked for major revision
   - Files marked for removal will be deleted
3. **Rebuild index:** LlamaIndex will be rebuilt with corrected content
4. **Verify:** Test with sample queries to ensure accuracy

---

**Generated:** ${new Date().toISOString()}  
**Script:** scripts/knowledge-base/review-existing-content.ts
`;

  return header;
}

/**
 * Main function
 */
async function main() {
  console.log('📝 Reviewing existing knowledge base content\n');
  console.log('='.repeat(80));
  
  // Read existing content
  console.log(`\n📂 Reading files from data/support/...`);
  const files = await readExistingContent();
  
  console.log(`\n📊 Found ${files.length} files:`);
  for (const file of files) {
    console.log(`   - ${file.filename} (${file.lines} lines)`);
  }
  
  // Generate review document
  console.log(`\n📝 Generating review document...`);
  const reviewDoc = generateReviewDocument(files);
  
  // Save review
  const dateStr = new Date().toISOString().split('T')[0];
  const stagingDir = join(process.cwd(), 'staging', 'knowledge-base');
  await fs.mkdir(stagingDir, { recursive: true });
  const outputPath = join(stagingDir, `existing-content-review-${dateStr}.md`);
  
  await fs.writeFile(outputPath, reviewDoc);
  
  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Review document generated!\n');
  console.log(`💾 Saved to: ${outputPath}`);
  console.log(`\n📋 Next steps:`);
  console.log(`   1. Open the review document in your editor`);
  console.log(`   2. Review each file for accuracy`);
  console.log(`   3. Mark: Accurate / Needs Editing / Major Revision / Remove`);
  console.log(`   4. Provide corrections for files that need editing`);
  console.log(`   5. Add your signature and date`);
  console.log(`   6. Save as: existing-content-review-${dateStr}-approved.md`);
  console.log(`   7. Content agent will apply your corrections\n`);
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

