import type { Meta, StoryObj } from "@storybook/react";
import { CXTile } from "./CXTile";

const meta: Meta<typeof CXTile> = {
  title: "Dashboard/CXTile",
  component: CXTile,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CXTile>;

export const Default: Story = {
  args: { escalationCount: 5, slaStatus: "On track", trend: "neutral" },
};

export const Loading: Story = {
  args: { escalationCount: 5, slaStatus: "On track", trend: "neutral", loading: true },
};

export const BreachRisk: Story = {
  args: { escalationCount: 12, slaStatus: "Breach risk", trend: "down" },
};

