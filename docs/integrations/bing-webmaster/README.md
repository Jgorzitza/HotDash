# Bing Webmaster Tools Integration

This integration provides site verification, sitemap submission, and search performance metrics collection from Bing Webmaster Tools.

## Features

- **Site Verification**: OAuth-based site ownership verification
- **Sitemap Submission**: Automatic sitemap submission to Bing
- **Search Performance**: Clicks, impressions, CTR, and position metrics
- **Query Performance**: Detailed query-level performance data
- **Multi-source Storage**: Metrics stored in `seo_search_console_metrics` table

## Setup

### 1. Bing Webmaster Tools API Registration

1. Go to [Microsoft Azure Portal](https://portal.azure.com/)
2. Create a new app registration
3. Configure OAuth redirect URI: `https://yourdomain.com/api/bing/callback`
4. Note down the Client ID and Client Secret

### 2. Environment Variables

Add to your `.env` file:

```bash
# Bing Webmaster Tools API
BING_CLIENT_ID=your_client_id_here
BING_CLIENT_SECRET=your_client_secret_here
BING_REDIRECT_URI=https://yourdomain.com/api/bing/callback
```

### 3. Site Verification

The integration supports meta tag verification:

1. Call the verification endpoint
2. Add the returned verification token to your site's `<head>` section:
   ```html
   <meta name="msvalidate.01" content="VERIFICATION_TOKEN_HERE" />
   ```
3. Complete verification in Bing Webmaster Tools

### 4. Sitemap Submission

Once verified, the integration automatically submits your sitemap:

```typescript
const integration = createBingIntegration({
  domain: "hotrodan.com",
  sitemapUrl: "https://hotrodan.com/sitemap.xml",
});

const result = await integration.setup();
```

## API Endpoints

### Site Verification

```typescript
// Start verification process
const verification = await integration.verifySite();

if (verification.verificationToken) {
  // Add meta tag to site
  console.log(`Add this meta tag: <meta name="msvalidate.01" content="${verification.verificationToken}" />`);
}
```

### Sitemap Submission

```typescript
// Submit sitemap
const sitemap = await integration.submitSitemap();
```

### Search Performance Metrics

```typescript
// Get search performance metrics
const metrics = await integration.getSearchMetrics(
  "2025-01-01",
  "2025-01-31"
);

// Store in database
await integration.storeMetrics(metrics.metrics || []);
```

### Query Performance

```typescript
// Get detailed query performance
const queries = await integration.getQueryPerformance(
  "2025-01-01",
  "2025-01-31",
  1000 // row limit
);
```

## Data Storage

Metrics are stored in the `seo_search_console_metrics` table with the following structure:

```sql
CREATE TABLE seo_search_console_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL, -- 'bing' or 'google'
  date DATE NOT NULL,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0, -- Click-through rate
  position DECIMAL(8,2) DEFAULT 0, -- Average position
  queries JSONB, -- Query-level data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Rate Limits

Bing Webmaster Tools API has the following rate limits:

- **Authentication**: 10 requests per minute
- **Site Management**: 5 requests per minute
- **Metrics**: 100 requests per day
- **Sitemaps**: 10 requests per minute

The integration includes automatic rate limiting and retry logic.

## Error Handling

The integration provides comprehensive error handling:

- **Authentication Errors**: Automatic token refresh
- **Rate Limiting**: Exponential backoff retry
- **Network Errors**: Retry with backoff
- **API Errors**: Detailed error messages

## Monitoring

Monitor the integration health:

```typescript
// Check if properly configured
const isConfigured = integration.isConfigured();

// Get client authentication status
const isAuthenticated = client.isAuthenticated();
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify Client ID and Secret
   - Check redirect URI matches exactly
   - Ensure OAuth scopes are correct

2. **Site Verification Failed**
   - Verify meta tag is in `<head>` section
   - Check token matches exactly
   - Wait 24-48 hours for verification

3. **Sitemap Submission Failed**
   - Ensure site is verified first
   - Check sitemap URL is accessible
   - Verify sitemap format is valid

4. **Metrics Not Available**
   - Allow 24-48 hours for data collection
   - Check date range is valid
   - Verify site has search traffic

### Debug Mode

Enable debug logging:

```typescript
// Set debug environment variable
process.env.BING_DEBUG = "true";
```

## Security

- **OAuth Tokens**: Stored securely, never logged
- **API Keys**: Environment variables only
- **Rate Limiting**: Prevents API abuse
- **HTTPS**: All communications encrypted

## Support

For issues with the Bing Webmaster Tools integration:

1. Check the logs for detailed error messages
2. Verify API credentials and permissions
3. Test with Bing Webmaster Tools web interface
4. Contact Microsoft support for API issues
