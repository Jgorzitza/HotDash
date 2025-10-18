import fs from "node:fs";
const fp = process.argv[2];
if (!fp || !fs.existsSync(fp)) {
  console.error("usage: node scripts/policy/cred-proof.mjs <feedback.md>"); process.exit(1);
}
const s = fs.readFileSync(fp, "utf8");
const must = [
  "Repo docs:", "MCP secret stores:", "Environment/CI:",
  "App config:", "Recent changes:"
];
if (!must.every(h => s.includes(h))) {
  console.error("Credential Retrieval Protocol proof is incomplete."); process.exit(1);
}
console.log("Credential proof present.");
