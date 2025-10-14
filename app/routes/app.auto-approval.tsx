/**
 * Auto-Approval Configuration Route - P0
 * 
 * Configure automatic approval thresholds for each recommender
 * Features:
 * - Threshold sliders by recommender
 * - Live preview ("X actions would auto-approve")
 * - Safety guardrails (max/day, high-value approval)
 * - Audit log table
 */

import { type LoaderFunctionArgs, type ActionFunctionArgs } from 'react-router';
import { useLoaderData, Form, useActionData } from 'react-router';
import { useState } from 'react';
import { 
  Page, 
  Layout, 
  Card,
  Banner,
  Text,
  Button,
} from '@shopify/polaris';
import { AutoApprovalSettings } from '~/components/auto-approval/AutoApprovalSettings';
import { LivePreview } from '~/components/auto-approval/LivePreview';
import { SafetyGuardrails } from '~/components/auto-approval/SafetyGuardrails';
import { AuditLogTable } from '~/components/auto-approval/AuditLogTable';

// Helper function for JSON responses
function json<T>(data: T, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}

export interface AutoApprovalConfig {
  recommenders: Array<{
    id: string;
    name: string;
    threshold: number; // 0-100
    enabled: boolean;
  }>;
  safetyGuardrails: {
    maxPerDay: number;
    highValueThreshold: number; // $ amount
    requireManualForHighValue: boolean;
  };
  previewStats: {
    totalPending: number;
    wouldAutoApprove: number;
    percentageAutoApproved: number;
  };
  auditLog: Array<{
    id: string;
    timestamp: string;
    action: string;
    user: string;
    details: string;
  }>;
}

/**
 * Load auto-approval configuration
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // TODO: Fetch real data from API
    // For now, return mock data
    const mockConfig: AutoApprovalConfig = {
      recommenders: [
        { id: 'seo-ctr', name: 'SEO CTR Optimizer', threshold: 85, enabled: true },
        { id: 'metaobject', name: 'Metaobject Generator', threshold: 80, enabled: true },
        { id: 'merch-playbook', name: 'Merchandising Playbook', threshold: 75, enabled: false },
        { id: 'guided-selling', name: 'Guided Selling', threshold: 70, enabled: false },
        { id: 'cwv-repair', name: 'Core Web Vitals Repair', threshold: 90, enabled: true },
      ],
      safetyGuardrails: {
        maxPerDay: 50,
        highValueThreshold: 1000,
        requireManualForHighValue: true,
      },
      previewStats: {
        totalPending: 127,
        wouldAutoApprove: 68,
        percentageAutoApproved: 53.5,
      },
      auditLog: [
        {
          id: '1',
          timestamp: '2025-10-14T14:30:00Z',
          action: 'Enabled auto-approval',
          user: 'admin@example.com',
          details: 'Enabled for SEO CTR Optimizer at 85% threshold',
        },
        {
          id: '2',
          timestamp: '2025-10-14T13:15:00Z',
          action: 'Updated threshold',
          user: 'admin@example.com',
          details: 'Changed Metaobject Generator from 75% to 80%',
        },
        {
          id: '3',
          timestamp: '2025-10-13T16:45:00Z',
          action: 'Updated safety limit',
          user: 'admin@example.com',
          details: 'Set max per day to 50 actions',
        },
      ],
    };

    return json({ config: mockConfig });
  } catch (error) {
    console.error('Error loading auto-approval config:', error);
    return json({
      config: null,
      error: error instanceof Error ? error.message : 'Failed to load configuration',
    });
  }
}

/**
 * Handle configuration updates
 */
export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const updates = JSON.parse(formData.get('config') as string);

    // TODO: Save to API
    console.log('Saving auto-approval config:', updates);

    return json({ 
      success: true, 
      message: 'Auto-approval settings saved successfully' 
    });
  } catch (error) {
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save settings' 
    });
  }
}

/**
 * Auto-Approval Configuration Page Component
 */
export default function AutoApprovalPage() {
  const { config, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [localConfig, setLocalConfig] = useState(config);
  const [hasChanges, setHasChanges] = useState(false);

  if (error || !config) {
    return (
      <Page title="Auto-Approval Settings">
        <Layout>
          <Layout.Section>
            <Card>
              <Text tone="critical">
                {error || 'Failed to load configuration'}
              </Text>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  const handleConfigChange = (newConfig: Partial<AutoApprovalConfig>) => {
    setLocalConfig({ ...localConfig, ...newConfig });
    setHasChanges(true);
  };

  return (
    <Page
      title="Auto-Approval Settings"
      subtitle="Configure automatic approval thresholds for recommenders"
      primaryAction={{
        content: 'Save Settings',
        disabled: !hasChanges,
        onAction: () => {
          // Submit form
          document.getElementById('auto-approval-form')?.dispatchEvent(
            new Event('submit', { cancelable: true, bubbles: true })
          );
        },
      }}
      secondaryActions={[
        {
          content: 'Reset to Defaults',
          onAction: () => {
            setLocalConfig(config);
            setHasChanges(false);
          },
          disabled: !hasChanges,
        },
      ]}
    >
      <Form method="post" id="auto-approval-form">
        <input 
          type="hidden" 
          name="config" 
          value={JSON.stringify(localConfig)} 
        />

        <Layout>
          {/* Success/Error Messages */}
          {actionData && (
            <Layout.Section>
              {actionData.success ? (
                <Banner tone="success" onDismiss={() => {}}>
                  {actionData.message}
                </Banner>
              ) : (
                <Banner tone="critical" onDismiss={() => {}}>
                  {actionData.error}
                </Banner>
              )}
            </Layout.Section>
          )}

          {/* Live Preview */}
          <Layout.Section>
            <LivePreview stats={localConfig.previewStats} />
          </Layout.Section>

          {/* Auto-Approval Settings */}
          <Layout.Section>
            <AutoApprovalSettings
              recommenders={localConfig.recommenders}
              onChange={(recommenders) => 
                handleConfigChange({ recommenders })
              }
            />
          </Layout.Section>

          {/* Safety Guardrails */}
          <Layout.Section>
            <SafetyGuardrails
              guardrails={localConfig.safetyGuardrails}
              onChange={(safetyGuardrails) => 
                handleConfigChange({ safetyGuardrails })
              }
            />
          </Layout.Section>

          {/* Audit Log */}
          <Layout.Section>
            <AuditLogTable auditLog={localConfig.auditLog} />
          </Layout.Section>
        </Layout>
      </Form>
    </Page>
  );
}

