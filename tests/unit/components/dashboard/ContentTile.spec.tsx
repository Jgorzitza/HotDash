/**
 * Content Tile Component Tests
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "../../../utils/render";
import {
  ContentTile,
  getContentTileMockData,
} from "~/components/dashboard/ContentTile";

describe("ContentTile", () => {
  it("renders posts published count", () => {
    const data = getContentTileMockData();
    render(<ContentTile data={data} />);

    expect(screen.getByText(/Posts published/i)).toBeInTheDocument();
  });

  it("shows engagement badge", () => {
    const data = getContentTileMockData();
    render(<ContentTile data={data} />);

    expect(
      screen.getByText(/Exceptional|Above Target|At Target|Below Target/i),
    ).toBeInTheDocument();
  });
});
