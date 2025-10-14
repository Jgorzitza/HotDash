/**
 * DiffViewer Component
 * 
 * Displays formatted JSON/code with syntax highlighting
 * Supports diff mode for before/after comparison
 */

import { Card, InlineStack, BlockStack, Text, Button, Box } from '@shopify/polaris';
import { useState } from 'react';

export interface DiffViewerProps {
  content: any;
  before?: any;
  after?: any;
  language?: 'json' | 'javascript' | 'text';
  readOnly?: boolean;
  title?: string;
}

export function DiffViewer({
  content,
  before,
  after,
  language = 'json',
  readOnly = true,
  title = 'Content',
}: DiffViewerProps) {
  const [copied, setCopied] = useState(false);

  const formatContent = (data: any): string => {
    if (typeof data === 'string') return data;
    if (language === 'json') return JSON.stringify(data, null, 2);
    return String(data);
  };

  const copyToClipboard = async () => {
    const text = formatContent(content || before || after);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Diff mode: show before/after side-by-side
  if (before !== undefined && after !== undefined) {
    return (
      <Card>
        <BlockStack gap="300">
          <Text variant="headingXs">{title}</Text>
          
          <InlineStack gap="400" align="start">
            {/* Before */}
            <Box style={{ flex: 1 }}>
              <BlockStack gap="200">
                <Text variant="bodySm" tone="subdued" fontWeight="semibold">
                  Before
                </Text>
                <Box
                  background="bg-surface-secondary"
                  padding="300"
                  borderRadius="200"
                >
                  <pre
                    style={{
                      margin: 0,
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      lineHeight: '1.5',
                    }}
                  >
                    {formatContent(before)}
                  </pre>
                </Box>
              </BlockStack>
            </Box>

            {/* After */}
            <Box style={{ flex: 1 }}>
              <BlockStack gap="200">
                <Text variant="bodySm" tone="subdued" fontWeight="semibold">
                  After
                </Text>
                <Box
                  background="bg-surface-success-subdued"
                  padding="300"
                  borderRadius="200"
                >
                  <pre
                    style={{
                      margin: 0,
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      lineHeight: '1.5',
                    }}
                  >
                    {formatContent(after)}
                  </pre>
                </Box>
              </BlockStack>
            </Box>
          </InlineStack>
        </BlockStack>
      </Card>
    );
  }

  // Single content mode
  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center">
          <Text variant="headingXs">{title}</Text>
          <Button
            size="slim"
            onClick={copyToClipboard}
            disabled={!readOnly}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </InlineStack>

        <Box
          background="bg-surface-secondary"
          padding="300"
          borderRadius="200"
        >
          <pre
            style={{
              margin: 0,
              fontFamily: 'monospace',
              fontSize: '12px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              lineHeight: '1.5',
              maxHeight: '400px',
              overflow: 'auto',
            }}
          >
            {formatContent(content)}
          </pre>
        </Box>
      </BlockStack>
    </Card>
  );
}

