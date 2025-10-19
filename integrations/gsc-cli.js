#!/usr/bin/env node
// Minimal GSC adapter CLI stub for dev proofs (no secrets used)
// Usage:
//  node integrations/gsc-cli.js --ping
//  node integrations/gsc-cli.js --export --dry-run
const args = process.argv.slice(2);
const now = new Date().toISOString();
function out(obj){
  process.stdout.write(JSON.stringify(obj)+"\n");
}
if(args.includes('--ping')){
  out({tool:"gsc-cli", action:"ping", ok:true, timestamp:now});
  process.exit(0);
}
if(args.includes('--export') && args.includes('--dry-run')){
  out({tool:"gsc-cli", action:"export", dryRun:true, ok:true, timestamp:now});
  process.exit(0);
}
out({tool:"gsc-cli", ok:false, error:"unknown args", args, timestamp:now});
process.exit(1);

