import type { Meta, StoryObj } from "@storybook/react";
import { StockRiskTile } from "./StockRiskTile";

const meta: Meta<typeof StockRiskTile> = {
  title: "Dashboard/StockRiskTile",
  component: StockRiskTile,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof StockRiskTile>;

export const Default: Story = {
  args: { skuCount: 23, subtitle: "Low stock in last 7 days", trend: "down" },
};

export const Loading: Story = {
  args: { skuCount: 23, subtitle: "Low stock in last 7 days", trend: "down", loading: true },
};

export const Recovering: Story = {
  args: { skuCount: 8, subtitle: "Replenishing", trend: "up" },
};

