import { describe, expect, it, afterEach, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PolarisTestProvider } from "@shopify/polaris";

import {
  ApprovalsDrawer,
  type Approval,
} from "../../../../app/components/approvals/ApprovalsDrawer";

const baseApproval: Approval = {
  id: "approval-123",
  kind: "cx_reply",
  state: "pending_review",
  summary: "CX reply review",
  created_by: "ops@hotdash.ai",
  reviewer: "lead@hotdash.ai",
  evidence: {
    what_changes: "Introduce updated CX template",
  },
  impact: {
    expected_outcome: "Faster response times",
    metrics_affected: ["CSAT"],
  },
  risk: {
    what_could_go_wrong: "Incorrect tone",
    recovery_time: "< 5 minutes",
  },
  rollback: {
    steps: ["Restore previous template"],
  },
  actions: [
    {
      endpoint: "/api/chatwoot/send-reply",
      payload: { conversationId: 123 },
    },
  ],
  receipts: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <PolarisTestProvider>{children}</PolarisTestProvider>
);

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("ApprovalsDrawer", () => {
  it("disables approve button when required evidence is missing", () => {
    const approval: Approval = {
      ...baseApproval,
      evidence: {},
      rollback: { steps: [] },
    };

    render(
      <ApprovalsDrawer
        open
        approval={approval}
        onClose={vi.fn()}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onRequestChanges={vi.fn()}
      />,
      { wrapper },
    );

    const approveButton = screen.getByRole("button", { name: /approve/i });
    expect(approveButton).toHaveAttribute("aria-disabled", "true");
    expect(approveButton).toHaveAttribute("tabindex", "-1");
  });

  it("validates before approving a CX reply", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ valid: true, errors: [], warnings: [] }),
    }) as unknown as typeof fetch;

    const onApprove = vi.fn();

    render(
      <ApprovalsDrawer
        open
        approval={baseApproval}
        onClose={vi.fn()}
        onApprove={onApprove}
        onReject={vi.fn()}
        onRequestChanges={vi.fn()}
      />,
      { wrapper },
    );

    const approveButton = screen.getByRole("button", { name: /approve/i });
    expect(approveButton).toBeEnabled();

    await userEvent.click(approveButton);

    await waitFor(() => {
      expect(onApprove).toHaveBeenCalledWith({
        tone: 3,
        accuracy: 3,
        policy: 3,
      });
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `/api/approvals/${baseApproval.id}/validate`,
    );
  });
});
