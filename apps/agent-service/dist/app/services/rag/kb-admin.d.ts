/**
 * Knowledge Base Administration Service
 * AI-KNOWLEDGE-013: KB Management API
 *
 * Provides admin functions for managing knowledge base documents
 * Admin-only access (enforced by route middleware)
 *
 * @module app/services/rag/kb-admin
 */
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
export declare function listDocuments(): Promise<DocumentMetadata[]>;
/**
 * Add new document to knowledge base
 */
export declare function addDocument(fileName: string, content: string, autoReindex?: boolean): Promise<AddDocumentResult>;
/**
 * Update existing document
 */
export declare function updateDocument(fileName: string, content: string, autoReindex?: boolean): Promise<UpdateDocumentResult>;
/**
 * Delete document from knowledge base
 */
export declare function deleteDocument(fileName: string, autoReindex?: boolean): Promise<UpdateDocumentResult>;
//# sourceMappingURL=kb-admin.d.ts.map