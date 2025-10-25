import { Banner } from "@shopify/polaris";
export function ValidationBanner({ errors, onDismiss }) {
    if (errors.length === 0)
        return null;
    return (<Banner tone="critical" onDismiss={onDismiss}>
      <p>
        <strong>Validation errors:</strong>
      </p>
      <ul>
        {errors.map((error, idx) => (<li key={idx}>
            <strong>{error.field}:</strong> {error.message}
          </li>))}
      </ul>
    </Banner>);
}
//# sourceMappingURL=ValidationBanner.js.map