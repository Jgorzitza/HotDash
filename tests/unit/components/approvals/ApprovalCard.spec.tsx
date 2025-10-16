import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApprovalCard } from "../../../../app/components/ApprovalCard";
import React from "react";
import { AppProvider } from "@shopify/polaris";

function renderWithPolaris(ui: React.ReactElement) {
  return render(<AppProvider i18n={{}}>{ui}</AppProvider>);
}

const mockApproval = {
  id: "appr_123",
  conversationId: 12345,
  createdAt: new Date().toISOString(),
  pending: [
    {
      agent: "ai-customer",
      tool: "create_private_note",
      args: { message: "Hello" },
    },
  ],
};

describe("ApprovalCard", () => {
  const originalFetch = global.fetch;
  const originalLocation = window.location;

  beforeEach(() => {
    // Redefine location with a mockable reload
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, reload: vi.fn() },
      writable: true,
      configurable: true,
    });
  });
  beforeEach(() => {
    // Ensure matchMedia is always stubbed before rendering Polaris
    // @ts-expect-error test env shim
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });


  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = originalFetch as any;
    Object.defineProperty(window, 'location', { value: originalLocation });
  });

  it("shows loading on approve and disables reject", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    renderWithPolaris(<ApprovalCard approval={mockApproval} />);

    const approveBtn = screen.getByRole('button', { name: /approve/i });
    const rejectBtn = screen.getByRole('button', { name: /reject/i });

    fireEvent.click(approveBtn);

    expect(approveBtn).toHaveAttribute('aria-disabled', 'true');
    expect(rejectBtn).toHaveAttribute('aria-disabled', 'true');

    await waitFor(() => {
      expect(window.location.reload).toHaveBeenCalled();
    });
  });

  it("shows error banner when approve fails", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 500, text: () => Promise.resolve("server error") });

    renderWithPolaris(<ApprovalCard approval={mockApproval} />);

    const approveBtn = screen.getByRole('button', { name: /approve/i });
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Request failed \(500\)/i)).toBeInTheDocument();
    });
  });

  it("shows loading on reject and disables approve", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    renderWithPolaris(<ApprovalCard approval={mockApproval} />);

    const approveBtn = screen.getByRole('button', { name: /approve/i });
    const rejectBtn = screen.getByRole('button', { name: /reject/i });

    fireEvent.click(rejectBtn);

    expect(approveBtn).toHaveAttribute('aria-disabled', 'true');
    expect(rejectBtn).toHaveAttribute('aria-disabled', 'true');

    await waitFor(() => {
      expect(window.location.reload).toHaveBeenCalled();
    });
  });
});

