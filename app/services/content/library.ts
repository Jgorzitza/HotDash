/**
 * Content Library - Reusable Snippets
 * 
 * Store and manage reusable content snippets:
 * - Brand taglines
 * - Call-to-actions
 * - Product descriptions
 * - Common phrases
 */

import type { SocialPlatform } from '../../lib/content/tracking';

// ============================================================================
// Types
// ============================================================================

export interface ContentSnippet {
  id: string;
  type: 'tagline' | 'cta' | 'description' | 'phrase' | 'disclaimer';
  title: string;
  content: string;
  platforms: SocialPlatform[];
  category?: string;
  tags: string[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Pre-defined Snippets
// ============================================================================

const BRAND_SNIPPETS: ContentSnippet[] = [
  {
    id: 'tagline_1',
    type: 'tagline',
    title: 'Main Tagline',
    content: 'Quality products for your lifestyle',
    platforms: ['instagram', 'facebook', 'tiktok'],
    tags: ['brand', 'tagline'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const CTA_SNIPPETS: ContentSnippet[] = [
  {
    id: 'cta_shop',
    type: 'cta',
    title: 'Shop Now',
    content: 'Shop now at hotrodan.com',
    platforms: ['instagram', 'facebook', 'tiktok'],
    tags: ['cta', 'shop'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cta_link',
    type: 'cta',
    title: 'Link in Bio',
    content: 'Link in bio 👆',
    platforms: ['instagram', 'tiktok'],
    tags: ['cta', 'link'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cta_save',
    type: 'cta',
    title: 'Save for Later',
    content: 'Save this for later! 📌',
    platforms: ['instagram', 'tiktok'],
    tags: ['cta', 'save'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DISCLAIMER_SNIPPETS: ContentSnippet[] = [
  {
    id: 'disclaimer_ad',
    type: 'disclaimer',
    title: 'Sponsored Post',
    content: '#ad #sponsored',
    platforms: ['instagram', 'facebook', 'tiktok'],
    tags: ['disclaimer', 'ftc'],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ============================================================================
// Library Functions
// ============================================================================

/**
 * Get all snippets
 */
export async function getAllSnippets(): Promise<ContentSnippet[]> {
  // TODO: Fetch from Supabase
  return [...BRAND_SNIPPETS, ...CTA_SNIPPETS, ...DISCLAIMER_SNIPPETS];
}

/**
 * Get snippets by type
 */
export async function getSnippetsByType(
  type: ContentSnippet['type']
): Promise<ContentSnippet[]> {
  const all = await getAllSnippets();
  return all.filter(s => s.type === type);
}

/**
 * Get snippets by platform
 */
export async function getSnippetsByPlatform(
  platform: SocialPlatform
): Promise<ContentSnippet[]> {
  const all = await getAllSnippets();
  return all.filter(s => s.platforms.includes(platform));
}

/**
 * Search snippets
 */
export async function searchSnippets(query: string): Promise<ContentSnippet[]> {
  const all = await getAllSnippets();
  const lowerQuery = query.toLowerCase();
  
  return all.filter(s =>
    s.title.toLowerCase().includes(lowerQuery) ||
    s.content.toLowerCase().includes(lowerQuery) ||
    s.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get snippet by ID
 */
export async function getSnippetById(id: string): Promise<ContentSnippet | null> {
  const all = await getAllSnippets();
  return all.find(s => s.id === id) || null;
}

/**
 * Create new snippet
 */
export async function createSnippet(
  snippet: Omit<ContentSnippet, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>
): Promise<ContentSnippet> {
  const newSnippet: ContentSnippet = {
    ...snippet,
    id: generateId(),
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // TODO: Save to Supabase

  return newSnippet;
}

/**
 * Update snippet
 */
export async function updateSnippet(
  id: string,
  updates: Partial<ContentSnippet>
): Promise<ContentSnippet> {
  // TODO: Update in Supabase
  
  const snippet = await getSnippetById(id);
  if (!snippet) {
    throw new Error('Snippet not found');
  }

  return {
    ...snippet,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Delete snippet
 */
export async function deleteSnippet(id: string): Promise<void> {
  // TODO: Delete from Supabase
}

/**
 * Increment usage count
 */
export async function incrementUsage(id: string): Promise<void> {
  const snippet = await getSnippetById(id);
  if (snippet) {
    await updateSnippet(id, {
      usageCount: snippet.usageCount + 1,
    });
  }
}

/**
 * Get most used snippets
 */
export async function getMostUsedSnippets(limit: number = 10): Promise<ContentSnippet[]> {
  const all = await getAllSnippets();
  return all
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit);
}

/**
 * Get recommended snippets for content
 */
export async function getRecommendedSnippets(
  content: string,
  platform: SocialPlatform
): Promise<ContentSnippet[]> {
  const platformSnippets = await getSnippetsByPlatform(platform);
  
  // Recommend CTAs if content doesn't have one
  if (!content.toLowerCase().includes('shop') && !content.toLowerCase().includes('link')) {
    return platformSnippets.filter(s => s.type === 'cta');
  }

  return [];
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateId(): string {
  return `snippet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

