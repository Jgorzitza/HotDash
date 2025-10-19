import type { ReactNode } from "react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";
import "@shopify/polaris/build/esm/styles.css";

type Props = { children: ReactNode };

export function PolarisProvider({ children }: Props) {
  return <PolarisAppProvider i18n={en}>{children}</PolarisAppProvider>;
}
