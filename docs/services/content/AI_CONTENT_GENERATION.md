# AI Content Generation

## Overview

The AI Content Generation service provides automated content creation using OpenAI's GPT models. It supports multiple content types with quality assessment and variation generation.

## Features

### 1. Product Description Generation

Generate compelling product descriptions with:
- Customizable tone (professional, casual, playful, technical, enthusiastic)
- Adjustable length (short: 50-100 words, medium: 100-200, long: 200-300)
- Feature and benefit highlighting
- Target audience optimization
- Keyword integration
- Brand voice consistency

### 2. Blog Post Generation

Create engaging blog posts with:
- Topic-based generation
- Keyword optimization
- Custom outlines
- Target audience focus
- Call-to-action inclusion
- Adjustable length (400-1200+ words)

### 3. Content Quality Assessment

Automated quality scoring including:
- **Overall Score** (0-100): Weighted average of all metrics
- **Readability Score** (0-100): Flesch reading ease analysis
- **SEO Score** (0-100): Keyword usage, headings, links, images
- **Engagement Score** (0-100): Questions, numbers, bullet points, emphasis
- **Brand Alignment** (0-100): Brand voice and terminology consistency

### 4. Content Variations

Generate multiple versions with different tones for A/B testing.

## Usage

### Service Layer

```typescript
import { aiContentGenerator } from '~/services/content/ai-content-generator';

// Generate product description
const result = await aiContentGenerator.generateProductDescription({
  productTitle: 'Carbon Fiber Roof Rack',
  features: [
    'Lightweight carbon fiber construction',
    'Aerodynamic design',
    'Easy installation'
  ],
  targetAudience: 'automotive enthusiasts',
  tone: 'professional',
  length: 'medium',
  includeKeywords: ['carbon fiber', 'roof rack', 'lightweight']
});

console.log(result.content);
console.log(result.qualityScore);
```

### Component Layer

```tsx
import { AIContentGenerator } from '~/components/content';

function ProductEditor() {
  const handleGenerate = (content: string) => {
    // Use generated content
    setProductDescription(content);
  };

  return (
    <AIContentGenerator
      contentType="product_description"
      onGenerate={handleGenerate}
      initialData={{
        productTitle: 'My Product',
        keywords: ['keyword1', 'keyword2']
      }}
    />
  );
}
```

### API Routes

#### Generate Product Description

```bash
POST /api/content/generate-product-description
Content-Type: application/json

{
  "productTitle": "Carbon Fiber Roof Rack",
  "features": ["Lightweight", "Aerodynamic"],
  "tone": "professional",
  "length": "medium",
  "includeKeywords": ["carbon fiber", "roof rack"]
}
```

Response:
```json
{
  "success": true,
  "content": "Generated description...",
  "metadata": {
    "wordCount": 150,
    "characterCount": 890,
    "readingTime": 1,
    "tone": "professional",
    "generatedAt": "2025-10-23T14:30:00Z"
  },
  "qualityScore": {
    "overall": 85,
    "readability": 82,
    "seoScore": 88,
    "engagement": 80,
    "brandAlignment": 90,
    "issues": [],
    "recommendations": ["Add more specific product details"]
  }
}
```

#### Generate Blog Post

```bash
POST /api/content/generate-blog-post
Content-Type: application/json

{
  "topic": "How to Choose the Right Roof Rack",
  "keywords": ["roof rack", "cargo", "installation"],
  "tone": "casual",
  "length": 800,
  "includeCallToAction": true
}
```

#### Generate Variations

```bash
POST /api/content/generate-variations
Content-Type: application/json

{
  "type": "product_description",
  "request": {
    "productTitle": "Carbon Fiber Roof Rack",
    "features": ["Lightweight", "Aerodynamic"]
  },
  "count": 3
}
```

#### Assess Content Quality

```bash
POST /api/content/assess-quality
Content-Type: application/json

{
  "content": "Your content here...",
  "contentType": "product_description",
  "keywords": ["keyword1", "keyword2"]
}
```

## Configuration

### Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional (defaults shown)
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.7
```

### Brand Voice

The default brand voice is configured for Hot Rodan:
- Automotive enthusiast brand
- Quality parts and expert advice focus
- Knowledgeable, passionate, customer-focused tone

To customize, pass `brandVoice` parameter:

```typescript
const result = await aiContentGenerator.generateProductDescription({
  productTitle: 'Product Name',
  brandVoice: 'Your custom brand voice description...',
  // ... other options
});
```

## Quality Scoring

### Overall Score Calculation

```
Overall = (SEO × 0.3) + (Engagement × 0.3) + (Brand × 0.2) + (Readability × 0.2)
```

### Score Ranges

- **90-100**: Excellent - Ready to publish
- **80-89**: Good - Minor improvements recommended
- **70-79**: Fair - Needs some work
- **60-69**: Poor - Significant improvements needed
- **0-59**: Critical - Major rewrite required

### Engagement Factors

- Questions (+5 points)
- Numbers/statistics (+5 points)
- Bullet points (+5 points)
- Emphasis (bold/italic) (+5 points)
- Sentence variety (+5 points)

### Brand Alignment Factors

- Automotive terminology usage
- Quality/performance language
- Expert/professional tone
- Customer-focused messaging

## Best Practices

### Product Descriptions

1. **Be Specific**: Include concrete features and measurements
2. **Focus on Benefits**: Explain how features help customers
3. **Use Keywords Naturally**: Don't force keyword stuffing
4. **Match Tone to Audience**: Technical for experts, casual for general
5. **Keep It Scannable**: Use short paragraphs and bullet points

### Blog Posts

1. **Start Strong**: Hook readers in the first paragraph
2. **Use Subheadings**: Break content into scannable sections
3. **Include Examples**: Real-world applications and use cases
4. **Add CTAs**: Guide readers to next steps
5. **Optimize for SEO**: Use keywords in headings and throughout

### Quality Improvement

1. **Review Recommendations**: Address all quality score suggestions
2. **Test Variations**: Generate multiple versions and compare
3. **Human Review**: Always review AI-generated content before publishing
4. **Iterate**: Use feedback to improve future generations
5. **Monitor Performance**: Track how content performs with customers

## Integration with Other Services

### SEO Content Optimizer

Quality assessment uses the SEO content optimizer service for:
- Readability analysis (Flesch score)
- Keyword density
- Heading structure
- Link analysis
- Image optimization

### CX Content Implementation

Generated product descriptions can be applied to Shopify products via:

```typescript
import { applyCXContent } from '~/services/content/cx-content-implementation';

const description = await aiContentGenerator.generateProductDescription({...});

await applyCXContent({
  productId: 'gid://shopify/Product/123',
  contentType: 'product_description',
  content: description.content
}, request);
```

### Post Drafter

Blog content can be adapted for social media posts:

```typescript
import { draftPost } from '~/services/content/post-drafter';

const blogPost = await aiContentGenerator.generateBlogPost({...});

// Extract key points for social post
const socialPost = await draftPost({
  platform: 'instagram',
  topic: 'Extracted from blog post',
  tone: 'casual'
});
```

## Limitations

1. **API Rate Limits**: OpenAI API has rate limits based on your plan
2. **Token Limits**: Maximum content length depends on model token limits
3. **Quality Variance**: AI-generated content quality can vary
4. **Human Review Required**: Always review before publishing
5. **Brand Voice Learning**: May need multiple iterations to match brand perfectly

## Troubleshooting

### "Failed to generate content"

- Check OPENAI_API_KEY is set correctly
- Verify API key has sufficient credits
- Check network connectivity
- Review OpenAI API status

### Low Quality Scores

- Add more specific details to the request
- Include relevant keywords
- Specify target audience clearly
- Try different tone options
- Generate variations and compare

### Content Too Generic

- Provide more features and benefits
- Include specific product details
- Add brand voice guidelines
- Use more descriptive keywords
- Increase content length

## Future Enhancements

- [ ] Fine-tuning on brand-specific content
- [ ] Multi-language support
- [ ] Image generation integration
- [ ] A/B testing automation
- [ ] Performance tracking and learning
- [ ] Template library expansion
- [ ] Custom model training
- [ ] Real-time collaboration features

## Support

For issues or questions:
1. Check this documentation
2. Review error logs in console
3. Test with simpler requests
4. Contact development team

