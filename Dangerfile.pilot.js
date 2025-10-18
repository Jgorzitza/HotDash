// Dangerfile for pilot branch: fence writes to allowed areas only
const minimatch = require("minimatch");

const changed = [
  ...danger.git.created_files,
  ...danger.git.modified_files,
  ...danger.git.deleted_files,
];

const allowed = [
  "artifacts/pilot/**",
  "feedback/pilot/**",
  "scripts/**",
  "docs/runbooks/**",
  "reports/manager/**",
  "app/**"
];

function allowedFile(f) { return allowed.some(p => minimatch(f, p)); }
const offPath = changed.filter(f => !allowedFile(f));

if (offPath.length) {
  fail("Off-path changes in pilot branch: " + offPath.join(", "));
}

// Nudge for artifacts present in pilot dir
schedule(async () => {
  const today = new Date().toISOString().slice(0,10);
  message(`Pilot day context: ${today}. Ensure artifacts/pilot/${today} exists with hashes.`);
});
