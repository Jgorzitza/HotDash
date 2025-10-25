import { useState, useEffect } from "react";
import { Card, Button, Banner, Spinner, Text, BlockStack, InlineStack, Badge, ProgressBar } from "@shopify/polaris";
import type { SEOAuditResult } from "../../lib/seo/seo-audit";

interface SEOOptimizationTileProps {
  className?: string;
}

export function SEOOptimizationTile({ className }: SEOOptimizationTileProps) {
  const [auditResult, setAuditResult] = useState<SEOAuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSEOAudit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/seo/audit?url=' + encodeURIComponent(window.location.href));
      const data = await response.json();
      
      if (data.success) {
        setAuditResult(data.data);
      } else {
        setError(data.error || 'Failed to run SEO audit');
      }
    } catch (err) {
      setError('Failed to run SEO audit');
      console.error('SEO audit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'critical';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  if (loading) {
    return (
      <Card>
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <Spinner size="small" />
          <Text variant="bodyMd" as="p" color="subdued">
            Running SEO audit...
          </Text>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Banner status="critical">
          <Text variant="bodyMd" as="p">
            {error}
          </Text>
        </Banner>
        <div style={{ padding: '1rem' }}>
          <Button onClick={runSEOAudit} size="slim">
            Retry SEO Audit
          </Button>
        </div>
      </Card>
    );
  }

  if (!auditResult) {
    return (
      <Card>
        <div style={{ padding: '1rem' }}>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h3">
              SEO Optimization
            </Text>
            <Text variant="bodyMd" as="p" color="subdued">
              Run a comprehensive SEO audit to identify optimization opportunities.
            </Text>
            <Button onClick={runSEOAudit} variant="primary">
              Run SEO Audit
            </Button>
          </BlockStack>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ padding: '1rem' }}>
        <BlockStack gap="400">
          <InlineStack align="space-between">
            <Text variant="headingMd" as="h3">
              SEO Optimization
            </Text>
            <Badge status={getScoreColor(auditResult.overallScore)}>
              {auditResult.overallScore}/100
            </Badge>
          </InlineStack>

          <div>
            <InlineStack align="space-between" blockAlign="center">
              <Text variant="bodyMd" as="p">
                Overall Score: {getScoreLabel(auditResult.overallScore)}
              </Text>
              <Text variant="bodyMd" as="p" color="subdued">
                {auditResult.overallScore}%
              </Text>
            </InlineStack>
            <div style={{ marginTop: '0.5rem' }}>
              <ProgressBar 
                progress={auditResult.overallScore} 
                color={getScoreColor(auditResult.overallScore)}
              />
            </div>
          </div>

          <BlockStack gap="300">
            <Text variant="bodyMd" as="p" fontWeight="semibold">
              Category Scores:
            </Text>
            <InlineStack gap="400" wrap={false}>
              <div style={{ flex: 1 }}>
                <Text variant="bodyMd" as="p" color="subdued">
                  Content
                </Text>
                <ProgressBar 
                  progress={auditResult.categoryScores.content} 
                  color={getScoreColor(auditResult.categoryScores.content)}
                />
                <Text variant="bodyMd" as="p" color="subdued">
                  {auditResult.categoryScores.content}%
                </Text>
              </div>
              <div style={{ flex: 1 }}>
                <Text variant="bodyMd" as="p" color="subdued">
                  Technical
                </Text>
                <ProgressBar 
                  progress={auditResult.categoryScores.technical} 
                  color={getScoreColor(auditResult.categoryScores.technical)}
                />
                <Text variant="bodyMd" as="p" color="subdued">
                  {auditResult.categoryScores.technical}%
                </Text>
              </div>
            </InlineStack>
            <InlineStack gap="400" wrap={false}>
              <div style={{ flex: 1 }}>
                <Text variant="bodyMd" as="p" color="subdued">
                  Performance
                </Text>
                <ProgressBar 
                  progress={auditResult.categoryScores.performance} 
                  color={getScoreColor(auditResult.categoryScores.performance)}
                />
                <Text variant="bodyMd" as="p" color="subdued">
                  {auditResult.categoryScores.performance}%
                </Text>
              </div>
              <div style={{ flex: 1 }}>
                <Text variant="bodyMd" as="p" color="subdued">
                  Accessibility
                </Text>
                <ProgressBar 
                  progress={auditResult.categoryScores.accessibility} 
                  color={getScoreColor(auditResult.categoryScores.accessibility)}
                />
                <Text variant="bodyMd" as="p" color="subdued">
                  {auditResult.categoryScores.accessibility}%
                </Text>
              </div>
            </InlineStack>
          </BlockStack>

          {auditResult.issues.length > 0 && (
            <BlockStack gap="300">
              <Text variant="bodyMd" as="p" fontWeight="semibold">
                Issues Found ({auditResult.issues.length}):
              </Text>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {auditResult.issues.slice(0, 5).map((issue, index) => (
                  <div key={index} style={{ 
                    padding: '0.5rem', 
                    border: '1px solid var(--p-color-border-subdued)',
                    borderRadius: '4px',
                    marginBottom: '0.5rem'
                  }}>
                    <InlineStack gap="200" blockAlign="center">
                      <Badge status={issue.type === 'error' ? 'critical' : 'warning'}>
                        {issue.type}
                      </Badge>
                      <Text variant="bodyMd" as="p">
                        {issue.message}
                      </Text>
                    </InlineStack>
                    {issue.suggestion && (
                      <Text variant="bodyMd" as="p" color="subdued">
                        💡 {issue.suggestion}
                      </Text>
                    )}
                  </div>
                ))}
                {auditResult.issues.length > 5 && (
                  <Text variant="bodyMd" as="p" color="subdued">
                    ... and {auditResult.issues.length - 5} more issues
                  </Text>
                )}
              </div>
            </BlockStack>
          )}

          {auditResult.recommendations.length > 0 && (
            <BlockStack gap="300">
              <Text variant="bodyMd" as="p" fontWeight="semibold">
                Recommendations ({auditResult.recommendations.length}):
              </Text>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {auditResult.recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} style={{ 
                    padding: '0.5rem', 
                    border: '1px solid var(--p-color-border-subdued)',
                    borderRadius: '4px',
                    marginBottom: '0.5rem'
                  }}>
                    <Text variant="bodyMd" as="p" fontWeight="semibold">
                      {rec.title}
                    </Text>
                    <Text variant="bodyMd" as="p" color="subdued">
                      {rec.description}
                    </Text>
                  </div>
                ))}
                {auditResult.recommendations.length > 3 && (
                  <Text variant="bodyMd" as="p" color="subdued">
                    ... and {auditResult.recommendations.length - 3} more recommendations
                  </Text>
                )}
              </div>
            </BlockStack>
          )}

          <InlineStack gap="200">
            <Button onClick={runSEOAudit} size="slim">
              Refresh Audit
            </Button>
            <Button 
              url="/api/seo/audit" 
              external 
              size="slim"
            >
              View Full Report
            </Button>
          </InlineStack>
        </BlockStack>
      </div>
    </Card>
  );
}
