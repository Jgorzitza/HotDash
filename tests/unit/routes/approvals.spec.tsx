import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import ApprovalsRoute, { loader } from "../../app/routes/approvals";
import { mockApprovals, mockEmptyApprovals } from "../../app/fixtures/approvals";

describe("Approvals Route", () => {
  it("should load fixture data in dev mode", async () => {
    const request = new Request("http://localhost:3000/approvals");
    const response = await loader({ request, params: {}, context: {} });
    const data = await response.json();

    expect(data.mode).toBe("dev:test");
    expect(data.approvals).toBeDefined();
    expect(data.approvals.length).toBeGreaterThan(0);
  });

  it("should render approval queue with approvals", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: <ApprovalsRoute />,
          loader: () => ({ approvals: mockApprovals, mode: "dev:test" }),
        },
      ],
      {
        initialEntries: ["/"],
      }
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText("Approval Queue")).toBeInTheDocument();
    expect(screen.getByText(/pending approval/)).toBeInTheDocument();
  });

  it("should show empty state when no approvals", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: <ApprovalsRoute />,
          loader: () => ({ approvals: mockEmptyApprovals, mode: "dev:test" }),
        },
      ],
      {
        initialEntries: ["/"],
      }
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText("All clear\!")).toBeInTheDocument();
    expect(screen.getByText("No pending approvals. Check back later.")).toBeInTheDocument();
  });

  it("should show dev mode banner", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: <ApprovalsRoute />,
          loader: () => ({ approvals: mockApprovals, mode: "dev:test" }),
        },
      ],
      {
        initialEntries: ["/"],
      }
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText(/Dev Mode:/)).toBeInTheDocument();
    expect(screen.getByText(/Displaying fixture data only/)).toBeInTheDocument();
  });
});
