/**
 * Knowledge Base Administration Service
 * AI-KNOWLEDGE-013: KB Management API
 *
 * Provides admin functions for managing knowledge base documents
 * Admin-only access (enforced by route middleware)
 *
 * @module app/services/rag/kb-admin
 */

import { buildIndex } from "../../../scripts/rag/build-index";
import fs from "node:fs/promises";
import path from "node:path";

const PROJECT_ROOT = path.resolve(process.cwd());
const SUPPORT_DIR = path.join(PROJECT_ROOT, "data/support");

export interface DocumentMetadata {
  fileName: string;
  category: string;
  priority: string;
  size: number;
  lastModified: Date;
}

export interface AddDocumentResult {
  success: boolean;
  fileName: string;
  category?: string;
  error?: string;
}

export interface UpdateDocumentResult {
  success: boolean;
  fileName: string;
  reindexed: boolean;
  error?: string;
}

/**
 * List all documents in knowledge base
 */
export async function listDocuments(): Promise<DocumentMetadata[]> {
  try {
    const files = await fs.readdir(SUPPORT_DIR);
    const mdFiles = files.filter(f => f.endsWith(".md"));

    const documents: DocumentMetadata[] = [];

    for (const fileName of mdFiles) {
      const filePath = path.join(SUPPORT_DIR, fileName);
      const stats = await fs.stat(filePath);
      const content = await fs.readFile(filePath, "utf-8");

      // Determine category from filename
      const category = getCategoryFromFilename(fileName);
      const priority = getPriorityFromFilename(fileName);

      documents.push({
        fileName,
        category,
        priority,
        size: content.length,
        lastModified: stats.mtime,
      });
    }

    return documents.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  } catch (error) {
    console.error("Error listing documents:", error);
    return [];
  }
}

/**
 * Add new document to knowledge base
 */
export async function addDocument(
  fileName: string,
  content: string,
  autoReindex: boolean = true,
): Promise<AddDocumentResult> {
  try {
    // Validate filename
    if (!fileName.endsWith(".md")) {
      return {
        success: false,
        fileName,
        error: "File must be a markdown (.md) file",
      };
    }

    const filePath = path.join(SUPPORT_DIR, fileName);

    // Check if file already exists
    try {
      await fs.access(filePath);
      return {
        success: false,
        fileName,
        error: "File already exists - use updateDocument instead",
      };
    } catch {
      // File doesn't exist, proceed
    }

    // Write document
    await fs.writeFile(filePath, content, "utf-8");

    // Rebuild index if requested
    if (autoReindex) {
      await buildIndex();
    }

    const category = getCategoryFromFilename(fileName);

    return {
      success: true,
      fileName,
      category,
    };
  } catch (error) {
    return {
      success: false,
      fileName,
      error: (error as Error).message,
    };
  }
}

/**
 * Update existing document
 */
export async function updateDocument(
  fileName: string,
  content: string,
  autoReindex: boolean = true,
): Promise<UpdateDocumentResult> {
  try {
    const filePath = path.join(SUPPORT_DIR, fileName);

    // Verify file exists
    await fs.access(filePath);

    // Update document
    await fs.writeFile(filePath, content, "utf-8");

    // Rebuild index if requested
    let reindexed = false;
    if (autoReindex) {
      await buildIndex();
      reindexed = true;
    }

    return {
      success: true,
      fileName,
      reindexed,
    };
  } catch (error) {
    return {
      success: false,
      fileName,
      reindexed: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Delete document from knowledge base
 */
export async function deleteDocument(
  fileName: string,
  autoReindex: boolean = true,
): Promise<UpdateDocumentResult> {
  try {
    const filePath = path.join(SUPPORT_DIR, fileName);

    // Delete file
    await fs.unlink(filePath);

    // Rebuild index if requested
    let reindexed = false;
    if (autoReindex) {
      await buildIndex();
      reindexed = true;
    }

    return {
      success: true,
      fileName,
      reindexed,
    };
  } catch (error) {
    return {
      success: false,
      fileName,
      reindexed: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Determine category from filename
 */
function getCategoryFromFilename(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.includes("refund") || lower.includes("return")) return "returns";
  if (lower.includes("shipping")) return "shipping";
  if (lower.includes("tracking") || lower.includes("order")) return "tracking";
  if (lower.includes("exchange")) return "exchanges";
  if (lower.includes("faq") || lower.includes("question")) return "faq";
  if (lower.includes("troubleshoot") || lower.includes("product")) return "troubleshooting";
  return "general";
}

/**
 * Determine priority from filename
 */
function getPriorityFromFilename(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.includes("refund") || lower.includes("shipping") || lower.includes("faq")) {
    return "high";
  }
  if (lower.includes("exchange") || lower.includes("tracking") || lower.includes("order")) {
    return "medium";
  }
  return "low";
}

