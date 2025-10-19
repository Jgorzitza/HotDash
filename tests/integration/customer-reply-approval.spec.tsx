/**
 * Integration tests for Customer Reply Approval HITL flow
 *
 * Tests end-to-end approval workflow:
 * - Draft display with context
 * - Grading UI interaction
 * - Approval/rejection flow
 * - Evidence logging
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CustomerReplyApproval } from "~/components/CustomerReplyApproval";
import type { ReplyDraft } from "~/agents/customer/draft-generator";
import type { CustomerReplyGrading } from "~/agents/customer/grading-schema";

describe("CustomerReplyApproval Integration", () => {
  const mockDraft: ReplyDraft = {
    conversationId: "conv-123",
    context: [
      "[customer] I need help with my order #12345",
      "[agent] I'll look into that for you",
      "[customer] When will it ship?",
    ],
    suggestedReply:
      "Thanks for reaching out! Your order will ship within 2-3 business days.",
    evidence: {
      ragSources: ["shipping-policy", "order-processing"],
      confidence: 0.85,
    },
    risk: "Standard customer inquiry",
    rollback: "Delete Private Note if draft is rejected",
  };

  const mockOnApprove = vi.fn();
  const mockOnReject = vi.fn();

  beforeEach(() => {
    mockOnApprove.mockClear();
    mockOnReject.mockClear();
  });

  describe("Draft Display", () => {
    it("should display conversation context", () => {
      render(
        <CustomerReplyApproval
          draft={mockDraft}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />,
      );

      expect(
        screen.getByText(/I need help with my order/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/When will it ship/i)).toBeInTheDocument();
    });

    it("should display AI suggested reply", () => {
      render(
        <CustomerReplyApproval
          draft={mockDraft}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />,
      );

      expect(
        screen.getByDisplayValue(/Your order will ship/i),
      ).toBeInTheDocument();
    });

    it("should display confidence badge", () => {
      render(
        <CustomerReplyApproval
          draft={mockDraft}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />,
      );

      expect(screen.getByText(/85% confidence/i)).toBeInTheDocument();
    });

    it("should display RAG sources when available", () => {
      render(
        <CustomerReplyApproval
          draft={mockDraft}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />,
      );

      expect(
        screen.getByText(/shipping-policy, order-processing/i),
      ).toBeInTheDocument();
    });

    it("should display risk assessment", () => {
      render(
        <CustomerReplyApproval
          draft={mockDraft}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />,
      );

      expect(
        screen.getByText(/Standard customer inquiry/i),
      ).toBeInTheDocument();
    });
  });

  describe("Grading UI", () => {
    it("should render all three grading fields", () => {
      render(
        <CustomerReplyApproval
          draft={mockDraft}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />,
      );

      expect(screen.getByLabelText(/Tone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Accuracy/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Policy/i)).toBeInTheDocument();
    });

    it("should default grading scores to 4", () => {
      render(
        <CustomerReplyApproval
          draft={mockDraft}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />,
      );

      const toneInput = screen.getByLabelText(/Tone/i) as HTMLInputElement;
      expect(toneInput.value).toBe("4");
    });

    it("should allow updating grading scores", async () => {
      render(
        <CustomerReplyApproval
          draft={mockDraft}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />,
      );

      const toneInput = screen.getByLabelText(/Tone/i);
      fireEvent.change(toneInput, { target: { value: "5" } });

      await waitFor(() => {
        expect((toneInput as HTMLInputElement).value).toBe("5");
      });
    });

    it("should clamp grading scores to 1-5 range", async () => {
      render(
        <CustomerReplyApproval
          draft={mockDraft}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />,
      );

      const toneInput = screen.getByLabelText(/Tone/i);

      // Test upper bound
      fireEvent.change(toneInput, { target: { value: "10" } });
      await waitFor(() => {
        expect((toneInput as HTMLInputElement).value).toBe("5");
      });

      // Test lower bound
      fireEvent.change(toneInput, { target: { value: "0" } });
      await waitFor(() => {
        expect((toneInput as HTMLInputElement).value).toBe("1");
      });
    });
  });

  describe("Reply Editing", () => {
    it("should allow editing the suggested reply", async () => {
      render(
        <CustomerReplyApproval
          draft={mockDraft}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />,
      );

      const replyInput = screen.getByLabelText(/Reply/i) as HTMLTextAreaElement;
      const newReply = "Thanks! Your order ships tomorrow.";

      fireEvent.change(replyInput, { target: { value: newReply } });

      await waitFor(() => {
        expect(replyInput.value).toBe(newReply);
      });
    });
  });

  describe("Approval Flow", () => {
    it("should call onApprove with grading metadata", async () => {
      render(
        <CustomerReplyApproval
          draft={mockDraft}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />,
      );

      const approveButton = screen.getByText(/Approve & Send/i);
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(mockOnApprove).toHaveBeenCalledTimes(1);
        const gradingData = mockOnApprove.mock.calls[0][0] as Omit<
          CustomerReplyGrading,
          "id" | "created_at" | "graded_at"
        >;

        expect(gradingData.conversation_id).toBe("conv-123");
        expect(gradingData.draft_reply).toBe(mockDraft.suggestedReply);
        expect(gradingData.tone).toBe(4);
        expect(gradingData.accuracy).toBe(4);
        expect(gradingData.policy).toBe(4);
        expect(gradingData.approved).toBe(true);
        expect(gradingData.confidence).toBe(0.85);
      });
    });

    it("should include edited reply in approval data", async () => {
      render(
        <CustomerReplyApproval
          draft={mockDraft}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />,
      );

      const replyInput = screen.getByLabelText(/Reply/i);
      const editedReply = "Thanks! I've expedited your order.";
      fireEvent.change(replyInput, { target: { value: editedReply } });

      const approveButton = screen.getByText(/Approve & Send/i);
      fireEvent.click(approveButton);

      await waitFor(() => {
        const gradingData = mockOnApprove.mock.calls[0][0] as Omit<
          CustomerReplyGrading,
          "id" | "created_at" | "graded_at"
        >;
        expect(gradingData.human_reply).toBe(editedReply);
      });
    });

    it("should disable buttons while processing", async () => {
      mockOnApprove.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      render(
        <CustomerReplyApproval
          draft={mockDraft}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />,
      );

      const approveButton = screen.getByText(/Approve & Send/i);
      fireEvent.click(approveButton);

      // Button should show loading state
      expect(approveButton).toBeDisabled();

      await waitFor(() => {
        expect(mockOnApprove).toHaveBeenCalled();
      });
    });
  });

  describe("Rejection Flow", () => {
    it("should call onReject with grading metadata", async () => {
      render(
        <CustomerReplyApproval
          draft={mockDraft}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />,
      );

      const rejectButton = screen.getByText(/Reject & Manual Reply/i);
      fireEvent.click(rejectButton);

      await waitFor(() => {
        expect(mockOnReject).toHaveBeenCalledTimes(1);
        const gradingData = mockOnReject.mock.calls[0][0] as Omit<
          CustomerReplyGrading,
          "id" | "created_at" | "graded_at"
        >;

        expect(gradingData.approved).toBe(false);
      });
    });

    it("should include custom grading scores in rejection", async () => {
      render(
        <CustomerReplyApproval
          draft={mockDraft}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />,
      );

      // Set custom grades
      const toneInput = screen.getByLabelText(/Tone/i);
      const accuracyInput = screen.getByLabelText(/Accuracy/i);

      fireEvent.change(toneInput, { target: { value: "2" } });
      fireEvent.change(accuracyInput, { target: { value: "3" } });

      const rejectButton = screen.getByText(/Reject & Manual Reply/i);
      fireEvent.click(rejectButton);

      await waitFor(() => {
        const gradingData = mockOnReject.mock.calls[0][0] as Omit<
          CustomerReplyGrading,
          "id" | "created_at" | "graded_at"
        >;
        expect(gradingData.tone).toBe(2);
        expect(gradingData.accuracy).toBe(3);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle draft with no RAG sources", () => {
      const draftNoRAG: ReplyDraft = {
        ...mockDraft,
        evidence: { confidence: 0.5 },
      };

      render(
        <CustomerReplyApproval
          draft={draftNoRAG}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />,
      );

      // Should not show RAG sources section
      expect(screen.queryByText(/Sources:/i)).not.toBeInTheDocument();
    });

    it("should show low confidence badge for confidence < 60%", () => {
      const lowConfidenceDraft: ReplyDraft = {
        ...mockDraft,
        evidence: { confidence: 0.5 },
      };

      render(
        <CustomerReplyApproval
          draft={lowConfidenceDraft}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />,
      );

      const badge = screen.getByText(/50% confidence/i);
      expect(badge).toHaveClass("critical"); // Assuming Polaris badge tone maps to class
    });
  });
});
