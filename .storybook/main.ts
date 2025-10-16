import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../app/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [],
  framework: { name: "@storybook/react-vite", options: { builder: { viteConfigPath: ".storybook/vite.config.ts" } } },
  async viteFinal(baseConfig) {
    // Remove React Router plugin from user Vite config to avoid Storybook preview build error
    if (Array.isArray((baseConfig as any).plugins)) {
      (baseConfig as any).plugins = (baseConfig as any).plugins.filter((p: any) => {
        const name = (p && (p.name || p?.name?.toString())) || "";
        return typeof name === "string" ? !name.includes("react-router") : true;
      });
    }
    return baseConfig;
  },
};

export default config;
