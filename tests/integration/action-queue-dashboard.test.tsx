/**
 * Integration Tests: Action Queue Dashboard
 * 
 * DESIGNER-GE-002: Action Queue Dashboard UI
 * 
 * Tests the Action Queue Dashboard UI components and functionality
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import ActionQueueDashboard, { loader } from "~/routes/admin.action-queue";
import { ActionQueueService } from "~/services/action-queue/action-queue.service";
import type { ActionQueueItem } from "~/lib/growth-engine/action-queue";

// Mock ActionQueueService
vi.mock("~/services/action-queue/action-queue.service");

// Mock fetch
global.fetch = vi.fn();

describe("Action Queue Dashboard", () => {
  const mockActions: ActionQueueItem[] = [
    {
      id: "action-1",
      type: "seo_fix",
      target: "/products/powder-board",
      draft: "Update meta description to include target keywords",
      evidence: {
        mcp_request_ids: ["req-001"],
        dataset_links: ["gsc-data-001"],
        telemetry_refs: ["tel-001"],
      },
      expected_impact: {
        metric: "revenue",
        delta: 500,
        unit: "$",
      },
      confidence: 0.85,
      ease: "simple",
      risk_tier: "none",
      can_execute: true,
      rollback_plan: "Revert meta description to previous value",
      freshness_label: "GSC 48-72h lag",
      agent: "seo-agent",
      score: 425,
      status: "pending",
      created_at: new Date("2025-10-24"),
      updated_at: new Date("2025-10-24"),
    },
    {
      id: "action-2",
      type: "inventory_risk",
      target: "SKU-12345",
      draft: "Reorder 50 units to prevent stockout",
      evidence: {
        mcp_request_ids: ["req-002"],
        dataset_links: ["inventory-data-001"],
        telemetry_refs: ["tel-002"],
      },
      expected_impact: {
        metric: "revenue",
        delta: 1200,
        unit: "$",
      },
      confidence: 0.92,
      ease: "medium",
      risk_tier: "safety",
      can_execute: true,
      rollback_plan: "Cancel PO if not yet shipped",
      freshness_label: "Real-time",
      agent: "inventory-agent",
      score: 1104,
      status: "pending",
      created_at: new Date("2025-10-24"),
      updated_at: new Date("2025-10-24"),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (ActionQueueService.getTopActions as any).mockResolvedValue(mockActions);
  });

  describe("Loader", () => {
    it("should fetch top 10 actions", async () => {
      const request = new Request("http://localhost/admin/action-queue");
      const response = await loader({ request, params: {}, context: {} });
      const data = await response.json();

      expect(ActionQueueService.getTopActions).toHaveBeenCalledWith(10);
      expect(data.actions).toEqual(mockActions);
      expect(data.total).toBe(2);
      expect(data.error).toBeNull();
    });

    it("should handle errors gracefully", async () => {
      (ActionQueueService.getTopActions as any).mockRejectedValue(
        new Error("Database error")
      );

      const request = new Request("http://localhost/admin/action-queue");
      const response = await loader({ request, params: {}, context: {} });
      const data = await response.json();

      expect(data.actions).toEqual([]);
      expect(data.total).toBe(0);
      expect(data.error).toBe("Database error");
    });
  });

  describe("Action Queue Table", () => {
    it("should render table with actions", async () => {
      const router = createMemoryRouter(
        [
          {
            path: "/admin/action-queue",
            element: <ActionQueueDashboard />,
            loader: () => ({
              actions: mockActions,
              total: 2,
              error: null,
            }),
          },
        ],
        { initialEntries: ["/admin/action-queue"] }
      );

      render(<RouterProvider router={router} />);

      await waitFor(() => {
        expect(screen.getByText("Action Queue")).toBeInTheDocument();
        expect(screen.getByText("2 recommended actions")).toBeInTheDocument();
      });

      // Check table headers
      expect(screen.getByText("#")).toBeInTheDocument();
      expect(screen.getByText("Action")).toBeInTheDocument();
      expect(screen.getByText("Target")).toBeInTheDocument();
      expect(screen.getByText("Impact")).toBeInTheDocument();
      expect(screen.getByText("Confidence")).toBeInTheDocument();
      expect(screen.getByText("Ease")).toBeInTheDocument();
      expect(screen.getByText("Freshness")).toBeInTheDocument();
      expect(screen.getByText("Actions")).toBeInTheDocument();

      // Check action rows
      expect(screen.getByText("Seo Fix")).toBeInTheDocument();
      expect(screen.getByText("Inventory Risk")).toBeInTheDocument();
      expect(screen.getByText("$500")).toBeInTheDocument();
      expect(screen.getByText("$1200")).toBeInTheDocument();
      expect(screen.getByText("85%")).toBeInTheDocument();
      expect(screen.getByText("92%")).toBeInTheDocument();
    });

    it("should show empty state when no actions", async () => {
      const router = createMemoryRouter(
        [
          {
            path: "/admin/action-queue",
            element: <ActionQueueDashboard />,
            loader: () => ({
              actions: [],
              total: 0,
              error: null,
            }),
          },
        ],
        { initialEntries: ["/admin/action-queue"] }
      );

      render(<RouterProvider router={router} />);

      await waitFor(() => {
        expect(screen.getByText("No Actions in Queue")).toBeInTheDocument();
        expect(
          screen.getByText(
            "All actions have been processed. Check back later for new recommendations."
          )
        ).toBeInTheDocument();
      });
    });

    it("should show error banner when error occurs", async () => {
      const router = createMemoryRouter(
        [
          {
            path: "/admin/action-queue",
            element: <ActionQueueDashboard />,
            loader: () => ({
              actions: [],
              total: 0,
              error: "Database connection failed",
            }),
          },
        ],
        { initialEntries: ["/admin/action-queue"] }
      );

      render(<RouterProvider router={router} />);

      await waitFor(() => {
        expect(
          screen.getByText("Error loading actions: Database connection failed")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Action Buttons", () => {
    it("should call approve API when Approve button clicked", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const router = createMemoryRouter(
        [
          {
            path: "/admin/action-queue",
            element: <ActionQueueDashboard />,
            loader: () => ({
              actions: mockActions,
              total: 2,
              error: null,
            }),
          },
        ],
        { initialEntries: ["/admin/action-queue"] }
      );

      render(<RouterProvider router={router} />);

      await waitFor(() => {
        expect(screen.getAllByText("Approve")[0]).toBeInTheDocument();
      });

      const approveButtons = screen.getAllByText("Approve");
      fireEvent.click(approveButtons[0]);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/action-queue/action-1/approve",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
          })
        );
      });
    });

    it("should call dismiss API when Dismiss button clicked", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const router = createMemoryRouter(
        [
          {
            path: "/admin/action-queue",
            element: <ActionQueueDashboard />,
            loader: () => ({
              actions: mockActions,
              total: 2,
              error: null,
            }),
          },
        ],
        { initialEntries: ["/admin/action-queue"] }
      );

      render(<RouterProvider router={router} />);

      await waitFor(() => {
        expect(screen.getAllByText("Dismiss")[0]).toBeInTheDocument();
      });

      const dismissButtons = screen.getAllByText("Dismiss");
      fireEvent.click(dismissButtons[0]);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/action-queue/action-1/dismiss",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
          })
        );
      });
    });

    it("should open modal when Edit button clicked", async () => {
      const router = createMemoryRouter(
        [
          {
            path: "/admin/action-queue",
            element: <ActionQueueDashboard />,
            loader: () => ({
              actions: mockActions,
              total: 2,
              error: null,
            }),
          },
        ],
        { initialEntries: ["/admin/action-queue"] }
      );

      render(<RouterProvider router={router} />);

      await waitFor(() => {
        expect(screen.getAllByText("Edit")[0]).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText("Edit");
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Seo Fix")).toBeInTheDocument();
        expect(
          screen.getByText("Update meta description to include target keywords")
        ).toBeInTheDocument();
        expect(
          screen.getByText("Revert meta description to previous value")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Action Details Modal", () => {
    it("should display all action details", async () => {
      const router = createMemoryRouter(
        [
          {
            path: "/admin/action-queue",
            element: <ActionQueueDashboard />,
            loader: () => ({
              actions: mockActions,
              total: 2,
              error: null,
            }),
          },
        ],
        { initialEntries: ["/admin/action-queue"] }
      );

      render(<RouterProvider router={router} />);

      await waitFor(() => {
        expect(screen.getAllByText("Edit")[0]).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText("Edit");
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        // Check modal content
        expect(screen.getByText("What will change:")).toBeInTheDocument();
        expect(screen.getByText("Target:")).toBeInTheDocument();
        expect(screen.getByText("Expected Impact:")).toBeInTheDocument();
        expect(screen.getByText("Evidence:")).toBeInTheDocument();
        expect(screen.getByText("Rollback Plan:")).toBeInTheDocument();

        // Check values
        expect(
          screen.getByText("Update meta description to include target keywords")
        ).toBeInTheDocument();
        expect(screen.getByText("/products/powder-board")).toBeInTheDocument();
        expect(screen.getByText("$500 in revenue")).toBeInTheDocument();
        expect(screen.getByText("MCP Requests: req-001")).toBeInTheDocument();
        expect(
          screen.getByText("Revert meta description to previous value")
        ).toBeInTheDocument();
      });
    });
  });
});

