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

import prisma from "~/prisma.server";

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

export class ContentService {
  /**
   * Create a new content type
   */
  static async createContentType(input: {
    name: string;
    description?: string;
    fields: ContentField[];
  }): Promise<ContentType> {
    try {
      const query = `
        INSERT INTO content_types (name, description, fields)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      
      const params = [
        input.name,
        input.description || null,
        JSON.stringify(input.fields)
      ];
      
      const { rows } = await prisma.query(query, params);
      return this.mapDbRowToContentType(rows[0]);
    } catch (error) {
      console.error('Error creating content type:', error);
      throw new Error('Failed to create content type');
    }
  }

  /**
   * Get all content types
   */
  static async getContentTypes(): Promise<ContentType[]> {
    try {
      const { rows } = await prisma.query(
        'SELECT * FROM content_types ORDER BY created_at DESC'
      );
      return rows.map(row => this.mapDbRowToContentType(row));
    } catch (error) {
      console.error('Error fetching content types:', error);
      throw new Error('Failed to fetch content types');
    }
  }

  /**
   * Get content type by ID
   */
  static async getContentTypeById(id: string): Promise<ContentType | null> {
    try {
      const { rows } = await prisma.query(
        'SELECT * FROM content_types WHERE id = $1',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapDbRowToContentType(rows[0]);
    } catch (error) {
      console.error('Error fetching content type:', error);
      throw new Error('Failed to fetch content type');
    }
  }

  /**
   * Create a new content entry
   */
  static async createContentEntry(input: ContentEntryCreateInput): Promise<ContentEntry> {
    try {
      const query = `
        INSERT INTO content_entries (
          content_type_id, title, slug, fields, status, version,
          created_by, updated_by
        ) VALUES ($1, $2, $3, $4, 'draft', 1, $5, $5)
        RETURNING *
      `;
      
      const params = [
        input.content_type_id,
        input.title,
        input.slug,
        JSON.stringify(input.fields),
        input.created_by
      ];
      
      const { rows } = await prisma.query(query, params);
      return this.mapDbRowToContentEntry(rows[0]);
    } catch (error) {
      console.error('Error creating content entry:', error);
      throw new Error('Failed to create content entry');
    }
  }

  /**
   * Get content entries with filtering and pagination
   */
  static async getContentEntries(options: {
    content_type_id?: string;
    status?: string;
    limit?: number;
    offset?: number;
    search?: string;
  } = {}): Promise<{ entries: ContentEntry[]; total: number }> {
    try {
      const {
        content_type_id,
        status,
        limit = 20,
        offset = 0,
        search
      } = options;

      let query = `
        SELECT ce.*, ct.name as content_type_name
        FROM content_entries ce
        JOIN content_types ct ON ce.content_type_id = ct.id
        WHERE 1=1
      `;
      
      const params: any[] = [];
      let paramIndex = 1;
      
      if (content_type_id) {
        query += ` AND ce.content_type_id = $${paramIndex}`;
        params.push(content_type_id);
        paramIndex++;
      }
      
      if (status) {
        query += ` AND ce.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }
      
      if (search) {
        query += ` AND (ce.title ILIKE $${paramIndex} OR ce.slug ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }
      
      // Get total count
      const countQuery = query.replace('SELECT ce.*, ct.name as content_type_name', 'SELECT COUNT(*)');
      const { rows: countRows } = await prisma.query(countQuery, params);
      const total = parseInt(countRows[0].count);
      
      // Get paginated results
      query += ` ORDER BY ce.updated_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);
      
      const { rows } = await prisma.query(query, params);
      return {
        entries: rows.map(row => this.mapDbRowToContentEntry(row)),
        total
      };
    } catch (error) {
      console.error('Error fetching content entries:', error);
      throw new Error('Failed to fetch content entries');
    }
  }

  /**
   * Get content entry by ID
   */
  static async getContentEntryById(id: string): Promise<ContentEntry | null> {
    try {
      const { rows } = await prisma.query(
        'SELECT * FROM content_entries WHERE id = $1',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapDbRowToContentEntry(rows[0]);
    } catch (error) {
      console.error('Error fetching content entry:', error);
      throw new Error('Failed to fetch content entry');
    }
  }

  /**
   * Update content entry
   */
  static async updateContentEntry(id: string, input: ContentEntryUpdateInput): Promise<ContentEntry> {
    try {
      const updateFields: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (input.title !== undefined) {
        updateFields.push(`title = $${paramIndex}`);
        params.push(input.title);
        paramIndex++;
      }

      if (input.slug !== undefined) {
        updateFields.push(`slug = $${paramIndex}`);
        params.push(input.slug);
        paramIndex++;
      }

      if (input.fields !== undefined) {
        updateFields.push(`fields = $${paramIndex}`);
        params.push(JSON.stringify(input.fields));
        paramIndex++;
      }

      if (input.status !== undefined) {
        updateFields.push(`status = $${paramIndex}`);
        params.push(input.status);
        paramIndex++;
        
        if (input.status === 'published') {
          updateFields.push(`published_at = NOW(), published_by = $${paramIndex}`);
          params.push(input.updated_by);
          paramIndex++;
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateFields.push(`updated_at = NOW(), updated_by = $${paramIndex}, version = version + 1`);
      params.push(input.updated_by);
      paramIndex++;
      params.push(id);

      const query = `
        UPDATE content_entries 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const { rows } = await prisma.query(query, params);
      
      if (rows.length === 0) {
        throw new Error('Content entry not found');
      }

      return this.mapDbRowToContentEntry(rows[0]);
    } catch (error) {
      console.error('Error updating content entry:', error);
      throw new Error('Failed to update content entry');
    }
  }

  /**
   * Delete content entry
   */
  static async deleteContentEntry(id: string): Promise<void> {
    try {
      const { rows } = await prisma.query(
        'DELETE FROM content_entries WHERE id = $1 RETURNING id',
        [id]
      );
      
      if (rows.length === 0) {
        throw new Error('Content entry not found');
      }
    } catch (error) {
      console.error('Error deleting content entry:', error);
      throw new Error('Failed to delete content entry');
    }
  }

  /**
   * Publish content entry
   */
  static async publishContentEntry(id: string, published_by: string): Promise<ContentEntry> {
    return this.updateContentEntry(id, {
      status: 'published',
      updated_by: published_by
    });
  }

  /**
   * Get content entry versions
   */
  static async getContentEntryVersions(id: string): Promise<ContentEntry[]> {
    try {
      const { rows } = await prisma.query(
        'SELECT * FROM content_entry_versions WHERE content_entry_id = $1 ORDER BY version DESC',
        [id]
      );
      return rows.map(row => this.mapDbRowToContentEntry(row));
    } catch (error) {
      console.error('Error fetching content entry versions:', error);
      throw new Error('Failed to fetch content entry versions');
    }
  }

  /**
   * Get content statistics
   */
  static async getContentStats(): Promise<{
    total_entries: number;
    published_entries: number;
    draft_entries: number;
    archived_entries: number;
    total_content_types: number;
  }> {
    try {
      const { rows } = await prisma.query(`
        SELECT 
          (SELECT COUNT(*) FROM content_entries) as total_entries,
          (SELECT COUNT(*) FROM content_entries WHERE status = 'published') as published_entries,
          (SELECT COUNT(*) FROM content_entries WHERE status = 'draft') as draft_entries,
          (SELECT COUNT(*) FROM content_entries WHERE status = 'archived') as archived_entries,
          (SELECT COUNT(*) FROM content_types) as total_content_types
      `);

      return {
        total_entries: parseInt(rows[0].total_entries),
        published_entries: parseInt(rows[0].published_entries),
        draft_entries: parseInt(rows[0].draft_entries),
        archived_entries: parseInt(rows[0].archived_entries),
        total_content_types: parseInt(rows[0].total_content_types)
      };
    } catch (error) {
      console.error('Error fetching content stats:', error);
      throw new Error('Failed to fetch content stats');
    }
  }

  /**
   * Map database row to ContentType
   */
  private static mapDbRowToContentType(row: any): ContentType {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      fields: typeof row.fields === 'string' ? JSON.parse(row.fields) : row.fields,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  /**
   * Map database row to ContentEntry
   */
  private static mapDbRowToContentEntry(row: any): ContentEntry {
    return {
      id: row.id,
      content_type_id: row.content_type_id,
      title: row.title,
      slug: row.slug,
      status: row.status,
      version: row.version,
      fields: typeof row.fields === 'string' ? JSON.parse(row.fields) : row.fields,
      created_at: row.created_at,
      updated_at: row.updated_at,
      published_at: row.published_at,
      created_by: row.created_by,
      updated_by: row.updated_by,
      published_by: row.published_by
    };
  }
}
