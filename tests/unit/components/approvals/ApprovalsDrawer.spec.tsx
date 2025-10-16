import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ApprovalsDrawer } from "../../../../app/components/approvals/ApprovalsDrawer";
import { mockApprovalDetails } from "../../../../app/fixtures/approvals";

import { AppProvider } from "@shopify/polaris";
import React from "react";

function renderWithPolaris(ui: React.ReactElement) {
  return render(<AppProvider i18n={{}}>{ui}</AppProvider>);
}

describe("ApprovalsDrawer", () => {
  it("should not render when closed", () => {
    renderWithPolaris(<ApprovalsDrawer open={false} approval={mockApprovalDetails[0]} onClose={vi.fn()} />);
    expect(screen.queryByText(/Conversation #12345/)).not.toBeInTheDocument();
  });

  it("should render when open with approval data", () => {
    renderWithPolaris(<ApprovalsDrawer open={true} approval={mockApprovalDetails[0]} onClose={vi.fn()} />);
    expect(screen.getByText(/Conversation #12345/)).toBeInTheDocument();
    expect(screen.getByText(/ai-customer/)).toBeInTheDocument();
  });

  it("should display evidence summary", () => {
    renderWithPolaris(<ApprovalsDrawer open={true} approval={mockApprovalDetails[0]} onClose={vi.fn()} />);
    expect(screen.getByText(/Customer requested shipping update/)).toBeInTheDocument();
  });

  it("should display projected impact", () => {
    renderWithPolaris(<ApprovalsDrawer open={true} approval={mockApprovalDetails[0]} onClose={vi.fn()} />);
    expect(screen.getByText(/Projected Impact/)).toBeInTheDocument();
    expect(screen.getByText(/Customer will receive tracking info/)).toBeInTheDocument();
  });

  it("should display risks with badges", () => {
    renderWithPolaris(<ApprovalsDrawer open={true} approval={mockApprovalDetails[0]} onClose={vi.fn()} />);
    expect(screen.getByText(/Risks & Rollback/)).toBeInTheDocument();
    expect(screen.getByText(/Tracking number may not be active/)).toBeInTheDocument();
  });

  it("should display rollback plan", () => {
    renderWithPolaris(<ApprovalsDrawer open={true} approval={mockApprovalDetails[0]} onClose={vi.fn()} />);
    expect(screen.getByText(/Rollback Plan/)).toBeInTheDocument();
    expect(screen.getByText(/1\. Send follow-up email with apology/)).toBeInTheDocument();
    expect(screen.getByText(/Estimated time: 5 minutes/)).toBeInTheDocument();
  });

  it("should display grading sliders", () => {
    renderWithPolaris(<ApprovalsDrawer open={true} approval={mockApprovalDetails[0]} onClose={vi.fn()} />);
    expect(screen.getByText(/Grade Response Quality/)).toBeInTheDocument();
    expect(screen.getByText(/Tone:/)).toBeInTheDocument();
    expect(screen.getByText(/Accuracy:/)).toBeInTheDocument();
    expect(screen.getByText(/Policy Compliance:/)).toBeInTheDocument();
  });

  it("should handle null approval gracefully", () => {
    renderWithPolaris(<ApprovalsDrawer open={true} approval={null} onClose={vi.fn()} />);
    expect(screen.queryByText(/Conversation/)).not.toBeInTheDocument();
  });
});

  it("should trigger approve on Enter when valid", async () => {
    const onApprove = vi.fn().mockResolvedValue(undefined);
    renderWithPolaris(
      <ApprovalsDrawer open={true} approval={mockApprovalDetails[0]} onClose={vi.fn()} onApprove={onApprove} />
    );
    const root = screen.getByTestId('approvals-drawer');
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(onApprove).toHaveBeenCalledTimes(1);
  });

  it("should load persisted grades from localStorage", () => {
    localStorage.setItem(
      `approvalGrades:${mockApprovalDetails[0].id}`,
      JSON.stringify({ tone: 5, accuracy: 4, policy: 3 })
    );
    renderWithPolaris(
      <ApprovalsDrawer open={true} approval={mockApprovalDetails[0]} onClose={vi.fn()} />
    );
    expect(screen.getByText(/Tone: 5\/5/)).toBeInTheDocument();
    expect(screen.getByText(/Accuracy: 4\/5/)).toBeInTheDocument();
    expect(screen.getByText(/Policy Compliance: 3\/5/)).toBeInTheDocument();
  });

