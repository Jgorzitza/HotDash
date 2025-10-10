import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CXEscalationsTile } from "../../app/components/tiles/CXEscalationsTile";

const conversations = [
  {
    id: 101,
    inboxId: 1,
    status: "open",
    customerName: "Jamie Lee",
    createdAt: new Date().toISOString(),
    breachedAt: new Date().toISOString(),
    lastMessageAt: new Date().toISOString(),
    slaBreached: true,
    tags: ["priority"],
    suggestedReplyId: "ack_delay",
    suggestedReply: "Thanks for your patience!",
    messages: [],
    aiSuggestion: null,
    aiSuggestionEnabled: false,
  },
];

describe("CXEscalationsTile", () => {
  it("renders list without modal trigger when disabled", () => {
    render(<CXEscalationsTile conversations={conversations} enableModal={false} />);

    expect(screen.getByText(/Jamie Lee/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /review/i })).toBeNull();
  });

  it("renders modal trigger when enabled", () => {
    render(<CXEscalationsTile conversations={conversations} enableModal />);

    expect(screen.getByRole("button", { name: /review/i })).toBeInTheDocument();
  });
});
