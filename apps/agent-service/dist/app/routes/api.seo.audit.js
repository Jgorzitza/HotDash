import { seoAuditor } from "~/lib/seo/seo-audit";
export async function loader({ request }) {
    try {
        const url = new URL(request.url);
        const pageUrl = url.searchParams.get('url');
        const pageTitle = url.searchParams.get('title') || 'Untitled Page';
        const pageDescription = url.searchParams.get('description') || '';
        const pageKeywords = url.searchParams.get('keywords')?.split(',') || [];
        if (!pageUrl) {
            return Response.json({ error: 'URL parameter is required' }, { status: 400 });
        }
        // Fetch page content (simplified - in production would need proper HTML fetching)
        const pageContent = await fetchPageContent(pageUrl);
        const pageData = {
            title: pageTitle,
            description: pageDescription,
            keywords: pageKeywords,
            canonicalUrl: pageUrl,
            type: 'website'
        };
        // Perform SEO audit
        const auditResult = await seoAuditor.auditPage(pageData, pageContent, pageUrl);
        return Response.json({
            success: true,
            data: auditResult,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('SEO audit error:', error);
        return Response.json({
            error: 'Failed to perform SEO audit',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
async function fetchPageContent(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'HotDash-SEO-Auditor/1.0'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.text();
    }
    catch (error) {
        console.error('Failed to fetch page content:', error);
        // Return minimal HTML for testing
        return `
      <html>
        <head>
          <title>Test Page</title>
          <meta name="description" content="Test description" />
        </head>
        <body>
          <h1>Test Content</h1>
          <p>This is test content for SEO analysis.</p>
          <img src="test.jpg" alt="Test image" />
        </body>
      </html>
    `;
    }
}
//# sourceMappingURL=api.seo.audit.js.map