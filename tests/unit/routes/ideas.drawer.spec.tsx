import { describe, it, expect } from "vitest";
import { render, screen } from "../utils/render";
import { waitFor } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { IdeaDrawerHarness } from "../../../app/components/ideas/IdeaDrawerHarness";

// Contract test: Drawer open/close + Escape handling

describe("Ideas Drawer Harness", () => {
  it("opens the drawer when clicking button", async () => {
    render(<IdeaDrawerHarness />);

    const openBtn = screen.getByRole("button", { name: /open idea/i });
    openBtn.click();

    // Modal renders with title (wait for portal + transition)
    expect(await screen.findByText("Idea details")).toBeInTheDocument();
  });

  it("closes drawer on Escape key", async () => {
    render(<IdeaDrawerHarness />);
    screen.getByRole("button", { name: /open idea/i }).click();

    // Send Escape key against document
    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

    // Modal should close; wait for it to disappear
    await waitFor(() => expect(screen.queryByText("Idea details")).toBeNull());
  });
});
