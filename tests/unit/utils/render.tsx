import React from "react";
import { render as rtlRender, screen } from "@testing-library/react";
import { AppProvider } from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";

function Providers({ children }: { children: React.ReactNode }) {
  return <AppProvider i18n={en as any}>{children}</AppProvider>;
}

// Render helper that wraps components with Polaris AppProvider
export function render(ui: React.ReactElement) {
  return rtlRender(<Providers>{ui}</Providers>);
}

export { screen };
