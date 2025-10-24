/**
 * SEO Audit Service
 *
 * Comprehensive SEO auditing capabilities including:
 * - Page-level SEO analysis
 * - Site-wide SEO health checks
 * - Performance optimization recommendations
 * - Technical SEO validation
 */
export class SEOAuditor {
    /**
     * Perform comprehensive SEO audit on a page
     */
    async auditPage(pageData, htmlContent, url) {
        const issues = [];
        const recommendations = [];
        // Content analysis
        const contentScore = this.analyzeContent(pageData, htmlContent, issues, recommendations);
        // Technical SEO analysis
        const technicalScore = this.analyzeTechnicalSEO(htmlContent, url, issues, recommendations);
        // Performance analysis (simulated - would need real performance data)
        const performanceScore = this.analyzePerformance(htmlContent, issues, recommendations);
        // Accessibility analysis
        const accessibilityScore = this.analyzeAccessibility(htmlContent, issues, recommendations);
        const overallScore = Math.round((contentScore + technicalScore + performanceScore + accessibilityScore) / 4);
        return {
            overallScore,
            categoryScores: {
                content: contentScore,
                technical: technicalScore,
                performance: performanceScore,
                accessibility: accessibilityScore
            },
            issues,
            recommendations,
            metrics: await this.generateMetrics(htmlContent)
        };
    }
    analyzeContent(pageData, htmlContent, issues, recommendations) {
        let score = 100;
        // Title analysis
        if (!pageData.title || pageData.title.length === 0) {
            issues.push({
                type: 'error',
                category: 'content',
                message: 'Missing page title',
                impact: 'high',
                fixable: true,
                suggestion: 'Add a descriptive title tag'
            });
            score -= 30;
        }
        else if (pageData.title.length < 30) {
            issues.push({
                type: 'warning',
                category: 'content',
                message: 'Title is too short (less than 30 characters)',
                impact: 'medium',
                fixable: true,
                suggestion: 'Expand title to 30-60 characters'
            });
            score -= 10;
        }
        else if (pageData.title.length > 60) {
            issues.push({
                type: 'warning',
                category: 'content',
                message: 'Title is too long (more than 60 characters)',
                impact: 'medium',
                fixable: true,
                suggestion: 'Shorten title to under 60 characters'
            });
            score -= 5;
        }
        // Description analysis
        if (!pageData.description || pageData.description.length === 0) {
            issues.push({
                type: 'error',
                category: 'content',
                message: 'Missing meta description',
                impact: 'high',
                fixable: true,
                suggestion: 'Add a compelling meta description'
            });
            score -= 25;
        }
        else if (pageData.description.length < 120) {
            issues.push({
                type: 'warning',
                category: 'content',
                message: 'Description is too short (less than 120 characters)',
                impact: 'medium',
                fixable: true,
                suggestion: 'Expand description to 120-160 characters'
            });
            score -= 10;
        }
        else if (pageData.description.length > 160) {
            issues.push({
                type: 'warning',
                category: 'content',
                message: 'Description is too long (more than 160 characters)',
                impact: 'medium',
                fixable: true,
                suggestion: 'Shorten description to under 160 characters'
            });
            score -= 5;
        }
        // Heading structure analysis
        const h1Count = (htmlContent.match(/<h1[^>]*>/gi) || []).length;
        const h2Count = (htmlContent.match(/<h2[^>]*>/gi) || []).length;
        if (h1Count === 0) {
            issues.push({
                type: 'error',
                category: 'content',
                message: 'Missing H1 tag',
                impact: 'high',
                fixable: true,
                suggestion: 'Add a single H1 tag to the page'
            });
            score -= 20;
        }
        else if (h1Count > 1) {
            issues.push({
                type: 'warning',
                category: 'content',
                message: 'Multiple H1 tags found',
                impact: 'medium',
                fixable: true,
                suggestion: 'Use only one H1 tag per page'
            });
            score -= 10;
        }
        if (h2Count === 0) {
            recommendations.push({
                category: 'content',
                priority: 'medium',
                title: 'Add H2 headings',
                description: 'Use H2 tags to structure your content',
                implementation: 'Add H2 tags to break up content sections',
                expectedImpact: 'Better content hierarchy and SEO'
            });
            score -= 5;
        }
        // Image alt text analysis
        const images = htmlContent.match(/<img[^>]*>/gi) || [];
        const imagesWithoutAlt = images.filter(img => !img.includes('alt='));
        if (imagesWithoutAlt.length > 0) {
            issues.push({
                type: 'warning',
                category: 'content',
                message: `${imagesWithoutAlt.length} images missing alt text`,
                impact: 'medium',
                fixable: true,
                suggestion: 'Add descriptive alt text to all images'
            });
            score -= imagesWithoutAlt.length * 2;
        }
        // Internal links analysis
        const internalLinks = (htmlContent.match(/href="[^"]*"/g) || []).length;
        if (internalLinks < 2) {
            recommendations.push({
                category: 'content',
                priority: 'low',
                title: 'Add internal links',
                description: 'Include internal links to other relevant pages',
                implementation: 'Add 2-5 internal links to related content',
                expectedImpact: 'Better site navigation and SEO'
            });
            score -= 5;
        }
        return Math.max(0, score);
    }
    analyzeTechnicalSEO(htmlContent, url, issues, recommendations) {
        let score = 100;
        // Canonical URL check
        if (!htmlContent.includes('rel="canonical"')) {
            issues.push({
                type: 'warning',
                category: 'technical',
                message: 'Missing canonical URL',
                impact: 'medium',
                fixable: true,
                suggestion: 'Add canonical URL to prevent duplicate content issues'
            });
            score -= 10;
        }
        // Open Graph tags check
        const ogTags = ['og:title', 'og:description', 'og:image', 'og:url'];
        const missingOgTags = ogTags.filter(tag => !htmlContent.includes(tag));
        if (missingOgTags.length > 0) {
            issues.push({
                type: 'warning',
                category: 'technical',
                message: `Missing Open Graph tags: ${missingOgTags.join(', ')}`,
                impact: 'medium',
                fixable: true,
                suggestion: 'Add all required Open Graph tags for social sharing'
            });
            score -= missingOgTags.length * 5;
        }
        // Twitter Card tags check
        const twitterTags = ['twitter:card', 'twitter:title', 'twitter:description'];
        const missingTwitterTags = twitterTags.filter(tag => !htmlContent.includes(tag));
        if (missingTwitterTags.length > 0) {
            recommendations.push({
                category: 'technical',
                priority: 'low',
                title: 'Add Twitter Card tags',
                description: 'Improve social media sharing with Twitter Card tags',
                implementation: 'Add twitter:card, twitter:title, and twitter:description meta tags',
                expectedImpact: 'Better social media presence'
            });
            score -= missingTwitterTags.length * 3;
        }
        // Structured data check
        if (!htmlContent.includes('application/ld+json')) {
            recommendations.push({
                category: 'technical',
                priority: 'medium',
                title: 'Add structured data',
                description: 'Implement JSON-LD structured data for better search results',
                implementation: 'Add JSON-LD structured data for organization, website, and content',
                expectedImpact: 'Rich snippets in search results'
            });
            score -= 15;
        }
        // HTTPS check
        if (url && !url.startsWith('https://')) {
            issues.push({
                type: 'error',
                category: 'technical',
                message: 'Site not using HTTPS',
                impact: 'high',
                fixable: true,
                suggestion: 'Implement SSL certificate and redirect HTTP to HTTPS'
            });
            score -= 20;
        }
        return Math.max(0, score);
    }
    analyzePerformance(htmlContent, issues, recommendations) {
        let score = 100;
        // Image optimization check
        const images = htmlContent.match(/<img[^>]*>/gi) || [];
        const unoptimizedImages = images.filter(img => !img.includes('loading="lazy"') && !img.includes('loading=\'lazy\''));
        if (unoptimizedImages.length > 0) {
            recommendations.push({
                category: 'performance',
                priority: 'medium',
                title: 'Add lazy loading to images',
                description: 'Implement lazy loading for better page performance',
                implementation: 'Add loading="lazy" attribute to images below the fold',
                expectedImpact: 'Faster page load times'
            });
            score -= unoptimizedImages.length * 2;
        }
        // CSS optimization check
        const externalCSS = htmlContent.match(/<link[^>]*rel="stylesheet"[^>]*>/gi) || [];
        if (externalCSS.length > 3) {
            recommendations.push({
                category: 'performance',
                priority: 'low',
                title: 'Optimize CSS loading',
                description: 'Reduce number of external CSS files',
                implementation: 'Combine CSS files and use critical CSS inlining',
                expectedImpact: 'Faster page rendering'
            });
            score -= 5;
        }
        // JavaScript optimization check
        const externalJS = htmlContent.match(/<script[^>]*src=[^>]*>/gi) || [];
        if (externalJS.length > 5) {
            recommendations.push({
                category: 'performance',
                priority: 'low',
                title: 'Optimize JavaScript loading',
                description: 'Reduce number of external JavaScript files',
                implementation: 'Combine JS files and use async/defer attributes',
                expectedImpact: 'Faster page load times'
            });
            score -= 5;
        }
        return Math.max(0, score);
    }
    analyzeAccessibility(htmlContent, issues, recommendations) {
        let score = 100;
        // Alt text check (already covered in content analysis)
        const images = htmlContent.match(/<img[^>]*>/gi) || [];
        const imagesWithoutAlt = images.filter(img => !img.includes('alt='));
        if (imagesWithoutAlt.length > 0) {
            score -= imagesWithoutAlt.length * 5;
        }
        // Form labels check
        const inputs = htmlContent.match(/<input[^>]*>/gi) || [];
        const inputsWithoutLabels = inputs.filter(input => !htmlContent.includes(`for=`) && !input.includes('aria-label'));
        if (inputsWithoutLabels.length > 0) {
            issues.push({
                type: 'warning',
                category: 'accessibility',
                message: `${inputsWithoutLabels.length} form inputs missing labels`,
                impact: 'medium',
                fixable: true,
                suggestion: 'Add labels or aria-label attributes to form inputs'
            });
            score -= inputsWithoutLabels.length * 3;
        }
        // Color contrast recommendations
        recommendations.push({
            category: 'accessibility',
            priority: 'medium',
            title: 'Check color contrast',
            description: 'Ensure sufficient color contrast for text readability',
            implementation: 'Use tools like WebAIM contrast checker to verify 4.5:1 ratio',
            expectedImpact: 'Better accessibility and user experience'
        });
        return Math.max(0, score);
    }
    async generateMetrics(htmlContent) {
        // Simulated metrics - in real implementation, these would come from performance APIs
        return {
            pageLoadTime: Math.random() * 3000 + 1000, // 1-4 seconds
            firstContentfulPaint: Math.random() * 2000 + 500, // 0.5-2.5 seconds
            largestContentfulPaint: Math.random() * 4000 + 1000, // 1-5 seconds
            cumulativeLayoutShift: Math.random() * 0.1, // 0-0.1
            firstInputDelay: Math.random() * 100 + 10, // 10-110ms
            totalBlockingTime: Math.random() * 300 + 50, // 50-350ms
            seoScore: Math.random() * 20 + 80, // 80-100
            accessibilityScore: Math.random() * 20 + 80, // 80-100
            performanceScore: Math.random() * 20 + 80, // 80-100
            bestPracticesScore: Math.random() * 20 + 80 // 80-100
        };
    }
}
// Export default auditor instance
export const seoAuditor = new SEOAuditor();
//# sourceMappingURL=seo-audit.js.map