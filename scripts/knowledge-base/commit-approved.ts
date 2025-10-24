#!/usr/bin/env tsx
/**
 * Commit CEO-Approved Content
 * 
 * Commits ONLY CEO-approved sections to the knowledge base
 * Includes CEO approval metadata with each commit
 * 
 * Usage:
 *   npx tsx scripts/knowledge-base/commit-approved.ts <approved-review-file>
 * 
 * Example:
 *   npx tsx scripts/knowledge-base/commit-approved.ts staging/knowledge-base/ceo-review-2025-10-24-approved.md
 * 
 * Output:
 *   Commits to data/support/ directory
 *   Updates LlamaIndex knowledge base
 */

import { promises as fs } from "fs";
import { join } from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface ApprovedSection {
  sectionNumber: number;
  title: string;
  url: string;
  category: string;
  content: string;
  decision: 'approve' | 'reject' | 'edit';
  notes?: string;
  signature?: string;
  date?: string;
}

/**
 * Parse CEO review document to extract approved sections
 */
async function parseReviewDocument(filePath: string): Promise<ApprovedSection[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  const sections: ApprovedSection[] = [];
  
  // Split by section headers
  const sectionRegex = /## Section (\d+): (.+?)\n/g;
  const matches = [...content.matchAll(sectionRegex)];
  
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const sectionNumber = parseInt(match[1]);
    const title = match[2];
    
    // Extract section content (from this match to next match or end)
    const startIndex = match.index!;
    const endIndex = i < matches.length - 1 ? matches[i + 1].index! : content.length;
    const sectionContent = content.slice(startIndex, endIndex);
    
    // Extract metadata
    const urlMatch = sectionContent.match(/\*\*URL:\*\* (.+)/);
    const categoryMatch = sectionContent.match(/\*\*Category:\*\* (.+)/);
    const contentMatch = sectionContent.match(/```\n([\s\S]+?)\n```/);
    
    // Extract decision
    const approveMatch = sectionContent.match(/\[x\] Approve/i);
    const rejectMatch = sectionContent.match(/\[x\] Reject/i);
    const editMatch = sectionContent.match(/\[x\] Edit/i);
    
    let decision: 'approve' | 'reject' | 'edit' = 'reject';
    if (approveMatch) decision = 'approve';
    else if (editMatch) decision = 'edit';
    
    // Extract notes/edits
    const notesMatch = sectionContent.match(/\*\*Notes\/Edits:\*\*\n<!-- CEO: Add any notes or edits here -->\n([\s\S]+?)\n\n/);
    
    // Extract signature and date
    const signatureMatch = sectionContent.match(/\*\*Approval Signature:\*\* (.+)/);
    const dateMatch = sectionContent.match(/\*\*Date:\*\* (.+)/);
    
    if (decision === 'approve' || decision === 'edit') {
      sections.push({
        sectionNumber,
        title,
        url: urlMatch ? urlMatch[1].trim() : '',
        category: categoryMatch ? categoryMatch[1].trim() : '',
        content: contentMatch ? contentMatch[1].trim() : '',
        decision,
        notes: notesMatch ? notesMatch[1].trim() : undefined,
        signature: signatureMatch ? signatureMatch[1].trim() : undefined,
        date: dateMatch ? dateMatch[1].trim() : undefined,
      });
    }
  }
  
  return sections;
}

/**
 * Create filename from title
 */
function createFilename(title: string, category: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `${slug}.md`;
}

/**
 * Generate markdown content with CEO approval metadata
 */
function generateMarkdownContent(section: ApprovedSection): string {
  const header = `# ${section.title}

**Source:** ${section.url}  
**Category:** ${section.category}  
**CEO Approved:** ${section.date || new Date().toISOString().split('T')[0]}  
**Approved By:** ${section.signature || 'Justin (CEO)'}

---

`;

  const content = section.decision === 'edit' && section.notes
    ? section.notes
    : section.content;
  
  return header + content;
}

/**
 * Commit approved sections to knowledge base
 */
async function commitApprovedSections(sections: ApprovedSection[]) {
  const supportDir = join(process.cwd(), 'data', 'support');
  await fs.mkdir(supportDir, { recursive: true });
  
  console.log(`\n📁 Committing to: ${supportDir}\n`);
  
  const committedFiles: string[] = [];
  
  for (const section of sections) {
    const filename = createFilename(section.title, section.category);
    const filePath = join(supportDir, filename);
    const content = generateMarkdownContent(section);
    
    console.log(`   ✅ Section ${section.sectionNumber}: ${section.title}`);
    console.log(`      File: ${filename}`);
    console.log(`      Decision: ${section.decision}`);
    console.log(`      Size: ${content.length} characters`);
    
    await fs.writeFile(filePath, content);
    committedFiles.push(filePath);
  }
  
  return committedFiles;
}

/**
 * Rebuild LlamaIndex with new content
 */
async function rebuildIndex() {
  console.log(`\n🔄 Rebuilding LlamaIndex...`);
  
  try {
    const { stdout, stderr } = await execAsync('npx tsx scripts/rag/maintain-index.ts rebuild');
    console.log(stdout);
    if (stderr) console.error(stderr);
    console.log(`   ✅ Index rebuilt successfully`);
  } catch (error) {
    console.error(`   ⚠️  Index rebuild failed:`, (error as Error).message);
    console.error(`   You may need to rebuild manually:`);
    console.error(`   npx tsx scripts/rag/maintain-index.ts rebuild`);
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Error: No approved review file specified');
    console.error('\nUsage:');
    console.error('  npx tsx scripts/knowledge-base/commit-approved.ts <approved-review-file>');
    console.error('\nExample:');
    console.error('  npx tsx scripts/knowledge-base/commit-approved.ts staging/knowledge-base/ceo-review-2025-10-24-approved.md');
    process.exit(1);
  }
  
  const reviewFilePath = args[0];
  
  console.log('📝 Committing CEO-approved content\n');
  console.log('='.repeat(80));
  console.log(`\n📂 Reading: ${reviewFilePath}`);
  
  // Parse review document
  const approvedSections = await parseReviewDocument(reviewFilePath);
  
  console.log(`\n📊 Approval summary:`);
  console.log(`   Total approved sections: ${approvedSections.length}`);
  console.log(`   Approved: ${approvedSections.filter(s => s.decision === 'approve').length}`);
  console.log(`   Edited: ${approvedSections.filter(s => s.decision === 'edit').length}`);
  
  if (approvedSections.length === 0) {
    console.log('\n⚠️  No sections approved. Nothing to commit.');
    console.log('   Please review the document and mark sections with [x] Approve or [x] Edit');
    process.exit(0);
  }
  
  // Commit approved sections
  const committedFiles = await commitApprovedSections(approvedSections);
  
  // Rebuild index
  await rebuildIndex();
  
  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Commit complete!\n');
  console.log(`📊 Results:`);
  console.log(`   Files committed: ${committedFiles.length}`);
  console.log(`   Location: data/support/`);
  console.log(`\n📋 Next steps:`);
  console.log(`   1. Verify files in data/support/`);
  console.log(`   2. Test with sample queries`);
  console.log(`   3. Check LlamaIndex is working\n`);
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

