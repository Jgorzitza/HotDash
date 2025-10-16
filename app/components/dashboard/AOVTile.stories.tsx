import type { Meta, StoryObj } from "@storybook/react";
import { AOVTile } from "./AOVTile";

const meta: Meta<typeof AOVTile> = {
  title: "Dashboard/AOVTile",
  component: AOVTile,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AOVTile>;

export const Default: Story = {
  args: { value: "$145.27", trend: "up", percentChange: "+12%" },
};

export const Loading: Story = {
  args: { value: "$145.27", trend: "up", percentChange: "+12%", loading: true },
};
