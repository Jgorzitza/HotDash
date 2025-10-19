#!/usr/bin/env node
// Minimal GA4 adapter CLI stub for dev proofs (no secrets used)
// Usage:
//  node integrations/ga4-cli.js --ping
//  node integrations/ga4-cli.js --list-custom-dim ab_variant
const args = process.argv.slice(2);
const now = new Date().toISOString();
function out(obj){
  process.stdout.write(JSON.stringify(obj)+"\n");
}
if(args.includes('--ping')){
  out({tool:"ga4-cli", action:"ping", ok:true, timestamp:now});
  process.exit(0);
}
const listIdx = args.indexOf('--list-custom-dim');
if(listIdx !== -1){
  const name = args[listIdx+1] || null;
  out({tool:"ga4-cli", action:"list-custom-dim", name, ok:true, timestamp:now});
  process.exit(0);
}
out({tool:"ga4-cli", ok:false, error:"unknown args", args, timestamp:now});
process.exit(1);

