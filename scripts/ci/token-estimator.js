#!/usr/bin/env node
const fs = require('fs');
const args = process.argv.slice(2);
let max = 20000;
const idx = args.indexOf('--max'); if (idx !== -1) { max = parseInt(args[idx+1],10); args.splice(idx,2); }
let total=0;
for (const p of args) total += Math.ceil(fs.readFileSync(p,'utf8').length/4);
console.log(`Estimated tokens: ${total} (limit ${max})`);
if (total>max) { console.error('Token estimate exceeds limit'); process.exit(1); }
