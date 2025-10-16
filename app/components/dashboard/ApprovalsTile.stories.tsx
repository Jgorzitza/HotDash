import type { Meta, StoryObj } from "@storybook/react";
import { ApprovalsTile } from "./ApprovalsTile";

const meta: Meta<typeof ApprovalsTile> = {
  title: "Dashboard/ApprovalsTile",
  component: ApprovalsTile,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ApprovalsTile>;

export const Default: Story = {
  args: { pendingCount: 7, filters: ["Evidence", "Rollback"] },
};

export const Loading: Story = {
  args: { pendingCount: 7, filters: ["Evidence", "Rollback"], loading: true },
};

export const NoFilters: Story = {
  args: { pendingCount: 3 },
};

