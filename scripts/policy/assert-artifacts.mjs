import fs from "node:fs";
import path from "node:path";
const dir = process.argv[2] || "artifacts/pilot";
const today = new Date().toISOString().slice(0,10);
const p = path.join(dir, today);
if (!fs.existsSync(p)) { console.error("No artifacts for today:", p); process.exit(1); }
const files = fs.readdirSync(p);
if (!files.length) { console.error("Artifacts dir empty:", p); process.exit(1); }
console.log("Artifacts present:", files.length);
