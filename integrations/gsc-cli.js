#!/usr/bin/env node
// Stub GSC CLI for proof calls in issues. This is a placeholder.
const args = process.argv.slice(2);
if (args.includes('--ping')) {
  console.log('GSC CLI stub: ping ok');
  process.exit(0);
}
if (args.includes('--export')) {
  console.log('GSC CLI stub: export (dry-run) ok');
  if (args.includes('--dry-run')) process.exit(0);
}
console.log('GSC CLI stub: try --ping or --export --dry-run. For telemetry planning, see docs/specs/hitl/seo-telemetry.md');
process.exit(0);

