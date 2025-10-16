import type { Meta, StoryObj } from "@storybook/react";
import { ApprovalsDrawer } from "./ApprovalsDrawer";
import { mockApprovalDetails } from "../../fixtures/approvals";

const meta: Meta<typeof ApprovalsDrawer> = {
  title: "Approvals/ApprovalsDrawer",
  component: ApprovalsDrawer,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ApprovalsDrawer>;

export const Open: Story = {
  args: { open: true, approval: mockApprovalDetails[0], onClose: () => {} },
};

export const Closed: Story = {
  args: { open: false, approval: mockApprovalDetails[0], onClose: () => {} },
};
