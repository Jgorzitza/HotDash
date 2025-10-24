/**
 * AI Content Generator Component
 *
 * Provides UI for generating AI-powered content including:
 * - Product descriptions
 * - Blog posts
 * - Content variations
 * - Quality assessment
 */
import { useState } from "react";
import { Card, FormLayout, TextField, Select, Button, Text, Badge, Banner, List, Divider, BlockStack, InlineStack, } from "@shopify/polaris";
export function AIContentGenerator({ contentType, onGenerate, initialData, }) {
    const [loading, setLoading] = useState(false);
    const [generatedContent, setGeneratedContent] = useState("");
    const [qualityScore, setQualityScore] = useState(null);
    const [variations, setVariations] = useState([]);
    const [showVariations, setShowVariations] = useState(false);
    // Form state
    const [productTitle, setProductTitle] = useState(initialData?.productTitle || "");
    const [topic, setTopic] = useState(initialData?.topic || "");
    const [keywords, setKeywords] = useState(initialData?.keywords?.join(", ") || "");
    const [tone, setTone] = useState("professional");
    const [length, setLength] = useState("medium");
    const [features, setFeatures] = useState("");
    const [targetAudience, setTargetAudience] = useState("");
    const toneOptions = [
        { label: "Professional", value: "professional" },
        { label: "Casual", value: "casual" },
        { label: "Playful", value: "playful" },
        { label: "Technical", value: "technical" },
        { label: "Enthusiastic", value: "enthusiastic" },
    ];
    const lengthOptions = [
        { label: "Short (50-100 words)", value: "short" },
        { label: "Medium (100-200 words)", value: "medium" },
        { label: "Long (200-300 words)", value: "long" },
    ];
    const handleGenerate = async () => {
        setLoading(true);
        try {
            const endpoint = contentType === "product_description"
                ? "/api/content/generate-product-description"
                : "/api/content/generate-blog-post";
            const payload = contentType === "product_description"
                ? {
                    productTitle,
                    features: features.split("\n").filter((f) => f.trim()),
                    targetAudience,
                    tone,
                    length,
                    includeKeywords: keywords
                        .split(",")
                        .map((k) => k.trim())
                        .filter((k) => k),
                }
                : {
                    topic,
                    keywords: keywords
                        .split(",")
                        .map((k) => k.trim())
                        .filter((k) => k),
                    targetAudience,
                    tone,
                    length: length === "short" ? 400 : length === "medium" ? 800 : 1200,
                };
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error("Failed to generate content");
            }
            const result = await response.json();
            setGeneratedContent(result.content);
            setQualityScore(result.qualityScore);
        }
        catch (error) {
            console.error("Error generating content:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleGenerateVariations = async () => {
        setLoading(true);
        try {
            const endpoint = "/api/content/generate-variations";
            const payload = contentType === "product_description"
                ? {
                    type: "product_description",
                    request: {
                        productTitle,
                        features: features.split("\n").filter((f) => f.trim()),
                        targetAudience,
                        length,
                        includeKeywords: keywords
                            .split(",")
                            .map((k) => k.trim())
                            .filter((k) => k),
                    },
                    count: 3,
                }
                : {
                    type: "blog_post",
                    request: {
                        topic,
                        keywords: keywords
                            .split(",")
                            .map((k) => k.trim())
                            .filter((k) => k),
                        targetAudience,
                        length: length === "short" ? 400 : length === "medium" ? 800 : 1200,
                    },
                    count: 3,
                };
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error("Failed to generate variations");
            }
            const result = await response.json();
            setVariations(result.variations);
            setShowVariations(true);
        }
        catch (error) {
            console.error("Error generating variations:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleUseContent = () => {
        onGenerate(generatedContent);
    };
    const handleUseVariation = (content) => {
        setGeneratedContent(content);
        setShowVariations(false);
    };
    const getQualityBadge = (score) => {
        if (score >= 80)
            return <Badge tone="success">Excellent</Badge>;
        if (score >= 70)
            return <Badge tone="info">Good</Badge>;
        if (score >= 60)
            return <Badge tone="warning">Fair</Badge>;
        return <Badge tone="critical">Needs Improvement</Badge>;
    };
    return (<BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            AI Content Generator
          </Text>

          <FormLayout>
            {contentType === "product_description" ? (<>
                <TextField label="Product Title" value={productTitle} onChange={setProductTitle} autoComplete="off" placeholder="Enter product title"/>
                <TextField label="Key Features (one per line)" value={features} onChange={setFeatures} multiline={4} autoComplete="off" placeholder="Feature 1&#10;Feature 2&#10;Feature 3"/>
              </>) : (<TextField label="Blog Post Topic" value={topic} onChange={setTopic} autoComplete="off" placeholder="Enter blog post topic"/>)}

            <TextField label="Keywords (comma-separated)" value={keywords} onChange={setKeywords} autoComplete="off" placeholder="keyword1, keyword2, keyword3"/>

            <TextField label="Target Audience" value={targetAudience} onChange={setTargetAudience} autoComplete="off" placeholder="e.g., automotive enthusiasts, DIY mechanics"/>

            <Select label="Tone" options={toneOptions} value={tone} onChange={(value) => setTone(value)}/>

            <Select label="Length" options={lengthOptions} value={length} onChange={setLength}/>
          </FormLayout>

          <InlineStack gap="200">
            <Button onClick={handleGenerate} loading={loading} variant="primary" disabled={contentType === "product_description" ? !productTitle : !topic}>
              Generate Content
            </Button>
            <Button onClick={handleGenerateVariations} loading={loading} disabled={contentType === "product_description" ? !productTitle : !topic}>
              Generate Variations
            </Button>
          </InlineStack>
        </BlockStack>
      </Card>

      {generatedContent && (<Card>
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text as="h3" variant="headingMd">
                Generated Content
              </Text>
              {qualityScore && (<InlineStack gap="200">
                  <Text as="span" variant="bodyMd">
                    Quality Score:
                  </Text>
                  {getQualityBadge(qualityScore.overall)}
                </InlineStack>)}
            </InlineStack>

            <div style={{
                padding: "16px",
                backgroundColor: "#f6f6f7",
                borderRadius: "8px",
                whiteSpace: "pre-wrap",
            }}>
              {generatedContent}
            </div>

            {qualityScore && (<BlockStack gap="200">
                <Divider />
                <Text as="h4" variant="headingSm">
                  Quality Metrics
                </Text>
                <InlineStack gap="400">
                  <Text as="span" variant="bodyMd">
                    Readability: {qualityScore.readability}/100
                  </Text>
                  <Text as="span" variant="bodyMd">
                    SEO: {qualityScore.seoScore}/100
                  </Text>
                  <Text as="span" variant="bodyMd">
                    Engagement: {qualityScore.engagement}/100
                  </Text>
                </InlineStack>

                {qualityScore.recommendations.length > 0 && (<Banner tone="info">
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      Recommendations:
                    </Text>
                    <List>
                      {qualityScore.recommendations
                        .slice(0, 3)
                        .map((rec, i) => (<List.Item key={i}>{rec}</List.Item>))}
                    </List>
                  </Banner>)}
              </BlockStack>)}

            <Button onClick={handleUseContent} variant="primary">
              Use This Content
            </Button>
          </BlockStack>
        </Card>)}

      {showVariations && variations.length > 0 && (<Card>
          <BlockStack gap="400">
            <Text as="h3" variant="headingMd">
              Content Variations
            </Text>

            {variations.map((variation, index) => (<Card key={index}>
                <BlockStack gap="300">
                  <InlineStack align="space-between">
                    <Text as="h4" variant="headingSm">
                      Variation {index + 1} ({variation.metadata.tone})
                    </Text>
                    {variation.qualityScore &&
                    getQualityBadge(variation.qualityScore.overall)}
                  </InlineStack>

                  <div style={{
                    padding: "12px",
                    backgroundColor: "#f6f6f7",
                    borderRadius: "8px",
                    whiteSpace: "pre-wrap",
                    fontSize: "14px",
                }}>
                    {variation.content}
                  </div>

                  <Button onClick={() => handleUseVariation(variation.content)} size="slim">
                    Use This Variation
                  </Button>
                </BlockStack>
              </Card>))}
          </BlockStack>
        </Card>)}
    </BlockStack>);
}
//# sourceMappingURL=AIContentGenerator.js.map