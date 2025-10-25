/**
 * Content Management Service
 *
 * Provides comprehensive content management functionality including:
 * - Content creation and editing
 * - Publishing workflow
 * - Content versioning
 * - Content approval process
 * - Content type management
 */
export interface ContentType {
    id: string;
    name: string;
    description?: string;
    fields: ContentField[];
    created_at: string;
    updated_at: string;
}
export interface ContentField {
    id: string;
    name: string;
    type: 'text' | 'textarea' | 'rich_text' | 'number' | 'boolean' | 'date' | 'image' | 'file';
    required: boolean;
    localized: boolean;
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
    };
}
export interface ContentEntry {
    id: string;
    content_type_id: string;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    version: number;
    fields: Record<string, any>;
    created_at: string;
    updated_at: string;
    published_at?: string;
    created_by: string;
    updated_by: string;
    published_by?: string;
}
export interface ContentEntryCreateInput {
    content_type_id: string;
    title: string;
    slug: string;
    fields: Record<string, any>;
    created_by: string;
}
export interface ContentEntryUpdateInput {
    title?: string;
    slug?: string;
    fields?: Record<string, any>;
    status?: 'draft' | 'published' | 'archived';
    updated_by: string;
}
export declare class ContentService {
    /**
     * Create a new content type
     */
    static createContentType(input: {
        name: string;
        description?: string;
        fields: ContentField[];
    }): Promise<ContentType>;
    /**
     * Get all content types
     */
    static getContentTypes(): Promise<ContentType[]>;
    /**
     * Get content type by ID
     */
    static getContentTypeById(id: string): Promise<ContentType | null>;
    /**
     * Create a new content entry
     */
    static createContentEntry(input: ContentEntryCreateInput): Promise<ContentEntry>;
    /**
     * Get content entries with filtering and pagination
     */
    static getContentEntries(options?: {
        content_type_id?: string;
        status?: string;
        limit?: number;
        offset?: number;
        search?: string;
    }): Promise<{
        entries: ContentEntry[];
        total: number;
    }>;
    /**
     * Get content entry by ID
     */
    static getContentEntryById(id: string): Promise<ContentEntry | null>;
    /**
     * Update content entry
     */
    static updateContentEntry(id: string, input: ContentEntryUpdateInput): Promise<ContentEntry>;
    /**
     * Delete content entry
     */
    static deleteContentEntry(id: string): Promise<void>;
    /**
     * Publish content entry
     */
    static publishContentEntry(id: string, published_by: string): Promise<ContentEntry>;
    /**
     * Get content entry versions
     */
    static getContentEntryVersions(id: string): Promise<ContentEntry[]>;
    /**
     * Get content statistics
     */
    static getContentStats(): Promise<{
        total_entries: number;
        published_entries: number;
        draft_entries: number;
        archived_entries: number;
        total_content_types: number;
    }>;
    /**
     * Map database row to ContentType
     */
    private static mapDbRowToContentType;
    /**
     * Map database row to ContentEntry
     */
    private static mapDbRowToContentEntry;
}
//# sourceMappingURL=content.service.d.ts.map