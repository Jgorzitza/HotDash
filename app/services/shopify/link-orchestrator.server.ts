/**
 * Internal Link Orchestrator
 * 
 * Automated contextual internal linking for Shopify content
 * Growth Spec D4: Build internal link graph, improve site structure
 * 
 * @owner integrations
 * @task P1 Task 5
 */

import type { Action, ActionOutcome } from '~/types/action';

interface LinkCandidate {
  sourcePageId: string;
  sourcePageHandle: string;
  targetPageHandle: string;
  targetPageUrl: string;
  anchorText: string;
  relevanceScore: number; // 0-1
  contextSnippet: string; // Where to insert link
}

interface LinkGraphNode {
  pageId: string;
  handle: string;
  title: string;
  outboundLinks: string[]; // Handles of linked pages
  inboundLinks: string[]; // Handles of pages linking to this
  authority: number; // Calculated from link graph
}

/**
 * Calculate content relevance between two pages
 */
export function calculateRelevance(sourceContent: string, targetContent: string, targetTitle: string): number {
  // Strip HTML
  const cleanSource = sourceContent.replace(/<[^>]*>/g, '').toLowerCase();
  const cleanTarget = targetContent.replace(/<[^>]*>/g, '').toLowerCase();
  const cleanTitle = targetTitle.toLowerCase();

  // Extract keywords
  const sourceWords = new Set(cleanSource.split(/\s+/).filter(w => w.length > 3));
  const targetWords = new Set(cleanTarget.split(/\s+/).filter(w => w.length > 3));
  const titleWords = new Set(cleanTitle.split(/\s+/).filter(w => w.length > 3));

  // Calculate overlap
  const titleOverlap = [...sourceWords].filter(w => titleWords.has(w)).length / titleWords.size;
  const contentOverlap = [...sourceWords].filter(w => targetWords.has(w)).length / Math.max(sourceWords.size, 1);

  // Weighted score (title more important)
  return (titleOverlap * 0.7) + (contentOverlap * 0.3);
}

/**
 * Find optimal placement for link in content
 */
export function findLinkPlacement(content: string, anchorText: string): { position: number; context: string } | null {
  // Strip HTML for analysis
  const textOnly = content.replace(/<[^>]*>/g, '');
  
  // Find anchor text or similar phrase
  const anchorLower = anchorText.toLowerCase();
  const textLower = textOnly.toLowerCase();
  
  let position = textLower.indexOf(anchorLower);
  
  if (position === -1) {
    // Try to find partial match
    const words = anchorLower.split(/\s+/);
    for (const word of words) {
      position = textLower.indexOf(word);
      if (position !== -1) break;
    }
  }

  if (position === -1) {
    return null; // No good placement found
  }

  // Extract context (50 chars before and after)
  const contextStart = Math.max(0, position - 50);
  const contextEnd = Math.min(textOnly.length, position + anchorText.length + 50);
  const context = textOnly.substring(contextStart, contextEnd);

  return { position, context };
}

/**
 * Generate link candidates for a source page
 */
export async function generateLinkCandidates(
  sourcePage: { id: string; handle: string; body: string },
  targetPages: Array<{ id: string; handle: string; title: string; body: string }>
): Promise<LinkCandidate[]> {
  const candidates: LinkCandidate[] = [];

  for (const target of targetPages) {
    // Don't link to self
    if (target.handle === sourcePage.handle) continue;

    // Calculate relevance
    const relevance = calculateRelevance(sourcePage.body, target.body, target.title);

    // Only consider if relevance > 0.3
    if (relevance < 0.3) continue;

    // Find placement
    const placement = findLinkPlacement(sourcePage.body, target.title);
    if (!placement) continue;

    candidates.push({
      sourcePageId: sourcePage.id,
      sourcePageHandle: sourcePage.handle,
      targetPageHandle: target.handle,
      targetPageUrl: `/pages/${target.handle}`,
      anchorText: target.title,
      relevanceScore: relevance,
      contextSnippet: placement.context
    });
  }

  // Sort by relevance, return top 5
  return candidates
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);
}

/**
 * Inject link into HTML content
 */
export function injectLink(html: string, anchorText: string, targetUrl: string): string {
  // Find first occurrence of anchor text (not already linked)
  const linkPattern = new RegExp(`(?<!<a[^>]*>)${anchorText}(?![^<]*<\/a>)`, 'i');
  
  if (linkPattern.test(html)) {
    return html.replace(
      linkPattern,
      `<a href="${targetUrl}">${anchorText}</a>`
    );
  }

  return html; // No match found, return unchanged
}

/**
 * Build internal link graph for site structure analysis
 */
export class LinkGraph {
  private nodes = new Map<string, LinkGraphNode>();

  addPage(page: { id: string; handle: string; title: string; body: string }) {
    // Extract outbound links from page
    const linkRegex = /href="\/pages\/([^"]+)"/g;
    const outboundLinks: string[] = [];
    let match;

    while ((match = linkRegex.exec(page.body)) !== null) {
      outboundLinks.push(match[1]);
    }

    this.nodes.set(page.handle, {
      pageId: page.id,
      handle: page.handle,
      title: page.title,
      outboundLinks,
      inboundLinks: [],
      authority: 0
    });
  }

  /**
   * Calculate inbound links for all nodes
   */
  calculateInboundLinks() {
    // Reset inbound links
    this.nodes.forEach(node => node.inboundLinks = []);

    // Calculate inbound from outbound
    this.nodes.forEach((node, handle) => {
      node.outboundLinks.forEach(targetHandle => {
        const targetNode = this.nodes.get(targetHandle);
        if (targetNode) {
          targetNode.inboundLinks.push(handle);
        }
      });
    });
  }

  /**
   * Calculate page authority (simplified PageRank)
   */
  calculateAuthority(iterations = 10) {
    const dampingFactor = 0.85;
    const nodeCount = this.nodes.size;

    // Initialize all nodes with equal authority
    this.nodes.forEach(node => node.authority = 1 / nodeCount);

    // Iterative authority calculation
    for (let i = 0; i < iterations; i++) {
      const newAuthorities = new Map<string, number>();

      this.nodes.forEach((node, handle) => {
        let authority = (1 - dampingFactor) / nodeCount;

        // Add authority from inbound links
        node.inboundLinks.forEach(inboundHandle => {
          const inboundNode = this.nodes.get(inboundHandle);
          if (inboundNode) {
            authority += dampingFactor * (inboundNode.authority / inboundNode.outboundLinks.length);
          }
        });

        newAuthorities.set(handle, authority);
      });

      // Update authorities
      newAuthorities.forEach((authority, handle) => {
        const node = this.nodes.get(handle);
        if (node) node.authority = authority;
      });
    }
  }

  /**
   * Get high authority pages (good link sources)
   */
  getHighAuthorityPages(count = 10): LinkGraphNode[] {
    return Array.from(this.nodes.values())
      .sort((a, b) => b.authority - a.authority)
      .slice(0, count);
  }

  /**
   * Get orphan pages (no inbound links)
   */
  getOrphanPages(): LinkGraphNode[] {
    return Array.from(this.nodes.values())
      .filter(node => node.inboundLinks.length === 0);
  }

  /**
   * Export graph for visualization
   */
  exportGraph(): { nodes: LinkGraphNode[]; stats: any } {
    const nodes = Array.from(this.nodes.values());
    
    return {
      nodes,
      stats: {
        totalPages: nodes.length,
        totalLinks: nodes.reduce((sum, n) => sum + n.outboundLinks.length, 0),
        avgLinksPerPage: nodes.reduce((sum, n) => sum + n.outboundLinks.length, 0) / nodes.length,
        orphanPages: this.getOrphanPages().length,
        highAuthorityPages: this.getHighAuthorityPages(5).map(n => ({
          handle: n.handle,
          authority: n.authority.toFixed(4)
        }))
      }
    };
  }
}

/**
 * Internal Link Orchestrator Executor
 * Implements ActionExecutor interface
 */
export class LinkOrchestratorExecutor {
  async execute(action: Action): Promise<ActionOutcome> {
    const payload = action.payload as {
      sourcePageId: string;
      sourcePageHandle: string;
      sourceBody: string;
      targetPages: Array<{ id: string; handle: string; title: string; body: string }>;
      maxLinks?: number;
    };

    try {
      // 1. Generate link candidates
      const candidates = await generateLinkCandidates(
        {
          id: payload.sourcePageId,
          handle: payload.sourcePageHandle,
          body: payload.sourceBody
        },
        payload.targetPages
      );

      // 2. Limit to maxLinks (default 5)
      const maxLinks = payload.maxLinks || 5;
      const selectedCandidates = candidates.slice(0, maxLinks);

      // 3. Inject links into content
      let updatedBody = payload.sourceBody;
      for (const candidate of selectedCandidates) {
        updatedBody = injectLink(updatedBody, candidate.anchorText, candidate.targetPageUrl);
      }

      return {
        success: true,
        message: `Added ${selectedCandidates.length} internal links`,
        data: {
          sourcePageId: payload.sourcePageId,
          linksAdded: selectedCandidates.length,
          links: selectedCandidates.map(c => ({
            target: c.targetPageHandle,
            anchorText: c.anchorText,
            relevance: c.relevanceScore
          })),
          updatedBody
        }
      };
    } catch (error) {
      console.error('[LinkOrchestrator] Execution error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: { error: String(error) }
      };
    }
  }

  async rollback(action: Action): Promise<void> {
    // Remove added links (would restore original content)
    console.log('[LinkOrchestrator] Rollback: Remove added links');
  }
}

/**
 * Example: Build link graph and add contextual links
 */
export async function exampleLinkOrchestration() {
  // 1. Build link graph
  const graph = new LinkGraph();
  
  // Add pages to graph (mock data)
  const pages = [
    {
      id: 'page-1',
      handle: 'an-fitting-guide',
      title: 'AN Fitting Installation Guide',
      body: '<p>Learn about AN fittings...</p>'
    },
    {
      id: 'page-2',
      handle: 'fuel-system-basics',
      title: 'Fuel System Basics',
      body: '<p>AN fittings are essential for fuel systems...</p>'
    }
  ];

  pages.forEach(page => graph.addPage(page));
  graph.calculateInboundLinks();
  graph.calculateAuthority();

  // 2. Get recommendations
  const orphans = graph.getOrphanPages();
  console.log('Orphan pages needing links:', orphans.map(p => p.handle));

  // 3. Generate links
  const executor = new LinkOrchestratorExecutor();
  // Implementation continues...
}

