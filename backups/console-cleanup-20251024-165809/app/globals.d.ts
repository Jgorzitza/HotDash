declare module "*.css";

import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare global {
  namespace JSX {
    // Allow Shopify Polaris web components (s-*) to be used without local typings.
    interface IntrinsicElements {
      [elemName: `s-${string}`]: DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}
