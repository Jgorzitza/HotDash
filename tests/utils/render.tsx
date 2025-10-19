import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render as rtlRender,
  RenderOptions,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { AppProvider } from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";

function Providers({ children }: { children: React.ReactNode }) {
  return <AppProvider i18n={en}>{children}</AppProvider>;
}

export function render(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return rtlRender(ui, {
    wrapper: Providers as React.ComponentType,
    ...options,
  });
}

export { act, cleanup, fireEvent, screen, waitFor, within };
