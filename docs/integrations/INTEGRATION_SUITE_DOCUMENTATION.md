# Third-Party API Integration Suite Documentation

## Overview

The Third-Party API Integration Suite provides a comprehensive, type-safe, and robust system for integrating with external APIs. It includes error handling, rate limiting, circuit breaker patterns, health monitoring, and bulk operations.

## Architecture

### Core Components

1. **APIClient** - Base HTTP client with retry logic, rate limiting, and error handling
2. **IntegrationManager** - Orchestrates multiple API clients with circuit breakers and metrics
3. **Service Adapters** - Type-safe wrappers for specific APIs (Shopify, Publer, Chatwoot)
4. **Health Monitoring** - Real-time health checks and status reporting
5. **API Routes** - REST endpoints for integration management

### Key Features

- **Error Handling**: Comprehensive error handling with retry logic and exponential backoff
- **Rate Limiting**: Token bucket algorithm with configurable limits per service
- **Circuit Breaker**: Automatic failure detection and recovery
- **Health Monitoring**: Real-time health status and metrics
- **Bulk Operations**: Efficient batch processing
- **Type Safety**: Full TypeScript support with generated types
- **Logging**: Structured logging for debugging and monitoring

## Usage

### Basic API Client

```typescript
import { APIClient } from '~/services/integrations/api-client';

const client = new APIClient({
  baseURL: 'https://api.example.com',
  timeout: 30000,
  retries: 3,
  rateLimit: {
    maxRequestsPerSecond: 10,
    burstSize: 20,
  },
  auth: {
    type: 'bearer',
    token: 'your-token',
  },
});

const response = await client.get('/users');
if (response.success) {
  console.log(response.data);
} else {
  console.error(response.error);
}
```

### Service Adapters

#### Shopify Integration

```typescript
import { shopifyAdapter } from '~/services/integrations/shopify-adapter';

// Get products
const products = await shopifyAdapter.getProducts({
  limit: 50,
  status: 'active',
});

// Create a product
const newProduct = await shopifyAdapter.createProduct({
  title: 'New Product',
  product_type: 'Electronics',
  vendor: 'My Store',
});

// Update inventory
await shopifyAdapter.adjustInventoryLevel(
  'inventory_item_id',
  'location_id',
  10
);
```

#### Publer Integration

```typescript
import { publerAdapter } from '~/services/integrations/publer-adapter';

// Schedule a post
const job = await publerAdapter.schedulePost({
  text: 'Check out our new product!',
  accountIds: ['account_1', 'account_2'],
  scheduledAt: '2024-01-01T10:00:00Z',
});

// Check job status
const status = await publerAdapter.getJobStatus(job.data.job_id);
```

#### Chatwoot Integration

```typescript
import { chatwootAdapter } from '~/services/integrations/chatwoot-adapter';

// Get conversations
const conversations = await chatwootAdapter.getConversations({
  status: 'open',
  assignee_type: 'me',
});

// Send a message
await chatwootAdapter.sendMessage(conversationId, {
  content: 'Hello! How can I help you?',
  message_type: 1, // outgoing
});
```

### Integration Manager

```typescript
import { integrationManager } from '~/services/integrations/integration-manager';

// Execute a request with circuit breaker protection
const response = await integrationManager.executeRequest('shopify', (client) =>
  client.get('/products')
);

// Bulk operations
const results = await integrationManager.executeBulkOperation([
  {
    integrationName: 'shopify',
    requestFn: (client) => client.get('/products'),
  },
  {
    integrationName: 'publer',
    requestFn: (client) => client.get('/accounts'),
  },
]);

// Health monitoring
const healthStatus = await integrationManager.getHealthStatus();
const metrics = integrationManager.getMetrics();
```

## Configuration

### Environment Variables

```bash
# Shopify
SHOPIFY_SHOP_DOMAIN=your-shop.myshopify.com
SHOPIFY_ACCESS_TOKEN=your-access-token

# Publer
PUBLER_API_KEY=your-api-key
PUBLER_WORKSPACE_ID=your-workspace-id

# Chatwoot
CHATWOOT_BASE_URL=https://app.chatwoot.com
CHATWOOT_API_TOKEN=your-api-token
CHATWOOT_ACCOUNT_ID=your-account-id
```

### Rate Limiting Configuration

```typescript
const client = new APIClient({
  baseURL: 'https://api.example.com',
  rateLimit: {
    maxRequestsPerSecond: 5,  // Maximum requests per second
    burstSize: 15,           // Burst capacity
  },
});
```

### Circuit Breaker Configuration

```typescript
integrationManager.registerIntegration({
  name: 'my-service',
  client: myClient,
  circuitBreaker: {
    failureThreshold: 5,      // Failures before opening
    recoveryTimeout: 30000,   // Time before attempting recovery
    monitoringPeriod: 60000,  // Time window for failure counting
  },
});
```

## API Endpoints

### Health Monitoring

```bash
# Get all integration health status
GET /api/integrations/health

# Get specific service health
GET /api/integrations/shopify/health
GET /api/integrations/publer/health
GET /api/integrations/chatwoot/health

# Get metrics
GET /api/integrations/metrics
```

### Bulk Operations

```bash
# Execute bulk operations
POST /api/integrations/bulk
Content-Type: application/json

{
  "operations": [
    {
      "integrationName": "shopify",
      "requestFn": "getProducts"
    },
    {
      "integrationName": "publer",
      "requestFn": "getAccounts"
    }
  ]
}
```

### Management

```bash
# Reset metrics
POST /api/integrations/reset-metrics
Content-Type: application/json

{
  "integrationName": "shopify"  // Optional, resets all if omitted
}

# Reset circuit breaker
POST /api/integrations/circuit-breaker/reset
Content-Type: application/json

{
  "integrationName": "shopify"
}
```

## Error Handling

### Error Types

```typescript
interface APIError {
  code: string;           // Error code (e.g., 'HTTP_404', 'NETWORK_ERROR')
  message: string;        // Human-readable error message
  status?: number;       // HTTP status code
  details?: any;         // Additional error details
  retryable: boolean;    // Whether the error is retryable
}
```

### Common Error Codes

- `HTTP_4xx` - Client errors (400-499)
- `HTTP_5xx` - Server errors (500-599)
- `NETWORK_ERROR` - Network connectivity issues
- `TIMEOUT_ERROR` - Request timeout
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded
- `CIRCUIT_BREAKER_OPEN` - Circuit breaker is open
- `AUTHENTICATION_ERROR` - Authentication failed
- `VALIDATION_ERROR` - Request validation failed

### Retry Logic

The system automatically retries requests on:
- Network errors
- Server errors (5xx)
- Rate limiting (429)
- Timeout errors

Retry configuration:
- Maximum retries: 3 (configurable)
- Exponential backoff: 1s, 2s, 4s
- Maximum backoff: 30s

## Monitoring and Metrics

### Health Status

```typescript
interface HealthCheck {
  service: string;        // Service name
  healthy: boolean;       // Health status
  latency?: number;     // Response latency in ms
  error?: string;        // Error message if unhealthy
  lastChecked: string;  // ISO timestamp
}
```

### Metrics

```typescript
interface IntegrationMetrics {
  name: string;                    // Integration name
  totalRequests: number;          // Total requests made
  successfulRequests: number;     // Successful requests
  failedRequests: number;         // Failed requests
  averageLatency: number;         // Average response time
  lastError?: string;            // Last error message
  lastSuccess?: string;          // Last success timestamp
  circuitBreakerOpen: boolean;   // Circuit breaker status
}
```

### Performance Monitoring

The integration suite provides comprehensive performance monitoring:

- Request/response latency tracking
- Success/failure rate monitoring
- Circuit breaker status
- Rate limiting statistics
- Error categorization and counting

## Best Practices

### 1. Error Handling

Always check the response success status:

```typescript
const response = await shopifyAdapter.getProducts();
if (response.success) {
  // Handle success
  console.log(response.data);
} else {
  // Handle error
  console.error(response.error);
  if (response.error.retryable) {
    // Implement retry logic
  }
}
```

### 2. Rate Limiting

Respect API rate limits and use the built-in rate limiting:

```typescript
// The client automatically handles rate limiting
const client = new APIClient({
  rateLimit: {
    maxRequestsPerSecond: 2,  // Shopify limit
    burstSize: 10,
  },
});
```

### 3. Circuit Breaker

Monitor circuit breaker status:

```typescript
const isOpen = integrationManager.getCircuitBreakerStatus('shopify');
if (isOpen) {
  // Handle circuit breaker open state
  console.log('Shopify integration is temporarily unavailable');
}
```

### 4. Bulk Operations

Use bulk operations for efficiency:

```typescript
const results = await integrationManager.executeBulkOperation([
  { integrationName: 'shopify', requestFn: (client) => client.get('/products') },
  { integrationName: 'publer', requestFn: (client) => client.get('/accounts') },
]);

console.log(`Successful: ${results.summary.successful}`);
console.log(`Failed: ${results.summary.failed}`);
```

### 5. Health Monitoring

Implement health monitoring:

```typescript
// Check health status
const health = await integrationManager.getHealthStatus();
const unhealthyServices = health.filter(h => !h.healthy);

if (unhealthyServices.length > 0) {
  console.warn('Unhealthy services:', unhealthyServices);
}
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify API keys and tokens
   - Check token expiration
   - Ensure proper headers

2. **Rate Limiting**
   - Reduce request frequency
   - Increase burst size
   - Implement exponential backoff

3. **Circuit Breaker Open**
   - Check service health
   - Reset circuit breaker
   - Investigate root cause

4. **Network Errors**
   - Check connectivity
   - Verify DNS resolution
   - Check firewall settings

### Debugging

Enable detailed logging:

```typescript
// Set log level
process.env.LOG_LEVEL = 'debug';

// Check metrics
const metrics = integrationManager.getMetrics();
console.log('Integration metrics:', metrics);
```

### Performance Optimization

1. **Connection Pooling**: Reuse HTTP connections
2. **Request Batching**: Combine multiple requests
3. **Caching**: Cache frequently accessed data
4. **Async Operations**: Use Promise.all for parallel requests

## Security Considerations

### API Key Management

- Store API keys in environment variables
- Use different keys for different environments
- Rotate keys regularly
- Monitor key usage

### Data Protection

- Encrypt sensitive data in transit
- Implement proper authentication
- Use HTTPS for all API calls
- Log security events

### Rate Limiting

- Implement per-user rate limiting
- Monitor for abuse
- Set appropriate limits
- Handle rate limit errors gracefully

## Testing

### Unit Tests

```typescript
import { APIClient } from '~/services/integrations/api-client';

describe('APIClient', () => {
  it('should handle successful requests', async () => {
    const client = new APIClient({
      baseURL: 'https://api.example.com',
    });
    
    const response = await client.get('/test');
    expect(response.success).toBe(true);
  });
});
```

### Integration Tests

```typescript
describe('Shopify Integration', () => {
  it('should fetch products', async () => {
    const products = await shopifyAdapter.getProducts();
    expect(products.success).toBe(true);
  });
});
```

### Mock Testing

```typescript
// Mock the API client for testing
jest.mock('~/services/integrations/api-client');

const mockClient = {
  get: jest.fn().mockResolvedValue({
    success: true,
    data: { products: [] },
  }),
};
```

## Deployment

### Environment Setup

1. Set environment variables
2. Configure rate limits
3. Set up monitoring
4. Test integrations

### Monitoring

- Set up health checks
- Configure alerts
- Monitor metrics
- Track performance

### Scaling

- Use connection pooling
- Implement caching
- Monitor resource usage
- Scale based on demand

## Support

For issues and questions:

1. Check the logs for error details
2. Verify configuration
3. Test individual integrations
4. Contact the development team

## Changelog

### Version 1.0.0
- Initial release
- Shopify, Publer, and Chatwoot integrations
- Basic error handling and retry logic
- Health monitoring
- Rate limiting

### Future Enhancements
- Additional service integrations
- Advanced caching
- Real-time monitoring dashboard
- Automated testing suite
