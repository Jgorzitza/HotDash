import type { Meta, StoryObj } from "@storybook/react";
import { RevenueTile } from "./RevenueTile";

const meta: Meta<typeof RevenueTile> = {
  title: "Dashboard/RevenueTile",
  component: RevenueTile,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RevenueTile>;

export const Default: Story = {
  args: { value: "$8,425.50", orderCount: 58, trend: "up" },
};

export const Loading: Story = {
  args: { value: "$8,425.50", orderCount: 58, trend: "up", loading: true },
};

export const TrendDown: Story = {
  args: { value: "$6,200.00", orderCount: 42, trend: "down" },
};
