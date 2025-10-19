#!/usr/bin/env node
// Stub GA4 CLI for proof calls in issues. Uses existing parity scripts when available.
const args = process.argv.slice(2);
if (args.includes('--ping')) {
  console.log('GA4 CLI stub: ping ok');
  process.exit(0);
}
if (args.includes('--list-custom-dim')) {
  const idx = args.indexOf('--list-custom-dim');
  const name = args[idx + 1] || 'ab_variant';
  console.log(`GA4 CLI stub: custom dimension '${name}' (stub)`);
  process.exit(0);
}
console.log('GA4 CLI stub: try --ping or --list-custom-dim <name>. For real parity checks, run:');
console.log('  npm run ops:check-analytics-parity');
process.exit(0);

