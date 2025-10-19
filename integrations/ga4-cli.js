#!/usr/bin/env node
// GA4 CLI Stub: outputs sample metrics for a given view (dev-only)
const args = process.argv.slice(2);
const cmd = args[0] || 'sample';
if (cmd === 'sample') {
  const out = {
    timestamp: new Date().toISOString(),
    view: 'dev-staging',
    metrics: {
      sessions: 123,
      users: 98,
      pageviews: 456,
      conversions: 7,
      revenue: 1234.56
    }
  };
  console.log(JSON.stringify(out));
  process.exit(0);
} else {
  console.error('Unknown command');
  process.exit(2);
}
