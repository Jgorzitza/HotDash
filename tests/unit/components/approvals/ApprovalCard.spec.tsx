import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ApprovalCard } from "../../../app/components/approvals/ApprovalCard";
import { mockApprovals } from "../../../app/fixtures/approvals";

vi.mock("react-router", () => ({
  useSubmit: () => vi.fn(),
}));

global.fetch = vi.fn();

describe("ApprovalCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render approval card with conversation ID", () => {
    render(<ApprovalCard approval={mockApprovals[0]} />);
    expect(screen.getByText(/Conversation #12345/)).toBeInTheDocument();
  });

  it("should display agent and tool information", () => {
    render(<ApprovalCard approval={mockApprovals[0]} />);
    expect(screen.getByText(/Agent:/)).toBeInTheDocument();
    expect(screen.getByText("ai-customer")).toBeInTheDocument();
    expect(screen.getByText(/Tool:/)).toBeInTheDocument();
    expect(screen.getByText("chatwoot.reply.fromNote")).toBeInTheDocument();
  });

  it("should show HIGH RISK badge for chatwoot tools", () => {
    render(<ApprovalCard approval={mockApprovals[0]} />);
    expect(screen.getByText("HIGH RISK")).toBeInTheDocument();
  });

  it("should display approve and reject buttons", () => {
    render(<ApprovalCard approval={mockApprovals[0]} />);
    expect(screen.getByText("Approve")).toBeInTheDocument();
    expect(screen.getByText("Reject")).toBeInTheDocument();
  });

  it("should call approve endpoint when approve button clicked", async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: true });

    render(<ApprovalCard approval={mockApprovals[0]} />);

    const approveButton = screen.getByText("Approve");
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/approvals/approval-001/0/approve",
        { method: "POST" }
      );
    });
  });

  it("should show error banner when approve fails", async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: false });

    render(<ApprovalCard approval={mockApprovals[0]} />);

    const approveButton = screen.getByText("Approve");
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(screen.getByText("Failed to approve. Please try again.")).toBeInTheDocument();
    });
  });
});
