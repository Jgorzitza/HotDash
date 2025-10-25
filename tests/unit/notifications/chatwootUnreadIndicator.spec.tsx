import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChatwootUnreadIndicator } from "../../../app/components/notifications/ChatwootUnreadIndicator";

describe("ChatwootUnreadIndicator", () => {
  it("renders a badge when unread count is greater than zero", () => {
    render(<ChatwootUnreadIndicator count={3} />);

    const badge = screen.getByTestId("chatwoot-unread-indicator");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("3");
    expect(badge.querySelector("s-badge")).not.toBeNull();
  });

  it("caps the display at 99+", () => {
    render(<ChatwootUnreadIndicator count={150} />);

    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("renders nothing when count is zero or undefined", () => {
    const { container: zeroContainer } = render(<ChatwootUnreadIndicator count={0} />);
    expect(zeroContainer.firstChild).toBeNull();

    const { container: undefinedContainer } = render(<ChatwootUnreadIndicator />);
    expect(undefinedContainer.firstChild).toBeNull();
  });
});
