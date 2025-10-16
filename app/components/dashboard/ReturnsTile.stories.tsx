import type { Meta, StoryObj } from "@storybook/react";
import { ReturnsTile } from "./ReturnsTile";

const meta: Meta<typeof ReturnsTile> = {
  title: "Dashboard/ReturnsTile",
  component: ReturnsTile,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ReturnsTile>;

export const Default: Story = {
  args: { count: 15, pendingReview: 3, trend: "up" },
};

export const Loading: Story = {
  args: { count: 15, pendingReview: 3, trend: "up", loading: true },
};

export const TrendDown: Story = {
  args: { count: 9, pendingReview: 1, trend: "down" },
};

