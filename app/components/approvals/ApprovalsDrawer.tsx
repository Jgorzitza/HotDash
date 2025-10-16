import { useEffect, useState } from "react";
import { Modal, BlockStack, InlineStack, Text, Button, Badge, Card, Tabs, Divider, Banner, RangeSlider } from "@shopify/polaris";

interface Evidence {
  summary: string;
  diffs?: Array<{ path: string; before: string; after: string }>;
  samples?: Array<{ label: string; content: string }>;
  queries?: Array<{ label: string; url: string }>;
  screenshots?: Array<{ label: string; url: string }>;
}

interface Risk {
  description: string;
  level: "low" | "medium" | "high";
}

interface Rollback {
  steps: string[];
  estimatedTime?: string;
}

interface ApprovalDetail {
  id: string;
  conversationId: number;
  createdAt: string;
  agent: string;
  tool: string;
  args: Record<string, any>;
  evidence: Evidence;
  projectedImpact: string;
  risks: Risk[];
  rollback: Rollback;
}

interface ApprovalsDrawerProps {
  open: boolean;
  approval: ApprovalDetail | null;
  onClose: () => void;
  onApprove?: (grades: { tone: number; accuracy: number; policy: number }) => void;
  onReject?: (reason: string) => void;
}

export function ApprovalsDrawer({ open, approval, onClose, onApprove, onReject }: ApprovalsDrawerProps) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [toneGrade, setToneGrade] = useState(3);
  const [accuracyGrade, setAccuracyGrade] = useState(3);
  const [policyGrade, setPolicyGrade] = useState(3);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persist grades per approval id in localStorage
  useEffect(() => {
    if (!approval?.id) return;
    try {
      const raw = localStorage.getItem(`approvalGrades:${approval.id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.tone === 'number') setToneGrade(parsed.tone);
        if (typeof parsed.accuracy === 'number') setAccuracyGrade(parsed.accuracy);
        if (typeof parsed.policy === 'number') setPolicyGrade(parsed.policy);
      }
    } catch {}
  }, [approval?.id]);

  useEffect(() => {
    if (!approval?.id) return;
    try {
      localStorage.setItem(
        `approvalGrades:${approval.id}`,
        JSON.stringify({ tone: toneGrade, accuracy: accuracyGrade, policy: policyGrade })
      );
    } catch {}
  }, [approval?.id, toneGrade, accuracyGrade, policyGrade]);

  if (!approval) return null;

  const riskLevel = getRiskLevel(approval.tool);
  const riskColor = { low: "success", medium: "warning", high: "critical" } as const;

  const tabs = [
    { id: "diffs", content: "Diffs", panelID: "diffs-panel" },
    { id: "samples", content: "Samples", panelID: "samples-panel" },
    { id: "queries", content: "Queries", panelID: "queries-panel" },
    { id: "screenshots", content: "Screenshots", panelID: "screenshots-panel" },
  ];

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      await onApprove?.({ tone: toneGrade, accuracy: accuracyGrade, policy: policyGrade });
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to approve. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validationReasons: string[] = [];
  if (!approval.evidence?.summary?.trim()) validationReasons.push('Evidence summary is required');
  if (!approval.rollback?.steps || approval.rollback.steps.length === 0) validationReasons.push('Rollback steps are required');
  const clientValidationOk = validationReasons.length === 0;

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onReject?.(rejectReason);
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to reject. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Approval: Conversation #${approval.conversationId}`}>
      <div
        style={{ padding: "var(--p-space-400)" }}
        data-testid="approvals-drawer"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && clientValidationOk && !loading) {
            e.preventDefault();
            handleApprove();
          }
        }}
      >
        <BlockStack gap="400">
          <InlineStack align="space-between" blockAlign="center">
            <Text variant="headingMd" as="h2">{approval.agent} · {approval.tool}</Text>
            <Badge tone={riskColor[riskLevel]}>{`${riskLevel.toUpperCase()} RISK`}</Badge>
          </InlineStack>

          {error && (
            <Banner tone="critical">
              {error}
            </Banner>
          )}

          {!clientValidationOk && (
            <Banner tone="critical">
              <BlockStack gap="100">
                <Text as="p">Validation required before approval:</Text>
                <ul style={{ margin: 0, paddingInlineStart: '1.25rem' }}>
                  {validationReasons.map((r, i) => (
                    <li key={i}><Text as="span" variant="bodySm">{r}</Text></li>
                  ))}
                </ul>
              </BlockStack>
            </Banner>
          )}

          <Text variant="bodySm" as="p" tone="subdued">Requested {new Date(approval.createdAt).toLocaleString()}</Text>

          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h3">Evidence</Text>
              <Text as="p">{approval.evidence.summary}</Text>
              <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
                <div style={{ padding: "var(--p-space-400) 0" }}>
                  {selectedTab === 0 && (
                    <BlockStack gap="200">
                      {approval.evidence.diffs && approval.evidence.diffs.length > 0 ? (
                        approval.evidence.diffs.map((diff, idx) => (
                          <Card key={idx}>
                            <BlockStack gap="200">
                              <Text variant="headingSm" as="h4">{diff.path}</Text>
                              <pre style={{ background: "var(--p-color-bg-surface-secondary)", padding: "var(--p-space-300)", borderRadius: "var(--p-border-radius-200)", fontSize: "12px", overflow: "auto" }}>
                                {`- ${diff.before}\n+ ${diff.after}`}
                              </pre>
                            </BlockStack>
                          </Card>
                        ))
                      ) : (
                        <Text as="p" tone="subdued">No diffs available</Text>
                      )}
                    </BlockStack>
                  )}
                  {selectedTab === 1 && (
                    <BlockStack gap="200">
                      {approval.evidence.samples && approval.evidence.samples.length > 0 ? (
                        approval.evidence.samples.map((sample, idx) => (
                          <Card key={idx}>
                            <BlockStack gap="200">
                              <Text variant="headingSm" as="h4">{sample.label}</Text>
                              <Text as="p">{sample.content}</Text>
                            </BlockStack>
                          </Card>
                        ))
                      ) : (
                        <Text as="p" tone="subdued">No samples available</Text>
                      )}
                    </BlockStack>
                  )}
                  {selectedTab === 2 && (
                    <BlockStack gap="200">
                      {approval.evidence.queries && approval.evidence.queries.length > 0 ? (
                        approval.evidence.queries.map((query, idx) => (
                          <Card key={idx}>
                            <InlineStack align="space-between" blockAlign="center">
                              <Text as="p">{query.label}</Text>
                              <Button url={query.url} external>View</Button>
                            </InlineStack>
                          </Card>
                        ))
                      ) : (
                        <Text as="p" tone="subdued">No queries available</Text>
                      )}
                    </BlockStack>
                  )}
                  {selectedTab === 3 && (
                    <BlockStack gap="200">
                      {approval.evidence.screenshots && approval.evidence.screenshots.length > 0 ? (
                        approval.evidence.screenshots.map((screenshot, idx) => (
                          <Card key={idx}>
                            <BlockStack gap="200">
                              <Text as="p">{screenshot.label}</Text>
                              <img src={screenshot.url} alt={screenshot.label} style={{ maxWidth: "100%", borderRadius: "var(--p-border-radius-200)" }} />
                            </BlockStack>
                          </Card>
                        ))
                      ) : (
                        <Text as="p" tone="subdued">No screenshots available</Text>
                      )}
                    </BlockStack>
                  )}
                </div>
              </Tabs>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="200">
              <Text variant="headingMd" as="h3">Projected Impact</Text>
              <Text as="p">{approval.projectedImpact}</Text>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h3">Risks & Rollback</Text>
              <BlockStack gap="200">
                {approval.risks.map((risk, idx) => (
                  <InlineStack key={idx} gap="200" align="start" blockAlign="center">
                    <Badge tone={riskColor[risk.level]}>{risk.level.toUpperCase()}</Badge>
                    <Text as="p">{risk.description}</Text>
                  </InlineStack>
                ))}
              </BlockStack>
              <Divider />
              <Text variant="headingSm" as="h4">Rollback Plan</Text>
              <BlockStack gap="100">
                {approval.rollback.steps.map((step, idx) => (
                  <Text key={idx} as="p">{idx + 1}. {step}</Text>
                ))}
                {approval.rollback.estimatedTime && (
                  <Text as="p" tone="subdued">Estimated time: {approval.rollback.estimatedTime}</Text>
                )}
              </BlockStack>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="400" data-testid="approval-grading">
              <Text variant="headingMd" as="h3">Grade Response Quality (1-5)</Text>
              <BlockStack gap="300">
                <div data-testid="grade-tone">
                  <Text as="p" variant="bodySm" tone="subdued">Tone: {toneGrade}/5</Text>
                  <RangeSlider label="Tone" labelHidden value={toneGrade} onChange={(v) => typeof v === 'number' && setToneGrade(v)} min={1} max={5} step={1} output />
                </div>
                <div data-testid="grade-accuracy">
                  <Text as="p" variant="bodySm" tone="subdued">Accuracy: {accuracyGrade}/5</Text>
                  <RangeSlider label="Accuracy" labelHidden value={accuracyGrade} onChange={(v) => typeof v === 'number' && setAccuracyGrade(v)} min={1} max={5} step={1} output />
                </div>
                <div data-testid="grade-policy">
                  <Text as="p" variant="bodySm" tone="subdued">Policy Compliance: {policyGrade}/5</Text>
                  <RangeSlider label="Policy" labelHidden value={policyGrade} onChange={(v) => typeof v === 'number' && setPolicyGrade(v)} min={1} max={5} step={1} output />
                </div>
              </BlockStack>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="400">
              <InlineStack gap="200">
                <Button variant="primary" tone="success" onClick={handleApprove} loading={loading} disabled={loading || !clientValidationOk}>Approve</Button>
                <Button onClick={onClose} disabled={loading}>Close</Button>
              </InlineStack>
              <Divider />
              <BlockStack gap="200">
                <Text variant="headingSm" as="h4">Or Reject</Text>
                <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Explain why this should be rejected..." style={{ width: "100%", minHeight: "80px", padding: "var(--p-space-300)", borderRadius: "var(--p-border-radius-200)", border: "1px solid var(--p-color-border)", fontFamily: "inherit" }} />
                <Button tone="critical" onClick={handleReject} disabled={!rejectReason.trim() || loading} loading={loading}>Reject</Button>
              </BlockStack>
            </BlockStack>
          </Card>
        </BlockStack>
      </div>
    </Modal>
  );
}

function getRiskLevel(tool: string): "low" | "medium" | "high" {
  const highRisk = ["send_email", "create_refund", "cancel_order"];
  const mediumRisk = ["create_private_note", "update_conversation"];
  if (highRisk.includes(tool)) return "high";
  if (mediumRisk.includes(tool)) return "medium";
  return "low";
}
