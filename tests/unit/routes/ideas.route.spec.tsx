import { describe, it, expect } from "vitest";
import { render, screen } from "../utils/render";
import IdeasRoute from "../../../app/routes/ideas/route";

describe("/ideas route", () => {
  it("renders and shows Open Idea button", async () => {
    render(<IdeasRoute />);
    expect(screen.getByTestId("ideas-page")).toBeInTheDocument();
    // Button label from harness
    expect(
      screen.getByRole("button", { name: /open idea/i }),
    ).toBeInTheDocument();
  });
});
