import type { Meta, StoryObj } from "@storybook/react";
import { SEOTile } from "./SEOTile";

const meta: Meta<typeof SEOTile> = {
  title: "Dashboard/SEOTile",
  component: SEOTile,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SEOTile>;

export const Default: Story = {
  args: { alertCount: 7, topAlert: "Critical SEO issue detected", trend: "down" },
};

export const Loading: Story = {
  args: { alertCount: 7, topAlert: "Critical SEO issue detected", trend: "down", loading: true },
};

export const TrendUp: Story = {
  args: { alertCount: 2, topAlert: "All clear", trend: "up" },
};

