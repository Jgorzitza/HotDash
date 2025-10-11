# Shopify Helpers + React Router 7 Integration

## Overview

This document outlines the updated Shopify helper configuration that aligns with embed-token mirroring and React Router 7 flows, following the current App Bridge configuration documented in the [@shopify/app-bridge-react package](https://www.npmjs.com/package/@shopify/app-bridge-react#configuration).

## Key Updates

### 1. Environment Configuration Utilities (`app/utils/env.server.ts`)

- **Purpose**: Centralized environment variable validation and configuration management
- **Features**:
  - Type-safe environment configuration interface
  - Validation for required Shopify environment variables
  - Mock mode detection for testing/development
  - Dynamic redirect URL generation
  - Environment-specific app URL handling

### 2. Updated Shopify App Configuration (`shopify.app.toml`)

- **Application URL**: Updated to use staging environment (`https://hotdash-staging.fly.dev`)
- **Redirect URLs**: Added proper auth callback support:
  - `/auth/callback` (React Router 7 pattern)
  - `/api/auth` (legacy support)
- **Embed Support**: Maintained `embedded = true` for Admin app integration

### 3. Enhanced App Bridge Integration (`app/routes/app.tsx`)

- **Mock Mode Support**: Visual indication when running in test/development mode
- **Improved Navigation**: Dashboard-focused navigation structure
- **Environment-Aware Loading**: Uses new environment utilities for auth bypass
- **Type Safety**: Proper TypeScript integration with React Router 7

### 4. Refactored Shopify Server Configuration (`app/shopify.server.ts`)

- **Configuration Validation**: Uses centralized environment utilities
- **Cleaner Export Pattern**: Simplified exports with configuration access
- **Error Handling**: Better error messages for missing configuration

## Usage Examples

### Environment Configuration

```typescript
import { getEnvironmentConfig, isMockMode } from "~/utils/env.server";

// Get validated configuration
const config = getEnvironmentConfig();

// Check for mock mode
const isTestMode = isMockMode(request);

// Generate auth redirect URLs
const redirectUrls = getAuthRedirectUrls("https://my-app.fly.dev");
```

### Mock Mode Testing

The system supports mock mode via:
- URL parameter: `?mock=1`
- Environment variable: `NODE_ENV=test`

This allows E2E testing without Shopify authentication.

### App Bridge Integration

The `AppProvider` is configured with:
- Proper API key from environment
- Embedded mode enabled
- Mock mode visual indication
- React Router 7 compatibility

## Testing

Unit tests cover:
- Environment configuration validation
- Mock mode detection
- Redirect URL generation
- Error handling for missing variables

Run tests with:
```bash
npm run test:unit -- tests/unit/env.server.spec.ts
```

## Future Considerations

1. **Session Token Mirroring**: The current session token tool in `/app/tools/session-token` provides embed token validation
2. **Extension Support**: Framework ready for Admin extensions in `extensions/` workspace
3. **Development Mode**: Dynamic URL handling supports local development servers
4. **Multi-Environment**: Configuration supports staging, production, and development environments

## Related Documentation

- [App Bridge React Configuration](https://www.npmjs.com/package/@shopify/app-bridge-react#configuration)
- [Shopify Admin Extensions](docs/dev/adminext-shopify.md)
- [Session Storage](docs/dev/session-storage.md)
