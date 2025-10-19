#!/usr/bin/env node
// Lightweight local-friendly Lighthouse runner stub
// Skips in mock/local mode to avoid starting a server

const mock = process.env.DASHBOARD_USE_MOCK !== '0';
if (mock) {
  console.log('[lighthouse] Skipping in mock mode.');
  process.exit(0);
}

console.log('[lighthouse] No runner configured for live mode in this environment. Skipping.');
process.exit(0);
